import { NextResponse } from 'next/server'
import { NextResponse } from 'next/server'
import { query } from '../../../lib/server-only'
import CompetitorTrackingService from '../../../lib/competitor-tracker'

export const dynamic = 'force-dynamic'

function normalizeDomain(d: string) {
  try {
    return d.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
  } catch {
    return d
  }
}

export async function GET() {
  try {
    // Show last run and counts for the past day
    const lastRun = await query(`
      SELECT MAX(last_updated) AS last_updated, COUNT(*) AS competitor_count
      FROM solar_competitors
    `)
    const lastChecked = await query(`
      SELECT MAX(last_checked) AS last_checked, COUNT(*) AS ranking_rows
      FROM solar_competitor_rankings
    `)

    return NextResponse.json({
      status: 'ready',
      competitorsTracked: Number(lastRun.rows?.[0]?.competitor_count || 0),
      lastCompetitorUpdate: lastRun.rows?.[0]?.last_updated || null,
      lastRankingCheck: lastChecked.rows?.[0]?.last_checked || null,
      rankingRows: Number(lastChecked.rows?.[0]?.ranking_rows || 0)
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST() {
  try {
    // Load business configuration: website (domain), service areas, target keywords (+ competitors per area)
    const configResult = await query(`
      SELECT website, website_url, target_keywords, service_areas
      FROM solar_business_info
      ORDER BY created_at DESC
      LIMIT 1
    `)
    if (configResult.rows.length === 0) {
      return NextResponse.json({ error: 'Business configuration not found' }, { status: 400 })
    }

    const config = configResult.rows[0]
    const yourDomain = (config.website || config.website_url)
      ? new URL((config.website || config.website_url)).hostname.replace('www.', '')
      : 'your-domain.com'

    // Parse target keywords structure { global, areas, competitors }
    let globalKeywords: string[] = []
    let areaKeywords: Record<string, string[]> = {}
    let areaCompetitors: Record<string, string[]> = {}

    if (config.target_keywords) {
      if (Array.isArray(config.target_keywords)) {
        globalKeywords = config.target_keywords as string[]
      } else if (typeof config.target_keywords === 'object') {
        const tk = config.target_keywords as any
        globalKeywords = Array.isArray(tk.global) ? tk.global : []
        areaKeywords = typeof tk.areas === 'object' && tk.areas ? tk.areas : {}
        areaCompetitors = typeof tk.competitors === 'object' && tk.competitors ? tk.competitors : {}
      }
    }

    const serviceAreas: string[] = Array.isArray(config.service_areas) && config.service_areas.length
      ? config.service_areas
      : ['United States']

    const processed: Array<{ area: string; competitors: number; rankings: number }>
      = []

    // Iterate each service area and run discovery + ranking checks
    for (const area of serviceAreas) {
      const keywords = Array.from(new Set([...(globalKeywords || []), ...((areaKeywords?.[area] || []) as string[])]))
      const effectiveKeywords = keywords.length > 0 ? keywords : ['solar installation', 'solar panels']

      // Build competitor service for this area
      const tracker = new CompetitorTrackingService(effectiveKeywords, area, yourDomain)

      // Discover new competitors for this area
      const discovered = await tracker.discoverCompetitors()

      // Merge manual competitors configured for this area
      const manualList = Array.isArray(areaCompetitors?.[area]) ? (areaCompetitors[area] as string[]) : []
      const have = new Set(discovered.map(c => c.domain))
      for (const raw of manualList) {
        const domain = normalizeDomain(String(raw))
        if (!domain || have.has(domain) || domain === yourDomain) continue
        const id = domain.replace(/[^a-z0-9]/g, '-')
        discovered.push({
          id,
          name: domain.replace(/\..*$/, '').replace(/-/g, ' ').replace(/^\w/, (c: any) => c.toUpperCase()),
          domain,
          location: area,
          businessType: 'solar_installer',
          lastUpdated: new Date()
        })
        have.add(domain)
      }

      if (discovered.length === 0) {
        processed.push({ area, competitors: 0, rankings: 0 })
        continue
      }

      // Upsert competitors with area-specific location
      for (const c of discovered) {
        await query(
          `INSERT INTO solar_competitors (id, competitor_name, domain, location, business_type, last_updated)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO UPDATE SET
             competitor_name = EXCLUDED.competitor_name,
             domain = EXCLUDED.domain,
             location = EXCLUDED.location,
             business_type = EXCLUDED.business_type,
             last_updated = EXCLUDED.last_updated`,
          [c.id, c.name, c.domain, area, c.businessType, c.lastUpdated]
        )
      }

      // Track rankings for all discovered competitors in this area
      const rankings = await tracker.trackCompetitorRankings(discovered)

      if (rankings.length > 0) {
        // Replace old rankings for these competitors to keep table current
        await query('DELETE FROM solar_competitor_rankings WHERE competitor_id = ANY($1)', [discovered.map(d => d.id)])
        for (const r of rankings) {
          await query(
            `INSERT INTO solar_competitor_rankings (competitor_id, keyword, position, ranking_url, page_title, estimated_traffic, location, last_checked)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [r.competitorId, r.keyword, r.position, r.url, r.title, r.estimatedTraffic, area, r.lastChecked]
          )
        }
      }

      processed.push({ area, competitors: discovered.length, rankings: rankings.length })

      // Small delay between areas to avoid rate limits
      await new Promise(res => setTimeout(res, 1000))
    }

    return NextResponse.json({
      success: true,
      processed,
      totalAreas: serviceAreas.length,
      totalCompetitors: processed.reduce((s, a) => s + a.competitors, 0),
      totalRankings: processed.reduce((s, a) => s + a.rankings, 0),
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Competitor schedule error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
