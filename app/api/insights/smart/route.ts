import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../../lib/server-only'

export const dynamic = 'force-dynamic'

// Helper to estimate volume when impressions are unavailable
function estimateVolume(keyword: string, area: string) {
  const base: Record<string, number> = {
    'solar installation': 5000,
    'best solar company': 2500,
    'solar panels': 8000,
    'solar installer near me': 4500,
    'affordable solar': 2200,
    'cheap solar': 1800,
    'top rated solar installers': 1600,
    'tesla powerwall': 4000,
    'home battery backup': 2600,
    enphase: 1200,
    'rec solar panels': 900,
    'solar rebates': 3000,
    'solar tax credit': 2800,
    'solar financing': 2000,
    'net metering': 1500,
  }
  const key = Object.keys(base).find(b => keyword.toLowerCase().startsWith(b)) || 'solar installation'
  let loc = 1.0
  if (/austin/i.test(area)) loc = 1.2
  if (/round rock|cedar park|georgetown|leander|pflugerville|hutto/i.test(area)) loc = 0.6
  return Math.round((base[key] || 1000) * loc)
}

function ctrByPosition(pos: number) {
  if (pos <= 1) return 31.7
  if (pos <= 2) return 24.7
  if (pos <= 3) return 18.7
  if (pos <= 4) return 13.1
  if (pos <= 5) return 9.5
  if (pos <= 10) return 2.2
  if (pos <= 20) return 1.0
  if (pos <= 50) return 0.5
  return 0.1
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const areaParam = searchParams.get('area')
    const limit = Number(searchParams.get('limit') || '10')

    const cfg = await query(
      `SELECT website, website_url, service_areas FROM solar_business_info ORDER BY created_at DESC LIMIT 1`
    )
    const domain = (cfg.rows?.[0]?.website || cfg.rows?.[0]?.website_url)
      ? new URL((cfg.rows?.[0]?.website || cfg.rows?.[0]?.website_url)).hostname.replace('www.', '')
      : ''

    // Determine target area
    const areas: string[] = Array.isArray(cfg.rows?.[0]?.service_areas) && cfg.rows[0].service_areas.length
      ? cfg.rows[0].service_areas
      : []

    const targetArea = areaParam || areas[0] || ''

    // Load your rankings by keyword for the area (last 60 days)
    const yourRows = await query(
      `SELECT kr.keyword,
              AVG(COALESCE(kr.ranking_position,0)) AS avg_pos,
              SUM(COALESCE(kr.impressions,0)) AS impressions,
              SUM(COALESCE(kr.clicks,0)) AS clicks
       FROM solar_keyword_rankings kr
       JOIN solar_locations l ON l.id = kr.location_id
       WHERE l.location_name = $1 AND kr.created_at >= NOW() - INTERVAL '60 days'
       GROUP BY kr.keyword`,
      [targetArea]
    )

    // Competitor best positions for the same area/keywords
    const compRows = await query(
      `WITH ranked AS (
         SELECT cr.keyword,
                cr.position,
                c.competitor_name,
                c.domain,
                ROW_NUMBER() OVER (PARTITION BY cr.keyword ORDER BY cr.position ASC NULLS LAST) AS rn
         FROM solar_competitor_rankings cr
         JOIN solar_competitors c ON c.id = cr.competitor_id
         WHERE cr.location = $1 AND cr.last_checked >= NOW() - INTERVAL '72 hours'
       )
       SELECT keyword,
              competitor_name AS leader_name,
              domain AS leader_domain,
              position AS best_pos
       FROM ranked
       WHERE rn = 1`,
      [targetArea]
    )

    const byKeyword: Record<string, any> = {}
    for (const r of yourRows.rows) {
      const k = String(r.keyword)
      byKeyword[k] = {
        keyword: k,
        ourPosition: r.avg_pos ? Math.round(Number(r.avg_pos)) : 0,
        impressions: Number(r.impressions || 0),
        clicks: Number(r.clicks || 0),
      }
    }
    for (const r of compRows.rows) {
      const k = String(r.keyword)
      if (!byKeyword[k]) byKeyword[k] = { keyword: k, ourPosition: 0, impressions: 0, clicks: 0 }
      byKeyword[k].leaderPosition = r.best_pos ? Number(r.best_pos) : 0
      byKeyword[k].leader = r.leader_name || r.leader_domain || 'Competitor'
    }

    // Fallback: if no keywords were found for the area, derive from competitor data keywords
    if (Object.keys(byKeyword).length === 0) {
      const allComp = await query(
        `SELECT DISTINCT cr.keyword
         FROM solar_competitor_rankings cr
         WHERE cr.location = $1 AND cr.last_checked >= NOW() - INTERVAL '72 hours'
         LIMIT 30`,
        [targetArea]
      )
      for (const r of allComp.rows) {
        const k = String(r.keyword)
        byKeyword[k] = { keyword: k, ourPosition: 0, impressions: 0, clicks: 0 }
      }
    }

    // Compute volumes and gaps
    const items = Object.values(byKeyword).map((it: any) => {
      const volume = it.impressions > 0 ? Number(it.impressions) : estimateVolume(it.keyword, targetArea)
      const our = it.ourPosition > 0 ? it.ourPosition : 50
      const inferredLeader = Math.max(1, Math.min(10, Math.round(our / 2)))
      const leader = it.leaderPosition && it.leaderPosition > 0 ? it.leaderPosition : inferredLeader
      const gap = Math.max(0, our - leader)
      const potentialClicks = Math.max(0, Math.round(volume * ((ctrByPosition(leader) - ctrByPosition(our)) / 100)))
      return {
        keyword: it.keyword,
        volume,
        ourPosition: our,
        leader: it.leader || null,
        leaderPosition: leader,
        gap,
        potentialClicks,
      }
    })

    // Rank by opportunity: higher volume and bigger positive gap
    const opportunities = items
      .filter(x => x.gap > 0)
      .sort((a, b) => (b.potentialClicks - a.potentialClicks) || (b.gap - a.gap) || (a.ourPosition - b.ourPosition))
      .slice(0, limit)

    // Quick wins: within striking distance (our <= 15 and gap <= 3, volume decent)
    const quickWins = items
      .filter(x => x.ourPosition > 0 && x.ourPosition <= 15 && x.gap > 0 && x.gap <= 3 && x.volume >= 1000)
      .sort((a, b) => (b.volume - a.volume) || (a.ourPosition - b.ourPosition))
      .slice(0, Math.max(3, Math.min(5, limit)))

    // Threats: leader far ahead and our position is weak (> 20) on high volume
    const threats = items
      .filter(x => x.ourPosition >= 20 && x.leaderPosition <= 5 && x.volume >= 2000)
      .sort((a, b) => (b.volume - a.volume) || (a.leaderPosition - b.leaderPosition))
      .slice(0, Math.max(3, Math.min(5, limit)))

    // Compute recommended additional keywords for this area (not yet tracked)
    const existing = new Set(items.map(i => i.keyword))
    const candidateBase = [
      'solar installation',
      'best solar company',
      'solar panels',
      'solar installer near me',
      'affordable solar',
      'cheap solar',
      'top rated solar installers',
      'tesla powerwall',
      'home battery backup',
      'enphase',
      'rec solar panels',
      'solar rebates',
      'solar tax credit',
      'solar financing',
      'net metering',
    ]
    const compIndex: Record<string, number> = {}
    for (const r of compRows.rows) {
      const k = String(r.keyword)
      const current = compIndex[k] || 0
      compIndex[k] = Math.max(current, r.best_pos ? 1 : 0) // presence indicator; detailed counts require another query
    }
    const recommendedKeywords = candidateBase
      .filter(k => !existing.has(k))
      .map(k => {
        const volume = estimateVolume(k, targetArea)
        const competitorCount = compIndex[k] ? 5 : 3
        const opportunity = Math.max(0, Math.min(100, Math.round(volume / 120) - Math.min(60, competitorCount * 10)))
        return { keyword: k, estimatedVolume: volume, competitorCount, opportunity }
      })
      .sort((a, b) => b.opportunity - a.opportunity)
      .slice(0, 8)

    // Recommended actions per top opportunity
    const recommendations = opportunities.slice(0, 5).map(o => ({
      area: targetArea,
      keyword: o.keyword,
      suggestions: [
        {
          type: 'gmb_post',
          title: `Why choose us for ${o.keyword}`,
          endpoint: '/api/gmb-posts',
          method: 'POST',
          payload: { type: 'service', business: domain },
          followUp: {
            endpoint: '/api/gmb-posts/schedule',
            method: 'POST',
            payload: {
              title: `#1 choice for ${o.keyword} in ${targetArea}`,
              content: `We help ${targetArea} homeowners with ${o.keyword}. Book a free solar consultation today.`,
              scheduleDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            }
          }
        },
        {
          type: 'content_update',
          title: `Create landing page section for ${o.keyword} (${targetArea})`,
          details: 'Add H1/H2 matching search intent, FAQ schema, local testimonials, and internal links from related posts.'
        }
      ]
    }))

    return NextResponse.json({
      area: targetArea,
      generatedAt: new Date().toISOString(),
      keywordsAnalyzed: items.length,
      opportunities,
      quickWins,
      threats,
      recommendedKeywords,
      recommendations
    })
  } catch (e: any) {
    console.error('GET /api/insights/smart error:', e)
    return NextResponse.json({ error: 'Failed to generate insights', details: e.message }, { status: 500 })
  }
}
