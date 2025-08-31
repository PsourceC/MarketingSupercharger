import { NextResponse } from 'next/server'
import { query } from '../../../lib/server-only'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const res = await query(`
      SELECT 
        l.location_name AS area,
        kr.keyword,
        AVG(COALESCE(kr.ranking_position, 0)) AS avg_position,
        SUM(COALESCE(kr.clicks, 0)) AS clicks,
        SUM(COALESCE(kr.impressions, 0)) AS impressions,
        CASE WHEN SUM(COALESCE(kr.impressions,0)) > 0 
             THEN ROUND(SUM(COALESCE(kr.clicks,0))::numeric * 100 / NULLIF(SUM(COALESCE(kr.impressions,0)),0), 2)
             ELSE 0 END AS ctr
      FROM solar_keyword_rankings kr
      JOIN solar_locations l ON kr.location_id = l.id
      WHERE kr.created_at >= NOW() - INTERVAL '60 days'
      GROUP BY l.location_name, kr.keyword
    `)

    const areas: Record<string, any[]> = {}
    for (const r of res.rows) {
      const area = r.area as string
      if (!areas[area]) areas[area] = []
      areas[area].push({
        keyword: r.keyword as string,
        avgPosition: r.avg_position ? Number(r.avg_position) : 0,
        clicks: r.clicks ? Number(r.clicks) : 0,
        impressions: r.impressions ? Number(r.impressions) : 0,
        ctr: r.ctr ? Number(r.ctr) : 0,
      })
    }

    // sort and trim top 10 per area
    Object.keys(areas).forEach(area => {
      areas[area].sort((a, b) => (b.clicks - a.clicks) || (a.avgPosition - b.avgPosition))
      areas[area] = areas[area].slice(0, 10)
    })

    return NextResponse.json({ areas })
  } catch (e: any) {
    console.error('GET /api/rankings/by-area error:', e)
    return NextResponse.json({ error: 'Failed to load rankings by area', details: e.message }, { status: 500 })
  }
}
