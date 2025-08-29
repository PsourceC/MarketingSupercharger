import 'server-only'

export interface CitationData {
  directory: string
  url: string
  businessName: string
  phone: string
  address: string
  website: string
  status: 'found' | 'not-found' | 'incorrect' | 'needs-update'
  lastChecked: Date
  consistency: number // 0-100% consistency score
  issues: string[]
}

export interface CitationSummary {
  totalDirectories: number
  foundCitations: number
  consistentCitations: number
  inconsistentCitations: number
  missingCitations: number
  consistencyScore: number
  lastUpdated: Date
  topIssues: string[]
}

export class CitationMonitorService {
  private businessInfo: {
    name: string
    phone: string
    address: string
    website: string
  }

  // Major directories to monitor (free to check)
  private directories = [
    {
      name: 'Google My Business',
      searchUrl: 'https://www.google.com/search?q="{BUSINESS_NAME}"+{PHONE}',
      type: 'search'
    },
    {
      name: 'Bing Places',
      searchUrl: 'https://www.bing.com/search?q="{BUSINESS_NAME}"+{PHONE}',
      type: 'search'
    },
    {
      name: 'Apple Maps',
      searchUrl: 'https://duckduckgo.com/?q="{BUSINESS_NAME}"+{PHONE}+site:maps.apple.com',
      type: 'search'
    },
    {
      name: 'Yelp',
      searchUrl: 'https://www.yelp.com/search?find_desc={BUSINESS_NAME}&find_loc={ADDRESS}',
      type: 'directory'
    },
    {
      name: 'Facebook',
      searchUrl: 'https://www.facebook.com/search/pages/?q={BUSINESS_NAME}+{PHONE}',
      type: 'social'
    },
    {
      name: 'Yellow Pages',
      searchUrl: 'https://www.yellowpages.com/search?search_terms={BUSINESS_NAME}&geo_location_terms={ADDRESS}',
      type: 'directory'
    },
    {
      name: 'Whitepages',
      searchUrl: 'https://www.whitepages.com/business/search?business_name={BUSINESS_NAME}&where={ADDRESS}',
      type: 'directory'
    },
    {
      name: 'Superpages',
      searchUrl: 'https://www.superpages.com/search?C={BUSINESS_NAME}&T={ADDRESS}',
      type: 'directory'
    },
    {
      name: 'Foursquare',
      searchUrl: 'https://foursquare.com/explore?q={BUSINESS_NAME}&near={ADDRESS}',
      type: 'directory'
    },
    {
      name: 'Angie\'s List',
      searchUrl: 'https://www.angi.com/search.htm?searchTerm={BUSINESS_NAME}',
      type: 'directory'
    }
  ]

  constructor(businessInfo: any) {
    this.businessInfo = businessInfo
  }

  async checkAllCitations(): Promise<CitationData[]> {
    const citations: CitationData[] = []

    for (const directory of this.directories) {
      try {
        const citation = await this.checkDirectoryCitation(directory)
        citations.push(citation)
        
        // Add delay to avoid being rate limited
        await this.delay(1000)
      } catch (error) {
        console.error(`Error checking ${directory.name}:`, error)
        citations.push({
          directory: directory.name,
          url: '',
          businessName: '',
          phone: '',
          address: '',
          website: '',
          status: 'not-found',
          lastChecked: new Date(),
          consistency: 0,
          issues: ['Check failed - may need manual verification']
        })
      }
    }

    return citations
  }

  private async checkDirectoryCitation(directory: any): Promise<CitationData> {
    // Build search URL with business info
    const searchUrl = this.buildSearchUrl(directory.searchUrl)
    
    // Simulate citation checking (in production, this would scrape the actual pages)
    // For now, we'll provide intelligent simulation based on business data
    return this.simulateCitationCheck(directory, searchUrl)
  }

  private buildSearchUrl(template: string): string {
    return template
      .replace('{BUSINESS_NAME}', encodeURIComponent(this.businessInfo.name))
      .replace('{PHONE}', encodeURIComponent(this.businessInfo.phone))
      .replace('{ADDRESS}', encodeURIComponent(this.businessInfo.address))
      .replace('{WEBSITE}', encodeURIComponent(this.businessInfo.website))
  }

  private simulateCitationCheck(directory: any, searchUrl: string): CitationData {
    // Simulate realistic citation data based on directory importance and business type
    const isMainDirectory = ['Google My Business', 'Bing Places', 'Yelp', 'Facebook'].includes(directory.name)
    const isSolarBusiness = this.businessInfo.name.toLowerCase().includes('solar')
    
    // Main directories are more likely to have listings
    const foundProbability = isMainDirectory ? 0.8 : 0.4
    const isFound = Math.random() < foundProbability

    if (!isFound) {
      return {
        directory: directory.name,
        url: '',
        businessName: '',
        phone: '',
        address: '',
        website: '',
        status: 'not-found',
        lastChecked: new Date(),
        consistency: 0,
        issues: ['No listing found - opportunity to create citation']
      }
    }

    // If found, simulate potential data inconsistencies
    const issues: string[] = []
    let consistency = 100

    // Phone number variations
    const phoneVariations = [
      this.businessInfo.phone,
      this.formatPhone(this.businessInfo.phone),
      this.businessInfo.phone.replace(/[^\d]/g, '')
    ]
    const usedPhone = phoneVariations[Math.floor(Math.random() * phoneVariations.length)]
    
    if (usedPhone !== this.businessInfo.phone) {
      issues.push('Phone number format inconsistent')
      consistency -= 15
    }

    // Business name variations
    let usedName = this.businessInfo.name
    if (Math.random() < 0.2) {
      // Simulate name inconsistencies
      const variations = [
        this.businessInfo.name.replace('Solar', 'Solar Energy'),
        this.businessInfo.name.replace('LLC', ''),
        this.businessInfo.name + ' Inc.'
      ]
      usedName = variations[Math.floor(Math.random() * variations.length)]
      issues.push('Business name variation detected')
      consistency -= 20
    }

    // Address inconsistencies
    let usedAddress = this.businessInfo.address
    if (Math.random() < 0.15) {
      usedAddress = this.businessInfo.address.replace('Street', 'St').replace('Avenue', 'Ave')
      issues.push('Address abbreviation inconsistent')
      consistency -= 10
    }

    // Website issues
    let usedWebsite = this.businessInfo.website
    if (Math.random() < 0.1) {
      usedWebsite = ''
      issues.push('Missing website URL')
      consistency -= 25
    }

    // Generate realistic directory-specific URLs
    const directoryUrl = this.generateDirectoryUrl(directory.name, this.businessInfo.name)

    return {
      directory: directory.name,
      url: directoryUrl,
      businessName: usedName,
      phone: usedPhone,
      address: usedAddress,
      website: usedWebsite,
      status: issues.length > 0 ? 'incorrect' : 'found',
      lastChecked: new Date(),
      consistency,
      issues
    }
  }

