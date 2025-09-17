import { NextResponse } from 'next/server'
import { query } from '../../lib/server-only'
import CompetitorTrackingService from '../../lib/competitor-tracker'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const configRes = await query(`
      SELECT website, target_keywords, service_areas
      FROM solar_business_info
      ORDER BY created_at DESC
      LIMIT 1
    `)

    if (configRes.rows.length === 0) {
      return NextResponse.json({ ok: false, error: 'Business configuration missing' }, { status: 400 })
    }

    const cfg = configRes.rows[0]
    const keywords: string[] = Array.isArray(cfg.target_keywords) && cfg.target_keywords.length
      ? cfg.target_keywords
      : ['solar panels', 'solar installation', 'solar company', 'solar installers']
    const areas: string[] = Array.isArray(cfg.service_areas) && cfg.service_areas.length
      ? cfg.service_areas
      : ['Austin, TX']
    const yourDomain = cfg.website ? new URL(cfg.website).hostname.replace('www.','') : 'your-domain.com'

    // Ensure required tables exist
    await query(`
      CREATE TABLE IF NOT EXISTS solar_competitors (
        id VARCHAR(100) PRIMARY KEY,
        competitor_name VARCHAR(200) NOT NULL,
        domain VARCHAR(200) NOT NULL UNIQUE,
        location VARCHAR(200),
        business_type VARCHAR(50) CHECK (business_type IN ('solar_installer', 'solar_retailer', 'energy_company')),
        last_updated TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)
    await query("ALTER TABLE solar_competitors ADD COLUMN IF NOT EXISTS homepage_url TEXT")
    await query("ALTER TABLE solar_competitors ADD COLUMN IF NOT EXISTS phone VARCHAR(32)")
    await query("ALTER TABLE solar_competitors ADD COLUMN IF NOT EXISTS address TEXT")
    await query("ALTER TABLE solar_competitors ADD COLUMN IF NOT EXISTS confidence_score INTEGER DEFAULT 0")
    await query("ALTER TABLE solar_competitors ADD COLUMN IF NOT EXISTS is_local BOOLEAN DEFAULT false")
    await query("ALTER TABLE solar_competitors ADD COLUMN IF NOT EXISTS evidence JSONB")

    await query(`
      CREATE TABLE IF NOT EXISTS solar_competitor_rankings (
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

    // Presence table for lifecycle tracking
    await query(`
      CREATE TABLE IF NOT EXISTS solar_competitor_presence (
        id SERIAL PRIMARY KEY,
        competitor_id VARCHAR(100) NOT NULL,
        area VARCHAR(200) NOT NULL,
        first_seen TIMESTAMPTZ DEFAULT NOW(),
        last_seen TIMESTAMPTZ DEFAULT NOW(),
        active BOOLEAN DEFAULT true,
        UNIQUE(competitor_id, area)
      )
    `)
    await query('CREATE INDEX IF NOT EXISTS idx_presence_area ON solar_competitor_presence(area)')
    await query('CREATE INDEX IF NOT EXISTS idx_presence_active ON solar_competitor_presence(active)')

    const results: any[] = []

    for (const area of areas) {
      const service = new CompetitorTrackingService(keywords, area, yourDomain)

      const competitors = await service.discoverCompetitors()

      const discoveredIds: string[] = []
      for (const c of competitors) {
        discoveredIds.push(c.id)
        await query(`
          INSERT INTO solar_competitors (
            id, competitor_name, domain, location, business_type, last_updated,
            homepage_url, phone, address, confidence_score, is_local, evidence
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,COALESCE($10,0),COALESCE($11,false),$12)
          ON CONFLICT (id) DO UPDATE SET
            competitor_name=EXCLUDED.competitor_name,
            domain=EXCLUDED.domain,
            location=EXCLUDED.location,
            business_type=EXCLUDED.business_type,
            last_updated=EXCLUDED.last_updated,
            homepage_url=EXCLUDED.homepage_url,
            phone=EXCLUDED.phone,
            address=EXCLUDED.address,
            confidence_score=EXCLUDED.confidence_score,
            is_local=EXCLUDED.is_local,
            evidence=EXCLUDED.evidence
        `, [
          c.id, c.name, c.domain, area, c.businessType, c.lastUpdated,
          c.homepageUrl || null, c.phone || null, c.address || null,
          c.confidenceScore ?? null, c.isLocal ?? null,
          c.evidence ? JSON.stringify(c.evidence) : null
        ])

        // Presence upsert
        await query(`
          INSERT INTO solar_competitor_presence (competitor_id, area, first_seen, last_seen, active)
          VALUES ($1, $2, NOW(), NOW(), true)
          ON CONFLICT (competitor_id, area) DO UPDATE SET last_seen = NOW(), active = true
        `, [c.id, area])
      }

      const rankings = await service.trackCompetitorRankings(competitors)

      for (const r of rankings) {
        await query(`
          INSERT INTO solar_competitor_rankings (
            competitor_id, keyword, position, ranking_url, page_title, estimated_traffic, location, last_checked
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
          ON CONFLICT (competitor_id, keyword) DO UPDATE SET
            position=EXCLUDED.position,
            ranking_url=EXCLUDED.ranking_url,
            page_title=EXCLUDED.page_title,
            estimated_traffic=EXCLUDED.estimated_traffic,
            location=EXCLUDED.location,
            last_checked=EXCLUDED.last_checked
        `, [r.competitorId, r.keyword, r.position, r.url, r.title, r.estimatedTraffic, area, r.lastChecked])
      }

      // Deactivate stale competitors for this area not seen today and older than 30 days
      await query(`
        UPDATE solar_competitor_presence
        SET active = false
        WHERE area = $1
          AND competitor_id NOT IN (SELECT UNNEST($2::text[]))
          AND last_seen < NOW() - INTERVAL '30 days'
      `, [area, discoveredIds])

      results.push({ area, discovered: competitors.length, rankings: rankings.length })
    }

    return NextResponse.json({ ok: true, results, policy: { staleDays: 30 } })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: 'Use POST to run competitor discovery bot.' })
}
