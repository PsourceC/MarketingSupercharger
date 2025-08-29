import { NextResponse } from 'next/server'
import { query } from '../../lib/server-only'

export const dynamic = 'force-dynamic'

export async function POST() {
  const statements: string[] = [
    'BEGIN',
    
    // Existing tables
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
      website_url TEXT,
      phone VARCHAR(20),
      address TEXT,
      primary_location TEXT,
      service_areas TEXT[],
      target_keywords JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    // New tables for citation monitoring
    `CREATE TABLE IF NOT EXISTS solar_citations (
      id SERIAL PRIMARY KEY,
      directory_name VARCHAR(100) UNIQUE NOT NULL,
      citation_url TEXT,
      found_business_name TEXT,
      found_phone VARCHAR(20),
      found_address TEXT,
      found_website TEXT,
      status VARCHAR(20) NOT NULL CHECK (status IN ('found', 'not-found', 'incorrect', 'needs-update')),
      consistency_score INTEGER NOT NULL DEFAULT 0 CHECK (consistency_score >= 0 AND consistency_score <= 100),
      issues JSONB,
      last_checked TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    // New tables for competitor tracking
    `CREATE TABLE IF NOT EXISTS solar_competitors (
      id VARCHAR(100) PRIMARY KEY,
      competitor_name VARCHAR(200) NOT NULL,
      domain VARCHAR(200) NOT NULL UNIQUE,
      location VARCHAR(200),
      business_type VARCHAR(50) CHECK (business_type IN ('solar_installer', 'solar_retailer', 'energy_company')),
      last_updated TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS solar_competitor_rankings (
      id SERIAL PRIMARY KEY,
      competitor_id VARCHAR(100) NOT NULL,
      keyword VARCHAR(200) NOT NULL,
      position INTEGER CHECK (position > 0),
      ranking_url TEXT,
      page_title TEXT,
      estimated_traffic INTEGER DEFAULT 0,
      location VARCHAR(200),
      last_checked TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(competitor_id, keyword)
    )`,

    // Add foreign key constraints after tables are created
    `ALTER TABLE solar_competitor_rankings
     DROP CONSTRAINT IF EXISTS solar_competitor_rankings_competitor_id_fkey`,

    `ALTER TABLE solar_competitor_rankings
     ADD CONSTRAINT solar_competitor_rankings_competitor_id_fkey
     FOREIGN KEY (competitor_id) REFERENCES solar_competitors(id) ON DELETE CASCADE`,

    // Add indexes for performance
    'CREATE INDEX IF NOT EXISTS idx_solar_citations_last_checked ON solar_citations(last_checked)',
    'CREATE INDEX IF NOT EXISTS idx_solar_citations_status ON solar_citations(status)',
    'CREATE INDEX IF NOT EXISTS idx_solar_competitors_domain ON solar_competitors(domain)',
    'CREATE INDEX IF NOT EXISTS idx_solar_competitors_last_updated ON solar_competitors(last_updated)',
    'CREATE INDEX IF NOT EXISTS idx_solar_competitor_rankings_competitor ON solar_competitor_rankings(competitor_id)',
    'CREATE INDEX IF NOT EXISTS idx_solar_competitor_rankings_keyword ON solar_competitor_rankings(keyword)',
    'CREATE INDEX IF NOT EXISTS idx_solar_competitor_rankings_position ON solar_competitor_rankings(position)',
    
    'COMMIT'
  ]

  try {
    for (const sql of statements) {
      await query(sql)
    }

    // Check table count
    const tableCheck = await query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'solar_%'
    `)
    
    const tableCount = Number(tableCheck.rows[0]?.table_count || 0)

    return NextResponse.json({ 
      ok: true, 
      message: `Migration completed successfully. ${tableCount} solar tables created.`,
      tables: [
        'solar_locations', 'solar_keyword_rankings', 'solar_priority_actions', 
        'solar_business_info', 'solar_citations', 'solar_competitors', 
        'solar_competitor_rankings'
      ]
    })
  } catch (e: any) {
    try { 
      await query('ROLLBACK') 
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError)
    }
    
    console.error('Migration error:', e)
    return NextResponse.json({ 
      ok: false, 
      error: e?.message || 'Unknown migration error',
      details: e?.stack
    }, { status: 500 })
  }
}
