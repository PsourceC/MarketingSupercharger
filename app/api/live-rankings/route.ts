import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../lib/server-only'
import { getCityCoords } from '../../lib/geo'

export const dynamic = 'force-dynamic'

function normalizeDomain(raw: string) {
  try {
    const d = new URL(raw.startsWith('http') ? raw : `https://${raw}`).hostname
    return d.replace(/^www\./, '')
  } catch {
    return raw.replace(/^www\./, '')
  }
}

async function fetchGoogleHtml(queryStr: string, locationHint?: string): Promise<string> {
  const q = `${queryStr}${locationHint ? ' ' + locationHint : ''}`
  const url = `https://www.google.com/search?q=${encodeURIComponent(q)}&num=50&hl=en&gl=us&pws=0`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Cache-Control': 'no-cache'
    },
    cache: 'no-store'
  })
  if (!res.ok) throw new Error(`Google fetch failed: ${res.status}`)
  return await res.text()
}

function extractDomainFromHref(href: string) {
  try {
    const u = new URL(href)
    return u.hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

function parseOrganicPositions(html: string): Array<{ position: number; url: string; domain: string; title?: string }> {
  // Very lightweight parser: find /url?q= links in order; skip Google internal links and known non-business domains
  const results: Array<{ position: number; url: string; domain: string; title?: string }> = []
  const seen = new Set<string>()
  const regex = /<a\s+href=\"\/url\?q=([^&\"]+)/g
  let match: RegExpExecArray | null
  let pos = 0
  while ((match = regex.exec(html)) && pos < 100) {
    const dest = decodeURIComponent(match[1])
    const domain = extractDomainFromHref(dest)
    if (!domain) continue
    // Skip Google, YouTube, FB, etc.
    if (/google\./i.test(domain) || /youtube\.com/i.test(domain) || /webcache\./i.test(dest) || /policies\.google\./i.test(dest)) continue
    if (seen.has(domain)) continue
    seen.add(domain)
    pos += 1
    results.push({ position: pos, url: dest, domain })
  }
  return results
}

async function ensureLocation(area: string) {
  const r = await query('SELECT id FROM solar_locations WHERE location_name = $1', [area])
  if (r.rows.length) return r.rows[0].id as number
  const coords = getCityCoords(area) || { lat: 0, lng: 0 }
  const ins = await query(
    `INSERT INTO solar_locations (location_name, latitude, longitude, overall_score, last_updated)
     VALUES ($1, $2, $3, $4, NOW()) RETURNING id`,
    [area, coords.lat, coords.lng, 0]
  )
  return ins.rows[0].id as number
}

async function storeRanking(locationId: number, keyword: string, position: number) {
  await query(
    `INSERT INTO solar_keyword_rankings (location_id, keyword, ranking_position, clicks, impressions, ctr, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
    [locationId, keyword, position, 0, 0, 0]
  )
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const area = searchParams.get('area')

    // Load config
    const cfg = await query(`SELECT website, website_url, service_areas, target_keywords FROM solar_business_info ORDER BY created_at DESC LIMIT 1`)
    const row = cfg.rows?.[0]
    const domain = row?.website || row?.website_url || ''
    const yourDomain = normalizeDomain(domain)
    const serviceAreas: string[] = Array.isArray(row?.service_areas) ? row.service_areas : []

    const targetArea = area || serviceAreas[0] || ''
    if (!targetArea) return NextResponse.json({ error: 'No service areas configured' }, { status: 400 })

    const tk = row?.target_keywords || {}
    const global = Array.isArray(tk?.global) ? tk.global : Array.isArray(tk) ? tk : []
    const areaKws = tk?.areas && typeof tk.areas === 'object' ? (tk.areas[targetArea] || []) : []
    const keywords: string[] = Array.from(new Set([...(global as string[]), ...(areaKws as string[])]))
    const effectiveKeywords = keywords.length ? keywords : ['solar installation', 'solar panels']

    // For preview, do not run unless enabled
    const liveEnabled = process.env.LIVE_SCRAPER_ENABLED === '1'

    if (!liveEnabled) {
      return NextResponse.json({
        mode: 'simulation',
        area: targetArea,
        domain: yourDomain,
        keywords: effectiveKeywords,
        message: 'Live scraper disabled. Set LIVE_SCRAPER_ENABLED=1 to enable.'
      })
    }

    const locationId = await ensureLocation(targetArea)

    const results: any[] = []
    for (const baseKw of effectiveKeywords) {
      const queryStr = `${baseKw}`
      // polite delay between requests
      await new Promise(res => setTimeout(res, 1200))
      const html = await fetchGoogleHtml(queryStr, targetArea)
      const parsed = parseOrganicPositions(html)
      const hit = parsed.find(r => r.domain.includes(yourDomain))
      const position = hit ? hit.position : null
      if (position) {
        await storeRanking(locationId, `${baseKw} ${targetArea}`, position)
        results.push({ keyword: `${baseKw} ${targetArea}`, position, found: true })
      } else {
        results.push({ keyword: `${baseKw} ${targetArea}`, position: null, found: false })
      }
    }

    // Update last_updated
    await query('UPDATE solar_locations SET last_updated = NOW() WHERE id = $1', [locationId])

    return NextResponse.json({ mode: 'live', area: targetArea, domain: yourDomain, results, updatedAt: new Date().toISOString() })
  } catch (e: any) {
    console.error('GET /api/live-rankings error:', e)
    return NextResponse.json({ error: 'Failed live scrape', details: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const areas: string[] = Array.isArray(body?.areas) ? body.areas : []

    const cfg = await query(`SELECT website, website_url, service_areas, target_keywords FROM solar_business_info ORDER BY created_at DESC LIMIT 1`)
    const row = cfg.rows?.[0]
    const yourDomain = normalizeDomain(row?.website || row?.website_url || '')
    const serviceAreas: string[] = Array.isArray(row?.service_areas) ? row.service_areas : []

    const allAreas = areas.length ? areas : serviceAreas
    if (!allAreas.length) return NextResponse.json({ error: 'No areas to process' }, { status: 400 })

    const tk = row?.target_keywords || {}
    const global = Array.isArray(tk?.global) ? tk.global : Array.isArray(tk) ? tk : []

    const liveEnabled = process.env.LIVE_SCRAPER_ENABLED === '1'
    const mode = liveEnabled ? 'live' : 'simulation'

    const processed: any[] = []
    for (const area of allAreas) {
      const kws = tk?.areas && typeof tk.areas === 'object' ? (tk.areas[area] || []) : []
      const keywords: string[] = Array.from(new Set([...(global as string[]), ...(kws as string[])]))
      const effectiveKeywords = keywords.length ? keywords : ['solar installation', 'solar panels']
      const locationId = await ensureLocation(area)

      if (!liveEnabled) {
        processed.push({ area, keywords: effectiveKeywords.length, mode })
        continue
      }

      for (const baseKw of effectiveKeywords) {
        await new Promise(res => setTimeout(res, 1200))
        const html = await fetchGoogleHtml(baseKw, area)
        const parsed = parseOrganicPositions(html)
        const hit = parsed.find(r => r.domain.includes(yourDomain))
        const position = hit ? hit.position : null
        if (position) {
          await storeRanking(locationId, `${baseKw} ${area}`, position)
        }
      }

      await query('UPDATE solar_locations SET last_updated = NOW() WHERE id = $1', [locationId])
      processed.push({ area, keywords: effectiveKeywords.length, mode })
    }

    return NextResponse.json({ success: true, mode, processed, updatedAt: new Date().toISOString() })
  } catch (e: any) {
    console.error('POST /api/live-rankings error:', e)
    return NextResponse.json({ error: 'Failed to run live rankings', details: e.message }, { status: 500 })
  }
}
