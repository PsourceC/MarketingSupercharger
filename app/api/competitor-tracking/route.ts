import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../lib/server-only'
import CompetitorTrackingService from '../../lib/competitor-tracker'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get business configuration
    const configResult = await query(`
      SELECT website, target_keywords, service_areas
      FROM solar_business_info
      ORDER BY created_at DESC
      LIMIT 1
    `)

    if (configResult.rows.length === 0) {
      return NextResponse.json({ 
        error: 'Business configuration not found. Please complete setup first.' 
      }, { status: 400 })
    }

    const config = configResult.rows[0]
    let keywords: string[] = ['solar installation', 'solar panels']
    let manualCompetitors: string[] = []
    if (config.target_keywords) {
      if (Array.isArray(config.target_keywords)) {
        keywords = config.target_keywords
      } else if (typeof config.target_keywords === 'object') {
        const global = Array.isArray(config.target_keywords.global) ? config.target_keywords.global : []
        const areas = config.target_keywords.areas && typeof config.target_keywords.areas === 'object'
          ? Object.values(config.target_keywords.areas).flat().filter(Boolean)
          : []
        keywords = [...new Set([...(global as string[]), ...(areas as string[])])]
        if (keywords.length === 0) keywords = ['solar installation', 'solar panels']
        const comps = config.target_keywords.competitors && typeof config.target_keywords.competitors === 'object'
          ? config.target_keywords.competitors
          : {}
        const areaKeys = Object.keys(comps)
        manualCompetitors = areaKeys.length ? Array.from(new Set(areaKeys.flatMap((k: string) => comps[k] || []))) : []
      }
    }
    const location = config.service_areas?.[0] || 'United States'
    const yourDomain = (config.website || config.website_url) ? new URL((config.website || config.website_url)).hostname.replace('www.', '') : 'your-domain.com'

    const competitorService = new CompetitorTrackingService(keywords, location, yourDomain)

    // Check for recent data (within last 6 hours for competitor data)
    const recentDataResult = await query(`
      SELECT 
        c.*,
        array_agg(
          json_build_object(
            'keyword', cr.keyword,
            'position', cr.position,
            'url', cr.ranking_url,
            'title', cr.page_title,
            'estimatedTraffic', cr.estimated_traffic,
            'lastChecked', cr.last_checked
          )
        ) as rankings
      FROM solar_competitors c
      LEFT JOIN solar_competitor_rankings cr ON c.id = cr.competitor_id
      WHERE c.last_updated > NOW() - INTERVAL '6 hours'
      GROUP BY c.id
      ORDER BY c.last_updated DESC
    `)

    if (recentDataResult.rows.length > 0) {
      const cachedDomains = new Set(recentDataResult.rows.map((row: any) => row.domain))
      const normalize = (d: string) => d.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
      const missingManual = (manualCompetitors || []).some((d: string) => !cachedDomains.has(normalize(String(d))))
      if (!missingManual) {
        // Return cached competitor data
        const competitors = recentDataResult.rows.map(row => ({
          id: row.id,
          name: row.competitor_name,
          domain: row.domain,
          location: row.location,
          businessType: row.business_type,
          lastUpdated: new Date(row.last_updated)
        }))

      const rankings = recentDataResult.rows.flatMap(row => 
        (row.rankings || []).map((ranking: any) => ({
          competitorId: row.id,
          keyword: ranking.keyword,
          position: ranking.position,
          url: ranking.url || '',
          title: ranking.title || '',
          location: location,
          estimatedTraffic: ranking.estimatedTraffic || 0,
          lastChecked: new Date(ranking.lastChecked)
        }))
      )

        const analyses = await competitorService.analyzeCompetitors(competitors, rankings)
        const summary = await competitorService.generateCompetitorSummary(analyses)
        const insights = await competitorService.getCompetitorInsights(analyses)

        return NextResponse.json({
          competitors: analyses,
          summary,
          insights,
          fromCache: true
        })
      }
    }

    // Perform fresh competitor analysis
    console.log('Starting fresh competitor discovery...')
    let competitors = await competitorService.discoverCompetitors()

    // Merge in manually specified competitor domains
    const normalizeDomain = (d: string) => d.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
    const have = new Set(competitors.map(c => c.domain))
    for (const raw of manualCompetitors || []) {
      const domain = normalizeDomain(String(raw))
      if (!domain || have.has(domain) || domain === yourDomain) continue
      const id = domain.replace(/[^a-z0-9]/g, '-')
      competitors.push({ id, name: domain.replace(/\..*$/, '').replace(/-/g, ' ').replace(/^\w/, (c:any) => c.toUpperCase()), domain, location, businessType: 'solar_installer', lastUpdated: new Date() })
      have.add(domain)
    }

    if (competitors.length === 0) {
      return NextResponse.json({
        competitors: [],
        summary: {
          totalCompetitors: 0,
          averagePosition: 0,
          marketShare: 0,
          topCompetitors: [],
          keywordGaps: [],
          lastUpdated: new Date()
        },
        insights: [],
        message: 'No competitors found. This may indicate a niche market or data collection issues.'
      })
    }

    // Store competitors in database
    for (const competitor of competitors) {
      await query(`
        INSERT INTO solar_competitors (
          id, competitor_name, domain, location, business_type, last_updated
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) 
        DO UPDATE SET
          competitor_name = EXCLUDED.competitor_name,
          domain = EXCLUDED.domain,
          location = EXCLUDED.location,
          business_type = EXCLUDED.business_type,
          last_updated = EXCLUDED.last_updated
      `, [
        competitor.id,
        competitor.name,
        competitor.domain,
        competitor.location,
        competitor.businessType,
        competitor.lastUpdated
      ])
    }

    console.log('Tracking competitor rankings...')
    const rankings = await competitorService.trackCompetitorRankings(competitors)

    // Store rankings in database
    await query('DELETE FROM solar_competitor_rankings WHERE competitor_id = ANY($1)', 
      [competitors.map(c => c.id)])

    for (const ranking of rankings) {
      await query(`
        INSERT INTO solar_competitor_rankings (
          competitor_id, keyword, position, ranking_url, page_title, 
          estimated_traffic, location, last_checked
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        ranking.competitorId,
        ranking.keyword,
        ranking.position,
        ranking.url,
        ranking.title,
        ranking.estimatedTraffic,
        ranking.location,
        ranking.lastChecked
      ])
    }

    const analyses = await competitorService.analyzeCompetitors(competitors, rankings)
    const summary = await competitorService.generateCompetitorSummary(analyses)
    const insights = await competitorService.getCompetitorInsights(analyses)

    return NextResponse.json({
      competitors: analyses,
      summary,
      insights,
      fromCache: false
    })

  } catch (error: any) {
    console.error('Competitor tracking error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch competitor data',
      details: error.message 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, competitorId } = await request.json()

    if (action === 'refresh') {
      // Clear all competitor data to force refresh
      await query('DELETE FROM solar_competitor_rankings')
      await query('DELETE FROM solar_competitors')
      
      return NextResponse.json({ 
        message: 'Competitor data cache cleared. Next request will fetch fresh data.' 
      })
    }

    if (action === 'remove' && competitorId) {
      // Remove specific competitor
      await query('DELETE FROM solar_competitor_rankings WHERE competitor_id = $1', [competitorId])
      await query('DELETE FROM solar_competitors WHERE id = $1', [competitorId])
      
      return NextResponse.json({ 
        message: 'Competitor removed successfully.' 
      })
    }

    return NextResponse.json({ 
      error: 'Invalid action' 
    }, { status: 400 })

  } catch (error: any) {
    console.error('Competitor action error:', error)
    return NextResponse.json({ 
      error: 'Failed to perform competitor action',
      details: error.message 
    }, { status: 500 })
  }
}
