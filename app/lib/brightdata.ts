import 'server-only'

interface SearchResult {
  title: string
  url: string
  position: number
  snippet?: string
}

interface BrightDataSearchResponse {
  results: SearchResult[]
  total_results?: number
  search_metadata?: {
    query: string
    location?: string
  }
}

export class BrightDataService {
  private apiKey: string
  private baseUrl = 'https://api.brightdata.com/datasets/v1'

  constructor() {
    this.apiKey = process.env.BRIGHTDATA_API_KEY || ''
    if (!this.apiKey) {
      throw new Error('BRIGHTDATA_API_KEY environment variable is required')
    }
  }

  async searchGoogle(query: string, location?: string): Promise<BrightDataSearchResponse> {
    try {
      // Use Bright Data's Web Search dataset API
      const requestBody = {
        url: `https://www.google.com/search?q=${encodeURIComponent(query)}&num=100${location ? `&location=${encodeURIComponent(location)}` : ''}`,
        format: 'json'
      }

      const response = await fetch(`${this.baseUrl}/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Bright Data API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()

      // Parse Google search results from Bright Data response
      const results = this.parseGoogleResults(data)

      return {
        results,
        total_results: results.length,
        search_metadata: {
          query,
          location
        }
      }
    } catch (error) {
      console.error('Bright Data search error:', error)
      throw error
    }
  }

  private parseGoogleResults(data: any): SearchResult[] {
    try {
      // Bright Data returns raw HTML, we need to parse search results
      // For now, simulate parsing - in production you'd parse the actual HTML
      const results: SearchResult[] = []

      // This is a simplified parser - you'd use a proper HTML parser like cheerio
      if (data && data.html) {
        // Simulate extracting 10 results for demo
        for (let i = 1; i <= 10; i++) {
          results.push({
            title: `Sample Result ${i}`,
            url: `https://example${i}.com`,
            position: i,
            snippet: `Sample snippet for result ${i}`
          })
        }
      }

      return results
    } catch (error) {
      console.error('Error parsing Google results:', error)
      return []
    }
  }

  async findDomainRanking(query: string, domain: string, location?: string): Promise<{
    position: number | null
    url?: string
    title?: string
    estimatedTraffic: number
  }> {
    try {
      const searchResults = await this.searchGoogle(query, location)
      
      // Find the domain in search results
      const domainResult = searchResults.results.find(result => 
        result.url.includes(domain) || new URL(result.url).hostname.includes(domain)
      )

      if (domainResult) {
        const estimatedTraffic = this.estimateTrafficFromPosition(domainResult.position, query, location)
        
        return {
          position: domainResult.position,
          url: domainResult.url,
          title: domainResult.title,
          estimatedTraffic
        }
      }

      return {
        position: null,
        estimatedTraffic: 0
      }
    } catch (error) {
      console.error('Error finding domain ranking:', error)
      throw error
    }
  }

  private estimateTrafficFromPosition(position: number, keyword: string, location?: string): number {
    // Estimate monthly search volume based on keyword and location
    const baseVolumes: { [key: string]: number } = {
      'solar installation': 5000,
      'solar panels': 8000,
      'solar financing': 2000,
      'solar company': 3000,
      'solar quotes': 4000,
      'residential solar': 3500,
      'commercial solar': 1500,
      'solar roof': 2500
    }

    const baseVolume = baseVolumes[keyword.toLowerCase()] || 1000

    // Adjust for location size
    let locationMultiplier = 1
    if (location?.includes('Phoenix')) locationMultiplier = 1.5
    if (location?.includes('Los Angeles')) locationMultiplier = 2.0
    if (location?.includes('San Diego')) locationMultiplier = 1.3
    if (location?.includes('Austin')) locationMultiplier = 1.2

    const searchVolume = Math.floor(baseVolume * locationMultiplier)

    // Calculate CTR based on position
    const ctr = this.getCTRByPosition(position)
    
    return Math.floor(searchVolume * (ctr / 100))
  }

  private getCTRByPosition(position: number): number {
    // Industry average CTR by position
    const ctrByPosition: { [key: number]: number } = {
      1: 31.7, 2: 24.7, 3: 18.7, 4: 13.1, 5: 9.5,
      6: 6.9, 7: 5.1, 8: 3.8, 9: 2.8, 10: 2.2
    }

    if (position <= 10) {
      return ctrByPosition[position] || 1.0
    } else if (position <= 20) {
      return 1.0
    } else if (position <= 50) {
      return 0.5
    } else {
      return 0.1
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Simple test to verify API key is valid
      const response = await fetch(`${this.baseUrl}/ping`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        return {
          success: true,
          message: 'Bright Data API key is valid and connected'
        }
      } else {
        // If ping endpoint doesn't exist, try a minimal request
        return await this.testWithMinimalRequest()
      }
    } catch (error: any) {
      // Fallback test method
      return await this.testWithMinimalRequest()
    }
  }

  private async testWithMinimalRequest(): Promise<{ success: boolean; message: string }> {
    try {
      // Test with a minimal request to verify API key
      const testUrl = 'https://www.google.com'
      const requestBody = {
        url: testUrl,
        format: 'json'
      }

      const response = await fetch(`${this.baseUrl}/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (response.ok) {
        return {
          success: true,
          message: 'Bright Data API key is valid (tested with minimal request)'
        }
      } else {
        const errorText = await response.text()
        return {
          success: false,
          message: `API test failed: ${response.status} - ${errorText}`
        }
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Connection test failed: ${error.message}`
      }
    }
  }
}

export const brightData = new BrightDataService()
