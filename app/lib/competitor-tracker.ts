import 'server-only'
import { brightData } from './brightdata'

export interface Competitor {
  id: string
  name: string
  domain: string
  location: string
  businessType: 'solar_installer' | 'solar_retailer' | 'energy_company'
  lastUpdated: Date
}

export interface CompetitorRanking {
  competitorId: string
  keyword: string
  position: number | null
  url: string
  title: string
  location: string
  estimatedTraffic: number
  lastChecked: Date
}

export interface CompetitorAnalysis {
  competitor: Competitor
  rankings: CompetitorRanking[]
  averagePosition: number
  totalKeywords: number
  estimatedTraffic: number
  visibilityScore: number
  trending: 'up' | 'down' | 'stable'
}

export interface CompetitorSummary {
  totalCompetitors: number
  averagePosition: number
  marketShare: number
  topCompetitors: Array<{
    name: string
    domain: string
    averagePosition: number
    visibilityScore: number
  }>
  keywordGaps: Array<{
    keyword: string
    competitorCount: number
    opportunity: 'high' | 'medium' | 'low'
  }>
  lastUpdated: Date
}

export class CompetitorTrackingService {
  private keywords: string[]
  private location: string
  private yourDomain: string

  constructor(keywords: string[], location: string, yourDomain: string) {
    this.keywords = keywords
    this.location = location
    this.yourDomain = yourDomain
  }

