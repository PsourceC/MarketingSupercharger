import { NextResponse } from 'next/server'
import { query } from '../../lib/server-only'

export const dynamic = 'force-dynamic'

export async function POST() {
  const statements: string[] = [
    'BEGIN',
    `CREATE TABLE IF NOT EXISTS solar_locations (
      id SERIAL PRIMARY KEY,
      location_name TEXT NOT NULL,
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      overall_score NUMERIC,
      population INTEGER,
      search_volume INTEGER,
      last_updated TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS solar_keyword_rankings (
      id SERIAL PRIMARY KEY,
      location_id INTEGER REFERENCES solar_locations(id) ON DELETE CASCADE,
      keyword TEXT NOT NULL,
      ranking_position NUMERIC,
      clicks INTEGER DEFAULT 0,
      impressions INTEGER DEFAULT 0,
      ctr NUMERIC DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    'CREATE INDEX IF NOT EXISTS idx_solar_keyword_rankings_location ON solar_keyword_rankings(location_id)',
    'CREATE INDEX IF NOT EXISTS idx_solar_keyword_rankings_created_at ON solar_keyword_rankings(created_at)',
    `CREATE TABLE IF NOT EXISTS solar_priority_actions (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      impact TEXT,
      effort TEXT,
      timeline TEXT,
      priority TEXT NOT NULL,
      category TEXT,
      completion_percentage INTEGER DEFAULT 0,
      is_automatable BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS solar_business_info (
      id SERIAL PRIMARY KEY,
      business_name TEXT,
      website TEXT,
      service_areas TEXT[],
      target_keywords TEXT[],
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    'COMMIT'
  ]

  try {
    for (const sql of statements) {
      await query(sql)
    }
    return NextResponse.json({ ok: true, message: 'Migration applied' })
  } catch (e: any) {
    try { await query('ROLLBACK') } catch {}
    return NextResponse.json({ ok: false, error: e?.message || 'Unknown error' }, { status: 500 })
  }
}
