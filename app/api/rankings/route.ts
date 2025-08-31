import { NextResponse } from 'next/server'
import { query } from '../../lib/server-only'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const res = await query(`
      SELECT 
        keyword,
        AVG(COALESCE(ranking_position, 0)) AS avg_position,
        SUM(COALESCE(clicks, 0)) AS total_clicks,
        SUM(COALESCE(impressions, 0)) AS total_impressions,
        CASE WHEN SUM(COALESCE(impressions,0)) > 0 
             THEN ROUND(SUM(COALESCE(clicks,0))::numeric * 100 / NULLIF(SUM(COALESCE(impressions,0)),0), 2)
             ELSE 0 END AS ctr
      FROM solar_keyword_rankings
      WHERE created_at >= NOW() - INTERVAL '60 days'
      GROUP BY keyword
      ORDER BY total_clicks DESC, avg_position ASC
      LIMIT 10
    `)

    const rows = res.rows.map(r => ({
      keyword: r.keyword as string,
      avgPosition: r.avg_position ? Number(r.avg_position) : 0,
      clicks: r.total_clicks ? Number(r.total_clicks) : 0,
      impressions: r.total_impressions ? Number(r.total_impressions) : 0,
      ctr: r.ctr ? Number(r.ctr) : 0,
    }))

    return NextResponse.json({ top: rows })
  } catch (e: any) {
    console.error('GET /api/rankings error:', e)
    return NextResponse.json({ error: 'Failed to load rankings', details: e.message }, { status: 500 })
  }
}
