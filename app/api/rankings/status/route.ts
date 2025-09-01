import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../../lib/server-only'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const area = searchParams.get('area')

    const rows = await query(
      `SELECT l.location_name AS area, MAX(kr.created_at) AS last_update
       FROM solar_locations l
       LEFT JOIN solar_keyword_rankings kr ON kr.location_id = l.id
       ${area ? 'WHERE l.location_name = $1' : ''}
       GROUP BY l.location_name`,
      area ? [area] : []
    )

    const status = rows.rows.map((r: any) => ({
      area: r.area,
      lastUpdated: r.last_update ? new Date(r.last_update).toISOString() : null,
      mode: process.env.LIVE_SCRAPER_ENABLED === '1' ? 'live' : (process.env.BRIGHTDATA_REAL_API_ENABLED ? 'live' : 'simulation')
    }))

    return NextResponse.json({ status })
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to load status', details: e.message }, { status: 500 })
  }
}
