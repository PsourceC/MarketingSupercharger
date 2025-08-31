import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../lib/server-only'

export const dynamic = 'force-dynamic'

function baseKeywordsForArea(area: string) {
  const city = area.toLowerCase()
  const core = [
    `solar installation ${city}`,
    `best solar company ${city}`,
    `solar panels ${city}`,
    `solar installer near me ${city}`,
    `affordable solar ${city}`,
    `cheap solar ${city}`,
    `top rated solar installers ${city}`,
  ]
  const product = [
    `tesla powerwall ${city}`,
    `home battery backup ${city}`,
    `enphase installer ${city}`,
    `rec solar panels ${city}`,
  ]
  const services = [
    `solar rebates ${city}`,
    `solar tax credit ${city}`,
    `solar financing ${city}`,
    `net metering ${city}`,
  ]
  return [...core, ...product, ...services]
}

function volumeForKeyword(k: string, area: string) {
  const base: Record<string, number> = {
    'solar installation': 5000,
    'best solar company': 2500,
    'solar panels': 8000,
    'solar installer near me': 4500,
    'affordable solar': 2200,
    'cheap solar': 1800,
    'top rated solar installers': 1600,
    'tesla powerwall': 4000,
    'home battery backup': 2600,
    'enphase': 1200,
    'rec solar panels': 900,
    'solar rebates': 3000,
    'solar tax credit': 2800,
    'solar financing': 2000,
    'net metering': 1500,
  }
  const key = Object.keys(base).find(b => k.startsWith(b)) || 'solar installation'
  let loc = 1.0
  if (/austin/i.test(area)) loc = 1.2
  if (/round rock|cedar park|georgetown|leander|pflugerville|hutto/i.test(area)) loc = 0.6
  return Math.round((base[key] || 1000) * loc)
}

function opportunityScore(volume: number, competitorCount: number) {
  // Higher volume and fewer competitors = higher opportunity
  const volScore = Math.min(100, Math.round(volume / 120))
  const compPenalty = Math.min(60, competitorCount * 10)
  return Math.max(0, volScore - compPenalty)
}

function simulateCompetitorCount(keyword: string) {
  if (/tesla powerwall|battery/i.test(keyword)) return 3
  if (/rebates|tax credit|financ/i.test(keyword)) return 4
  if (/best|top rated/i.test(keyword)) return 6
  return 5
}

export async function GET() {
  try {
    const cfg = await query(`
      SELECT website, service_areas, target_keywords
      FROM solar_business_info
      ORDER BY created_at DESC
      LIMIT 1
    `)

    const areas: string[] = cfg.rows[0]?.service_areas || ['Central Austin']

    const byArea = areas.reduce((acc: any, area: string) => {
      const candidates = baseKeywordsForArea(area)
      const scored = candidates.map(k => {
        const vol = volumeForKeyword(k, area)
        const comp = simulateCompetitorCount(k)
        return {
          keyword: k,
          estimatedVolume: vol,
          competitorCount: comp,
          opportunity: opportunityScore(vol, comp)
        }
      }).sort((a, b) => b.opportunity - a.opportunity)

      acc[area] = scored.slice(0, 12)
      return acc
    }, {})

    return NextResponse.json({ areas: byArea })
  } catch (e: any) {
    console.error('GET /api/keyword-discovery error:', e)
    return NextResponse.json({ error: 'Failed to discover keywords', details: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { apply } = await req.json()
    if (!apply || typeof apply !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // apply shape: { [area]: string[] }
    const areas = Object.keys(apply)
    const tk = { global: Array.from(new Set(areas.flatMap(a => apply[a]).slice(0, 20))), areas: apply, competitors: {} as Record<string, string[]> }

    await query(
      `INSERT INTO solar_business_info (target_keywords)
       VALUES ($1)`,
      [tk]
    )

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('POST /api/keyword-discovery error:', e)
    return NextResponse.json({ error: 'Failed to save discovered keywords', details: e.message }, { status: 500 })
  }
}