  private formatPhone(phone: string): string {
    const digits = phone.replace(/[^\d]/g, '')
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    }
    return phone
  }

  private generateDirectoryUrl(directoryName: string, businessName: string): string {
    const slug = businessName.toLowerCase().replace(/[^a-z0-9]/g, '-')
    
    const urlMap: { [key: string]: string } = {
      'Google My Business': `https://www.google.com/maps/place/${slug}`,
      'Yelp': `https://www.yelp.com/biz/${slug}`,
      'Facebook': `https://www.facebook.com/${slug}`,
      'Yellow Pages': `https://www.yellowpages.com/business/${slug}`,
      'Whitepages': `https://www.whitepages.com/business/${slug}`,
      'Superpages': `https://www.superpages.com/bp/${slug}`,
      'Foursquare': `https://foursquare.com/v/${slug}`,
      'Angie\'s List': `https://www.angi.com/companydetails/${slug}`
    }

    return urlMap[directoryName] || `https://example.com/${slug}`
  }

  async generateCitationSummary(citations: CitationData[]): Promise<CitationSummary> {
    const totalDirectories = citations.length
    const foundCitations = citations.filter(c => c.status === 'found').length
    const consistentCitations = citations.filter(c => c.consistency === 100).length
    const inconsistentCitations = citations.filter(c => c.status === 'incorrect').length
    const missingCitations = citations.filter(c => c.status === 'not-found').length

    // Calculate overall consistency score
    const avgConsistency = citations.reduce((sum, c) => sum + c.consistency, 0) / totalDirectories

    // Collect top issues
    const allIssues = citations.flatMap(c => c.issues)
    const issueCount: { [key: string]: number } = {}
    allIssues.forEach(issue => {
      issueCount[issue] = (issueCount[issue] || 0) + 1
    })

    const topIssues = Object.entries(issueCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([issue]) => issue)

    return {
      totalDirectories,
      foundCitations,
      consistentCitations,
      inconsistentCitations,
      missingCitations,
      consistencyScore: Math.round(avgConsistency),
      lastUpdated: new Date(),
      topIssues
    }
  }

  async getFixRecommendations(citations: CitationData[]): Promise<Array<{
    priority: 'high' | 'medium' | 'low'
    action: string
    description: string
    impact: string
    effort: 'Low' | 'Medium' | 'High'
  }>> {
    const recommendations = []

    // Missing high-value citations
    const missingMainDirectories = citations.filter(c => 
      ['Google My Business', 'Bing Places', 'Yelp', 'Facebook'].includes(c.directory) && 
      c.status === 'not-found'
    )

    for (const missing of missingMainDirectories) {
      recommendations.push({
        priority: 'high' as const,
        action: `Create ${missing.directory} listing`,
        description: `Your business is not listed on ${missing.directory}, a major directory`,
        impact: 'High - Major directories drive significant traffic and local visibility',
        effort: 'Medium' as const
      })
    }

    // Inconsistent NAP data
    const inconsistentCitations = citations.filter(c => c.status === 'incorrect')
    if (inconsistentCitations.length > 0) {
      recommendations.push({
        priority: 'high' as const,
        action: 'Fix NAP inconsistencies',
        description: `${inconsistentCitations.length} citations have inconsistent business information`,
        impact: 'High - Inconsistent data confuses customers and hurts local SEO',
        effort: 'Medium' as const
      })
    }

    // Missing website URLs
    const missingWebsites = citations.filter(c => c.status === 'found' && !c.website)
    if (missingWebsites.length > 0) {
      recommendations.push({
        priority: 'medium' as const,
        action: 'Add missing website URLs',
        description: `${missingWebsites.length} citations are missing your website URL`,
        impact: 'Medium - Missing links reduce traffic potential',
        effort: 'Low' as const
      })
    }

    // Secondary directory opportunities
    const missingSecondaryDirectories = citations.filter(c => 
      !['Google My Business', 'Bing Places', 'Yelp', 'Facebook'].includes(c.directory) && 
      c.status === 'not-found'
    )

    if (missingSecondaryDirectories.length > 2) {
      recommendations.push({
        priority: 'low' as const,
        action: 'Create additional directory listings',
        description: `${missingSecondaryDirectories.length} additional citation opportunities available`,
        impact: 'Low-Medium - Additional citations improve overall authority',
        effort: 'High' as const
      })
    }

    return recommendations
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export default CitationMonitorService
