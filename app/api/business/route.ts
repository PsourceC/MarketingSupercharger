import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../lib/server-only'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await query(`CREATE TABLE IF NOT EXISTS solar_business_info (
      id SERIAL PRIMARY KEY,
      business_name TEXT,
      website_url TEXT,
      phone VARCHAR(20),
      address TEXT,
      primary_location TEXT,
      service_areas TEXT[],
      target_keywords TEXT[],
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`)

    const res = await query(`SELECT business_name, website_url, primary_location, service_areas, target_keywords FROM solar_business_info ORDER BY created_at DESC LIMIT 1`)
    return NextResponse.json({ profile: res.rows?.[0] || null })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name = String(body.business_name || '').trim()
    const website = String(body.website_url || '').trim()
    const primaryLocation = String(body.primary_location || '').trim()
    const serviceAreas: string[] = Array.isArray(body.service_areas)
      ? body.service_areas.map((s: any) => String(s).trim()).filter(Boolean)
      : String(body.service_areas || '')
          .split(/[;,\n]+/)
          .map(s => s.trim())
          .filter(Boolean)
    const keywords: string[] = Array.isArray(body.target_keywords)
      ? body.target_keywords.map((s: any) => String(s).trim()).filter(Boolean)
      : String(body.target_keywords || '')
          .split(/[;,\n]+/)
          .map(s => s.trim())
          .filter(Boolean)

    await query(`CREATE TABLE IF NOT EXISTS solar_business_info (
      id SERIAL PRIMARY KEY,
      business_name TEXT,
      website_url TEXT,
      phone VARCHAR(20),
      address TEXT,
      primary_location TEXT,
      service_areas TEXT[],
      target_keywords TEXT[],
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`)

    await query(
      `INSERT INTO solar_business_info (business_name, website_url, primary_location, service_areas, target_keywords, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [name || null, website || null, primaryLocation || null, serviceAreas.length ? serviceAreas : null, keywords.length ? keywords : null]
    )

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}
