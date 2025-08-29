import { NextResponse } from 'next/server'
import { query } from '../../lib/server-only'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    console.log('Setting up citation and competitor tracking tables...')

    // Drop existing tables if they exist (to handle schema conflicts)
    await query('DROP TABLE IF EXISTS solar_competitor_rankings CASCADE')
    await query('DROP TABLE IF EXISTS solar_competitors CASCADE')
    await query('DROP TABLE IF EXISTS solar_citations CASCADE')

    // Create citations table
    await query(`
      CREATE TABLE solar_citations (
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
      )
    `)

    // Create competitors table
    await query(`
      CREATE TABLE solar_competitors (
        id VARCHAR(100) PRIMARY KEY,
        competitor_name VARCHAR(200) NOT NULL,
        domain VARCHAR(200) NOT NULL UNIQUE,
        location VARCHAR(200),
        business_type VARCHAR(50) CHECK (business_type IN ('solar_installer', 'solar_retailer', 'energy_company')),
        last_updated TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    // Create competitor rankings table
    await query(`
      CREATE TABLE solar_competitor_rankings (
        id SERIAL PRIMARY KEY,
        competitor_id VARCHAR(100) NOT NULL,
        keyword VARCHAR(200) NOT NULL,
        position INTEGER,
        ranking_url TEXT,
        page_title TEXT,
        estimated_traffic INTEGER DEFAULT 0,
        location VARCHAR(200),
        last_checked TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(competitor_id, keyword)
      )
    `)

    // Create indexes for performance
    await query('CREATE INDEX IF NOT EXISTS idx_solar_citations_last_checked ON solar_citations(last_checked)')
    await query('CREATE INDEX IF NOT EXISTS idx_solar_citations_status ON solar_citations(status)')
    await query('CREATE INDEX IF NOT EXISTS idx_solar_competitors_domain ON solar_competitors(domain)')
    await query('CREATE INDEX IF NOT EXISTS idx_solar_competitors_last_updated ON solar_competitors(last_updated)')
    await query('CREATE INDEX IF NOT EXISTS idx_solar_competitor_rankings_competitor ON solar_competitor_rankings(competitor_id)')
    await query('CREATE INDEX IF NOT EXISTS idx_solar_competitor_rankings_keyword ON solar_competitor_rankings(keyword)')

    // Check that all tables were created
    const tableCheck = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('solar_citations', 'solar_competitors', 'solar_competitor_rankings')
      ORDER BY table_name
    `)

    const createdTables = tableCheck.rows.map(row => row.table_name)

    return NextResponse.json({ 
      ok: true, 
      message: `Citation and competitor tracking tables created successfully`,
      tables: createdTables,
      count: createdTables.length
    })

  } catch (error: any) {
    console.error('Table setup error:', error)
    return NextResponse.json({ 
      ok: false, 
      error: error?.message || 'Unknown table setup error',
      details: error?.stack
    }, { status: 500 })
  }
}