  async discoverCompetitors(): Promise<Competitor[]> {
    const competitors: Map<string, Competitor> = new Map()

    // Search each keyword to find competing domains
    for (const keyword of this.keywords) {
      try {
        const searchResults = await brightData.searchGoogle(keyword, this.location)
        
        for (const result of searchResults.results) {
          if (result.position <= 20) { // Top 20 results only
            const domain = this.extractDomain(result.url)
            
            // Skip your own domain and non-business domains
            if (domain === this.yourDomain || this.isNonBusinessDomain(domain)) {
              continue
            }

            if (!competitors.has(domain)) {
              const competitor = await this.analyzeCompetitorDomain(domain, result)
              if (competitor) {
                competitors.set(domain, competitor)
              }
            }
          }
        }

        // Add delay to avoid rate limiting
        await this.delay(1500)
      } catch (error) {
        console.error(`Error discovering competitors for keyword "${keyword}":`, error)
      }
    }

    return Array.from(competitors.values())
  }

  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '')
    } catch {
      return ''
    }
  }

  private isNonBusinessDomain(domain: string): boolean {
    const nonBusinessDomains = [
      'wikipedia.org',
      'youtube.com',
      'facebook.com',
      'linkedin.com',
      'yelp.com',
      'bbb.org',
      'angieslist.com',
      'google.com',
      'maps.google.com',
      'energysage.com', // Platform, not direct competitor
      'solar.com', // Platform
      'solarpower.org',
      'seia.org'
    ]

    return nonBusinessDomains.some(nbd => domain.includes(nbd))
  }

  private async analyzeCompetitorDomain(domain: string, searchResult: any): Promise<Competitor | null> {
    try {
      // Extract business info from domain and search result
      const businessName = this.extractBusinessName(searchResult.title, domain)
      const businessType = this.classifyBusinessType(searchResult.title, searchResult.snippet || '')

      return {
        id: this.generateId(domain),
        name: businessName,
        domain,
        location: this.location,
        businessType,
        lastUpdated: new Date()
      }
    } catch (error) {
      console.error(`Error analyzing competitor domain ${domain}:`, error)
      return null
    }
  }

  private extractBusinessName(title: string, domain: string): string {
    // Remove common suffixes and extract business name
    let name = title
      .replace(/\s*-\s*Solar.*$/i, '')
      .replace(/\s*\|\s*.*$/i, '')
      .replace(/\s*:.*$/i, '')
      .trim()

    if (!name || name.length < 3) {
      // Fallback to domain-based name
      name = domain
        .replace(/solar/gi, 'Solar')
        .replace(/energy/gi, 'Energy')
        .replace(/power/gi, 'Power')
        .replace(/\./g, ' ')
        .replace(/^\w/, c => c.toUpperCase())
    }

    return name
  }

  private classifyBusinessType(title: string, snippet: string): 'solar_installer' | 'solar_retailer' | 'energy_company' {
    const content = (title + ' ' + snippet).toLowerCase()

    if (content.includes('install') || content.includes('contractor') || content.includes('roofing')) {
      return 'solar_installer'
    } else if (content.includes('energy company') || content.includes('utility') || content.includes('electric')) {
      return 'energy_company'
    } else {
      return 'solar_retailer'
    }
  }

  private generateId(domain: string): string {
    return domain.replace(/[^a-z0-9]/g, '-')
  }

  async trackCompetitorRankings(competitors: Competitor[]): Promise<CompetitorRanking[]> {
    const rankings: CompetitorRanking[] = []

    for (const competitor of competitors) {
      for (const keyword of this.keywords) {
        try {
          const ranking = await brightData.findDomainRanking(keyword, competitor.domain, this.location)
          
          rankings.push({
            competitorId: competitor.id,
            keyword,
            position: ranking.position,
            url: ranking.url || '',
            title: ranking.title || '',
            location: this.location,
            estimatedTraffic: ranking.estimatedTraffic,
            lastChecked: new Date()
          })

          // Add delay between checks
          await this.delay(1000)
        } catch (error) {
          console.error(`Error tracking ranking for ${competitor.domain} on "${keyword}":`, error)
        }
      }
    }

    return rankings
  }

  async analyzeCompetitors(competitors: Competitor[], rankings: CompetitorRanking[]): Promise<CompetitorAnalysis[]> {
    return competitors.map(competitor => {
      const competitorRankings = rankings.filter(r => r.competitorId === competitor.id)
      const rankedKeywords = competitorRankings.filter(r => r.position !== null)
      
      const averagePosition = rankedKeywords.length > 0
        ? rankedKeywords.reduce((sum, r) => sum + (r.position || 0), 0) / rankedKeywords.length
        : 0

      const totalKeywords = rankedKeywords.length
      const estimatedTraffic = competitorRankings.reduce((sum, r) => sum + r.estimatedTraffic, 0)
      
      // Calculate visibility score (0-100)
      const visibilityScore = this.calculateVisibilityScore(competitorRankings)
      
      // Determine trending (simplified - would use historical data in production)
      const trending = this.determineTrending(competitor, rankedKeywords)

      return {
        competitor,
        rankings: competitorRankings,
        averagePosition,
        totalKeywords,
        estimatedTraffic,
        visibilityScore,
        trending
      }
    })
  }

  private calculateVisibilityScore(rankings: CompetitorRanking[]): number {
    if (rankings.length === 0) return 0

    const totalPossibleScore = this.keywords.length * 100 // Max score if ranked #1 for all keywords
    let actualScore = 0

    for (const ranking of rankings) {
      if (ranking.position) {
        // Score based on position (position 1 = 100 points, position 10 = 10 points, etc.)
        const positionScore = Math.max(0, 101 - ranking.position)
        actualScore += positionScore
      }
    }

    return Math.round((actualScore / totalPossibleScore) * 100)
  }

  private determineTrending(competitor: Competitor, rankings: CompetitorRanking[]): 'up' | 'down' | 'stable' {
    // Simplified trending calculation - in production you'd compare with historical data
    const avgPosition = rankings.reduce((sum, r) => sum + (r.position || 50), 0) / rankings.length

    // Simulate trending based on business characteristics
    if (competitor.businessType === 'solar_installer' && avgPosition < 15) {
      return 'up' // Local installers trending up
    } else if (competitor.businessType === 'energy_company' && avgPosition > 20) {
      return 'down' // Big companies trending down in local results
    } else {
      return 'stable'
    }
  }

  async generateCompetitorSummary(analyses: CompetitorAnalysis[]): Promise<CompetitorSummary> {
    const totalCompetitors = analyses.length
    const averagePosition = analyses.reduce((sum, a) => sum + a.averagePosition, 0) / totalCompetitors || 0

    // Calculate market share (simplified)
    const totalVisibility = analyses.reduce((sum, a) => sum + a.visibilityScore, 0)
    const marketShare = totalVisibility > 0 ? Math.round((100 / totalVisibility) * 100) / 100 : 0

    // Top competitors by visibility
    const topCompetitors = analyses
      .sort((a, b) => b.visibilityScore - a.visibilityScore)
      .slice(0, 5)
      .map(a => ({
        name: a.competitor.name,
        domain: a.competitor.domain,
        averagePosition: Math.round(a.averagePosition),
        visibilityScore: a.visibilityScore
      }))

    // Keyword gap analysis
    const keywordGaps = await this.analyzeKeywordGaps(analyses)

    return {
      totalCompetitors,
      averagePosition: Math.round(averagePosition),
      marketShare,
      topCompetitors,
      keywordGaps,
      lastUpdated: new Date()
    }
  }

  private async analyzeKeywordGaps(analyses: CompetitorAnalysis[]): Promise<Array<{
    keyword: string
    competitorCount: number
    opportunity: 'high' | 'medium' | 'low'
  }>> {
    const keywordAnalysis: { [keyword: string]: number } = {}

    // Count how many competitors rank for each keyword
    analyses.forEach(analysis => {
      analysis.rankings.forEach(ranking => {
        if (ranking.position && ranking.position <= 20) {
          keywordAnalysis[ranking.keyword] = (keywordAnalysis[ranking.keyword] || 0) + 1
        }
      })
    })

    return this.keywords.map(keyword => {
      const competitorCount = keywordAnalysis[keyword] || 0
      let opportunity: 'high' | 'medium' | 'low'

      if (competitorCount <= 2) {
        opportunity = 'high' // Few competitors = high opportunity
      } else if (competitorCount <= 5) {
        opportunity = 'medium'
      } else {
        opportunity = 'low' // Many competitors = low opportunity
      }

      return {
        keyword,
        competitorCount,
        opportunity
      }
    })
  }

  async getCompetitorInsights(analyses: CompetitorAnalysis[]): Promise<Array<{
    insight: string
    type: 'opportunity' | 'threat' | 'trend'
    priority: 'high' | 'medium' | 'low'
    actionable: boolean
  }>> {
    const insights = []

    // Identify weak competitors
    const weakCompetitors = analyses.filter(a => a.visibilityScore < 20 && a.totalKeywords > 0)
    if (weakCompetitors.length > 0) {
      insights.push({
        insight: `${weakCompetitors.length} competitors have low visibility scores - opportunity to outrank them`,
        type: 'opportunity' as const,
        priority: 'high' as const,
        actionable: true
      })
    }

    // Identify strong competitors
    const strongCompetitors = analyses.filter(a => a.visibilityScore > 70)
    if (strongCompetitors.length > 0) {
      insights.push({
        insight: `${strongCompetitors.length} competitors dominate rankings - analyze their strategies`,
        type: 'threat' as const,
        priority: 'high' as const,
        actionable: true
      })
    }

    // Trending analysis
    const trendingUp = analyses.filter(a => a.trending === 'up')
    if (trendingUp.length > 0) {
      insights.push({
        insight: `${trendingUp.length} competitors are trending upward - monitor closely`,
        type: 'trend' as const,
        priority: 'medium' as const,
        actionable: true
      })
    }

    // Local installer dominance
    const localInstallers = analyses.filter(a => 
      a.competitor.businessType === 'solar_installer' && a.averagePosition < 10
    )
    if (localInstallers.length > 2) {
      insights.push({
        insight: 'Local installers dominating search results - focus on local SEO strategies',
        type: 'trend' as const,
        priority: 'high' as const,
        actionable: true
      })
    }

    return insights
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export default CompetitorTrackingService
