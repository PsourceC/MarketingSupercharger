import { NextResponse } from 'next/server'
import { query } from '../../lib/server-only'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    await query('BEGIN')

    const getCount = async (table: string) => {
      const r = await query(`SELECT COUNT(1) AS c FROM ${table}`)
      return Number(r.rows[0]?.c || 0)
    }

    // Business info
    if (await getCount('solar_business_info') === 0) {
      await query(
        `INSERT INTO solar_business_info (business_name, website, service_areas, target_keywords)
         VALUES ($1, $2, $3, $4)`,
        [
          'Affordable Solar Co',
          'https://www.affordablesolar.example',
          ['Phoenix, AZ', 'Tucson, AZ', 'Mesa, AZ'],
          ['solar installation', 'solar panels', 'solar financing']
        ]
      )
    }

    // Locations
    let locationIds: number[] = []
    if (await getCount('solar_locations') === 0) {
      const locations = [
        { name: 'Phoenix, AZ', lat: 33.4484, lng: -112.0740, score: 85, pop: 1680000, vol: 54000 },
        { name: 'Tucson, AZ', lat: 32.2226, lng: -110.9747, score: 78, pop: 545000, vol: 22000 },
        { name: 'Mesa, AZ', lat: 33.4152, lng: -111.8315, score: 74, pop: 512000, vol: 18000 },
      ]
      for (const l of locations) {
        const r = await query(
          `INSERT INTO solar_locations (location_name, latitude, longitude, overall_score, population, search_volume)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [l.name, l.lat, l.lng, l.score, l.pop, l.vol]
        )
        locationIds.push(Number(r.rows[0].id))
      }
    } else {
      const r = await query('SELECT id FROM solar_locations ORDER BY id LIMIT 3')
      locationIds = r.rows.map((x: any) => Number(x.id))
    }

    // Priority actions
    if (await getCount('solar_priority_actions') === 0) {
      const actions = [
        {
          title: 'Fix duplicate title tags',
          description: 'Clean up duplicate titles across top landing pages to improve CTR',
          impact: 'high',
          effort: 'low',
          timeline: '1 week',
          priority: 'critical',
          category: 'on-page',
          is_automatable: true,
        },
        {
          title: 'Build 20 local citations',
          description: 'Create/claim listings on top local directories',
          impact: 'medium',
          effort: 'medium',
          timeline: '2 weeks',
          priority: 'high',
          category: 'off-page',
          is_automatable: false,
        },
        {
          title: 'Improve GMB categories',
          description: 'Ensure primary and secondary categories are optimal',
          impact: 'high',
          effort: 'low',
          timeline: '3 days',
          priority: 'medium',
          category: 'local-seo',
          is_automatable: false,
        }
      ]
      for (const a of actions) {
        await query(
          `INSERT INTO solar_priority_actions (title, description, impact, effort, timeline, priority, category, is_automatable)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [a.title, a.description, a.impact, a.effort, a.timeline, a.priority, a.category, a.is_automatable]
        )
      }
    }

    // Keyword rankings
    if (await getCount('solar_keyword_rankings') === 0 && locationIds.length) {
      const keywords = ['solar installation', 'solar panels', 'solar financing']
      for (const locId of locationIds) {
        for (const kw of keywords) {
          const ranking = Math.floor(Math.random() * 30) + 1
          const impressions = Math.floor(Math.random() * 500) + 100
          const clicks = Math.floor(impressions * (0.03 + Math.random() * 0.07))
          const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0
          await query(
            `INSERT INTO solar_keyword_rankings (location_id, keyword, ranking_position, clicks, impressions, ctr)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [locId, kw, ranking, clicks, impressions, ctr]
          )
        }
      }
    }

    await query('COMMIT')
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    try { await query('ROLLBACK') } catch {}
    return NextResponse.json({ ok: false, error: e?.message || 'Unknown error' }, { status: 500 })
  }
}
