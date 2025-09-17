import 'server-only'

export interface ScrapedProfile {
  homepageUrl: string
  businessName?: string
  phone?: string
  address?: string
  categories: string[]
  isLocal: boolean
  confidenceScore: number
  evidence: { reason: string; weight: number }[]
}

const AGGREGATOR_DOMAINS = [
  'yelp.com','bbb.org','angi.com','angieslist.com','homeadvisor.com','thumbtack.com','porch.com','houzz.com',
  'mapquest.com','maps.google.','google.com/maps','nextdoor.com','yellowpages.com','superpages.com','manta.com',
  'chamberofcommerce.com','birdeye.com','trustpilot.com','g2.com','capterra.com','facebook.com','linkedin.com',
  'twitter.com','instagram.com','youtube.com','medium.com','wikipedia.org','crunchbase.com','glassdoor.com',
  'energysage.com','solar.com','solarreviews.com','solarreviews','yell.com','foursquare.com','yext.com'
]

function isAggregator(domain: string) {
  return AGGREGATOR_DOMAINS.some(d => domain.includes(d))
}

function normalizeDomain(input: string) {
  try { return new URL(input).hostname.replace(/^www\./,'') } catch { return input.replace(/^https?:\/\//,'').replace(/^www\./,'') }
}

function extractJSONLDBlocks(html: string): any[] {
  const blocks: any[] = []
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match
  while ((match = regex.exec(html)) !== null) {
    const raw = match[1]
    try {
      const json = JSON.parse(raw.trim())
      if (Array.isArray(json)) blocks.push(...json)
      else blocks.push(json)
    } catch {}
  }
  return blocks
}

function textIncludes(html: string, patterns: string[]): boolean {
  const lower = html.toLowerCase()
  return patterns.some(p => lower.includes(p.toLowerCase()))
}

function extractTagContent(html: string, tag: string): string[] {
  const out: string[] = []
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi')
  let m
  while ((m = regex.exec(html)) !== null) {
    out.push(m[1])
  }
  return out
}

function extractMetaContent(html: string, name: string): string[] {
  const out: string[] = []
  const regex = new RegExp(`<meta[^>]+${name}=["'][^"']+["'][^>]*content=["']([^"']+)["'][^>]*>`, 'gi')
  let m
  while ((m = regex.exec(html)) !== null) out.push(m[1])
  return out
}

function findPhone(html: string): string | undefined {
  const m = html.match(/(?:\+?1[-.\s]?)?(\(?\d{3}\)?)[-.\s]?\d{3}[-.\s]?\d{4}/)
  return m ? m[0] : undefined
}

function findAddress(html: string): string | undefined {
  const m = html.match(/\d{2,6}\s+[A-Za-z0-9\.\-\s]+\,\s*[A-Za-z\s]+\,\s*[A-Z]{2}\s+\d{5}/)
  return m ? m[0] : undefined
}

export class CompetitorScraper {
  private timeoutMs = 9000
  private userAgent = 'Mozilla/5.0 (compatible; SolarDashBot/1.0; +https://www.astrawatt.com)'

  async evaluate(domainOrUrl: string, locations: string[]): Promise<ScrapedProfile | null> {
    const domain = normalizeDomain(domainOrUrl)
    if (isAggregator(domain)) return null

    const url = /^https?:/i.test(domainOrUrl) ? domainOrUrl : `https://${domain}`
    const html = await this.fetchHTML(url)
    if (!html) return null

    const evidence: { reason: string; weight: number }[] = []
    const blocks = extractJSONLDBlocks(html)

    // Name & categories from JSON-LD
    let businessName: string | undefined
    const categories: string[] = []
    for (const b of blocks) {
      const type = (b['@type'] || '').toString().toLowerCase()
      if (type.includes('organization') || type.includes('localbusiness') || type.includes('store')) {
        if (typeof b.name === 'string') businessName = b.name
        const sameAs = b.sameAs
        if (Array.isArray(sameAs)) evidence.push({ reason: 'Has social profiles in JSON-LD', weight: 2 })
        const cat = b['@type']
        if (typeof cat === 'string') categories.push(cat)
        if (b.address?.addressLocality || b.address?.addressRegion || b.address?.postalCode) {
          evidence.push({ reason: 'JSON-LD address present', weight: 3 })
        }
      }
    }

    // Title, H1, meta
    const titles = extractTagContent(html, 'title')
    const h1s = extractTagContent(html, 'h1')
    const metas = [
      ...extractMetaContent(html, 'name="description"'),
      ...extractMetaContent(html, 'property="og:description"')
    ]
    const textBlock = (titles.concat(h1s).concat(metas)).join(' \n ').toLowerCase()

    if (/\bsolar\b/.test(textBlock)) evidence.push({ reason: 'Mentions "solar" in title/headers/meta', weight: 3 })
    if (/install|installer|company|contractor|pv|photovoltaic|panels/.test(textBlock)) evidence.push({ reason: 'Industry terms present', weight: 2 })

    // Contact markers
    if (textIncludes(html, ['request a quote','free estimate','get a quote','schedule','consultation'])) evidence.push({ reason: 'Lead intent CTAs present', weight: 2 })

    const phone = findPhone(html)
    if (phone) evidence.push({ reason: `Phone detected (${phone})`, weight: 2 })

    const address = findAddress(html)
    if (address) evidence.push({ reason: 'Street address detected', weight: 3 })

    // Local presence: location keywords or JSON-LD locality
    const lower = html.toLowerCase()
    const locationHit = locations.some(loc => lower.includes(loc.toLowerCase()))
    if (locationHit) evidence.push({ reason: 'Mentions tracked service area', weight: 3 })

    // Score
    const confidenceScore = Math.min(100, evidence.reduce((s, e) => s + e.weight, 0) * 5)
    const isLocal = locationHit || !!address

    // Minimal threshold to accept as real competitor
    if (!/\bsolar\b/.test(textBlock) && confidenceScore < 25) return null

    return {
      homepageUrl: url,
      businessName,
      phone,
      address,
      categories,
      isLocal,
      confidenceScore,
      evidence
    }
  }

  private async fetchHTML(url: string): Promise<string | null> {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), this.timeoutMs)
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'User-Agent': this.userAgent, 'Accept': 'text/html,application/xhtml+xml' },
        signal: controller.signal,
        redirect: 'follow',
      })
      if (!res.ok) return null
      const html = await res.text()
      return html
    } catch {
      return null
    } finally { clearTimeout(t) }
  }
}

export const competitorScraper = new CompetitorScraper()
