import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../lib/server-only'

export const dynamic = 'force-dynamic'

// Normalize target keywords JSON into a standard shape
function normalizeKeywords(value: any) {
  // Accept array -> treat as global
  if (Array.isArray(value)) {
    return { global: value, areas: {}, competitors: {} as Record<string, string[]> }
  }
  // Accept object with possible keys
  const global = Array.isArray(value?.global) ? value.global : []
  const areas = typeof value?.areas === 'object' && value?.areas !== null ? value.areas : {}
  const competitors = typeof value?.competitors === 'object' && value?.competitors !== null ? value.competitors : {}
  return { global, areas, competitors }
}

export async function GET() {
  try {
    const res = await query(`
      SELECT business_name, website_url, service_areas, target_keywords
      FROM solar_business_info
      ORDER BY created_at DESC
      LIMIT 1
    `)

    if (res.rows.length === 0) {
      return NextResponse.json({
        businessName: '',
        websiteUrl: '',
        serviceAreas: [],
        targetKeywords: { global: [], areas: {}, competitors: {} },
      })
    }

    const row = res.rows[0]
    const tk = normalizeKeywords(row.target_keywords)

    return NextResponse.json({
      businessName: row.business_name || '',
      websiteUrl: row.website_url || '',
      serviceAreas: row.service_areas || [],
      targetKeywords: tk,
    })
  } catch (e: any) {
    console.error('GET /api/business-config error:', e)
    return NextResponse.json({ error: 'Failed to load business config', details: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const businessName: string = body.businessName || ''
    const websiteUrl: string = body.websiteUrl || ''
    const serviceAreas: string[] = Array.isArray(body.serviceAreas) ? body.serviceAreas : []
    const targetKeywords = normalizeKeywords(body.targetKeywords)

    // Upsert a new record; keep history via created_at
    await query(
      `INSERT INTO solar_business_info (business_name, website_url, service_areas, target_keywords)
       VALUES ($1, $2, $3, $4)`,
      [businessName, websiteUrl, serviceAreas, targetKeywords]
    )

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('POST /api/business-config error:', e)
    return NextResponse.json({ error: 'Failed to save business config', details: e.message }, { status: 500 })
  }
}
