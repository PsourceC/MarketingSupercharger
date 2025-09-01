import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../lib/server-only'
import * as Sentry from '@sentry/nextjs'

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
      SELECT business_name, website, service_areas, target_keywords
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
      websiteUrl: row.website || '',
      serviceAreas: row.service_areas || [],
      targetKeywords: tk,
    })
  } catch (e: any) {
    console.error('GET /api/business-config error:', e)
    try { Sentry.captureException(e, { tags: { route: 'business-config', method: 'GET' } }) } catch {}
    return NextResponse.json({ error: 'Failed to load business config', details: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  try {
    const businessName: string = body.businessName || ''
    const websiteUrl: string = body.websiteUrl || ''
    const serviceAreas: string[] = Array.isArray(body.serviceAreas) ? body.serviceAreas : []
    const targetKeywords = normalizeKeywords(body.targetKeywords)

    await query(
      `INSERT INTO solar_business_info (business_name, website, service_areas, target_keywords)
       VALUES ($1::text, $2::text, $3::text[], $4::jsonb)`,
      [businessName, websiteUrl, serviceAreas, JSON.stringify(targetKeywords)]
    )

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    const msg = String(e?.message || '')
    try { Sentry.captureException(e, { tags: { route: 'business-config', method: 'POST' } }) } catch {}
    if (/target_keywords\"? is of type text\[\]/i.test(msg) || /text\[\] but expression is of type jsonb/i.test(msg)) {
      try {
        const businessName: string = body.businessName || ''
        const websiteUrl: string = body.websiteUrl || ''
        const serviceAreas: string[] = Array.isArray(body.serviceAreas) ? body.serviceAreas : []
        const tk = normalizeKeywords(body.targetKeywords)
        const flattened = Array.from(new Set([...(tk.global || []), ...Object.values(tk.areas || {}).flat()] ))

        await query(
          `INSERT INTO solar_business_info (business_name, website, service_areas, target_keywords)
           VALUES ($1::text, $2::text, $3::text[], $4::text[])`,
          [businessName, websiteUrl, serviceAreas, flattened]
        )

        return NextResponse.json({ ok: true, downgraded: true })
      } catch (fallbackErr: any) {
        console.error('POST /api/business-config fallback error:', fallbackErr)
        try { Sentry.captureException(fallbackErr, { tags: { route: 'business-config', method: 'POST', stage: 'fallback' } }) } catch {}
        return NextResponse.json({ error: 'Failed to save business config', details: fallbackErr.message }, { status: 500 })
      }
    }

    console.error('POST /api/business-config error:', e)
    try { Sentry.captureException(e, { tags: { route: 'business-config', method: 'POST' } }) } catch {}
    return NextResponse.json({ error: 'Failed to save business config', details: e.message }, { status: 500 })
  }
}
