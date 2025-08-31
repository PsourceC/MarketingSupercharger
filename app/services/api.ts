// API service layer for solar business dashboard data

export interface Metric {
  id: string
  title: string
  value: string | number
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: string
  target?: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  explanation: string
  whyItMatters: string
}

export interface Location {
  id: string
  name: string
  lat: number
  lng: number
  overallScore: number
  keywordScores: { [keyword: string]: number }
  population: number
  searchVolume: number
  lastUpdated: string
  trends: {
    keyword: string
    change: number
    changeText: string
  }[]
}

export interface PriorityAction {
  id: string
  priority: 'critical' | 'high' | 'medium'
  title: string
  description: string
  impact: string
  effort: 'Low' | 'Medium' | 'High'
  timeline: string
  automatable: boolean
  category: 'GMB' | 'SEO' | 'Reviews' | 'Content' | 'Technical'
  completionPercentage?: number
  nextSteps: string[]
}

export interface DataUpdate {
  id: string
  timestamp: Date
  type: 'ranking' | 'review' | 'gmb' | 'citation' | 'competitor'
  location: string
  message: string
  impact: 'positive' | 'negative' | 'neutral'
  priority: 'high' | 'medium' | 'low'
}

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api'

// Generic API fetch function with improved error handling
export async function apiFetch<T>(endpoint: string, options?: RequestInit, retries = 1): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  let lastError: Error

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

    try {
      // Avoid external signals overriding our timeout controller
      const { signal: _ignoredSignal, headers: userHeaders, ...rest } = options || {}

      const response = await fetch(url, {
        ...rest,
        headers: {
          'Content-Type': 'application/json',
          ...(userHeaders || {}),
        },
        signal: controller.signal,
      })

      if (!response.ok) {
        // Don't retry for client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`Client error: ${response.status} ${response.statusText}`)
        }

        // Retry for server errors (5xx) if retries left
        if (attempt < retries) {
          console.warn(`API call failed (attempt ${attempt + 1}), retrying...`, response.status)
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
          continue
        }

        throw new Error(`Server error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      lastError = error

      if (error.name === 'AbortError') {
        console.warn(`API call timeout or aborted (attempt ${attempt + 1})`)
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 2000))
          continue
        }
        throw new Error(`Request timed out`)
      }

      if (typeof error.message === 'string' && error.message.includes('Failed to fetch')) {
        console.warn(`Network error (attempt ${attempt + 1}):`, error.message)
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 2000))
          continue
        }
        throw new Error(`Network error: ${error.message}`)
      }

      // For other errors, don't retry
      throw error
    } finally {
      clearTimeout(timeoutId)
    }
  }

  throw lastError
}

// Business metrics API calls
export async function fetchBusinessMetrics(): Promise<Metric[]> {
  try {
    // In a real implementation, this would call your analytics API
    // For now, we'll simulate real data fetching with environment-based responses
    
    if (process.env.NODE_ENV === 'development') {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    return await apiFetch<Metric[]>('/metrics')
  } catch (error) {
    console.error('Failed to fetch business metrics:', error)
    // Fallback to mock data while APIs are being set up
    return getMockMetrics()
  }
}

// Location performance API calls
export async function fetchLocationPerformance(): Promise<Location[]> {
  try {
    return await apiFetch<Location[]>('/locations')
  } catch (error) {
    console.error('Failed to fetch location performance:', error)
    return getMockLocations()
  }
}

// Priority actions API calls
export async function fetchPriorityActions(): Promise<PriorityAction[]> {
  try {
    return await apiFetch<PriorityAction[]>('/actions')
  } catch (error) {
    console.error('Failed to fetch priority actions:', error)
    return getMockActions()
  }
}

// Real-time updates API calls
export async function fetchRecentUpdates(): Promise<DataUpdate[]> {
  try {
    const updates = await apiFetch<any[]>('/updates/recent')

    // Convert timestamp strings to Date objects
    return updates.map(update => ({
      ...update,
      timestamp: typeof update.timestamp === 'string' ? new Date(update.timestamp) : update.timestamp
    }))
  } catch (error) {
    console.error('Failed to fetch recent updates:', error)
    return []
  }
}

// Legacy competitor data endpoint (replaced by /competitor-tracking)

// Real-time ranking data
export async function fetchCurrentRankings(keyword?: string) {
  try {
    const endpoint = keyword ? `/rankings?keyword=${encodeURIComponent(keyword)}` : '/rankings'
    return await apiFetch(endpoint)
  } catch (error) {
    console.error('Failed to fetch current rankings:', error)
    return null
  }
}

// Google My Business data
export async function fetchGMBData() {
  try {
    return await apiFetch('/gmb')
  } catch (error) {
    console.error('Failed to fetch GMB data:', error)
    return null
  }
}

// Citation tracking
export async function fetchCitationData() {
  try {
    return await apiFetch('/citations')
  } catch (error) {
    console.error('Failed to fetch citation data:', error)
    return {
      citations: [],
      summary: {
        totalDirectories: 0,
        foundCitations: 0,
        consistentCitations: 0,
        inconsistentCitations: 0,
        missingCitations: 0,
        consistencyScore: 0,
        lastUpdated: new Date(),
        topIssues: []
      },
      recommendations: [],
      error: error instanceof Error ? error.message : 'Failed to fetch citation data'
    }
  }
}

// Competitor tracking
export async function fetchCompetitorData() {
  try {
    return await apiFetch('/competitor-tracking')
  } catch (error) {
    console.error('Failed to fetch competitor data:', error)
    return {
      competitors: [],
      summary: {
        totalCompetitors: 0,
        averagePosition: 0,
        marketShare: 0,
        topCompetitors: [],
        keywordGaps: [],
        lastUpdated: new Date()
      },
      insights: [],
      error: error instanceof Error ? error.message : 'Failed to fetch competitor data'
    }
  }
}

// Refresh citation data
export async function refreshCitationData() {
  try {
    await apiFetch('/citations', { method: 'POST', body: JSON.stringify({ action: 'refresh' }) })
    return true
  } catch (error) {
    console.error('Failed to refresh citation data:', error)
    return false
  }
}

// Refresh competitor data
export async function refreshCompetitorData() {
  try {
    await apiFetch('/competitor-tracking', { method: 'POST', body: JSON.stringify({ action: 'refresh' }) })
    return true
  } catch (error) {
    console.error('Failed to refresh competitor data:', error)
    return false
  }
}

// Review management
export async function fetchReviewData() {
  try {
    return await apiFetch('/reviews')
  } catch (error) {
    console.error('Failed to fetch review data:', error)
    return null
  }
}

// Data refresh trigger
export async function triggerDataRefresh() {
  try {
    const [compRes, refreshRes, liveRes] = await Promise.allSettled([
      apiFetch('/competitor-tracking/schedule', { method: 'POST' }),
      apiFetch('/refresh', { method: 'POST' }, 2),
      apiFetch('/live-rankings/schedule', { method: 'POST' })
    ])

    const ok = (compRes.status === 'fulfilled') || (refreshRes.status === 'fulfilled') || (liveRes.status === 'fulfilled')
    if (!ok) throw new Error('All refresh tasks failed')
    console.log('Data refresh tasks complete', { competitorSchedule: compRes.status, refresh: refreshRes.status })
    return true
  } catch (error: any) {
    console.error('Failed to trigger data refresh:', error.message)

    if (error.message.includes('timeout') || error.message.includes('Network error')) {
      console.warn('Data refresh may have started despite network issues')
      return true
    }

    return false
  }
}

// Mock data functions (temporary fallbacks)
function getMockMetrics(): Metric[] {
  return [
    {
      id: 'avg-position',
      title: 'Search Ranking',
      value: 'Loading...',
      change: 'Fetching real data...',
      changeType: 'neutral',
      icon: '🎯',
      target: 'Connecting to ranking API...',
      priority: 'high',
      explanation: 'Live ranking data from Google Search Console',
      whyItMatters: 'Real-time tracking shows actual customer discovery patterns'
    }
  ]
}

function getMockLocations(): Location[] {
  return [
    {
      id: 'fetching',
      name: 'Loading Real Data...',
      lat: 30.2672,
      lng: -97.7431,
      overallScore: 0,
      keywordScores: {},
      population: 0,
      searchVolume: 0,
      lastUpdated: 'Connecting to data sources...',
      trends: []
    }
  ]
}

function getMockActions(): PriorityAction[] {
  return [
    {
      id: 'setup-data-sources',
      priority: 'critical',
      title: 'Connect Real Data Sources',
      description: 'Dashboard is currently showing placeholder data. Connect to real APIs.',
      impact: 'Enable real-time business insights',
      effort: 'Medium',
      timeline: 'Today',
      automatable: false,
      category: 'Technical',
      completionPercentage: 0,
      nextSteps: [
        'Connect Google Search Console API',
        'Set up Google My Business API',
        'Configure ranking tracking service',
        'Connect review monitoring APIs'
      ]
    }
  ]
}

function getMockCompetitors() {
  return {
    competitors: [],
    summary: {
      totalCompetitors: 0,
      averagePosition: 0,
      marketShare: 0,
      topCompetitors: [],
      keywordGaps: [],
      lastUpdated: new Date()
    },
    insights: [],
    message: 'Custom competitor tracking service ready to analyze your market'
  }
}

// Real-time data subscription (WebSocket or polling)
export class DataSubscriptionService {
  private listeners: ((data: any) => void)[] = []
  private pollInterval?: NodeJS.Timeout

  startPolling(intervalMs: number = 60000) {
    this.stopPolling()
    this.pollInterval = setInterval(async () => {
      try {
        const updates = await fetchRecentUpdates()
        this.notifyListeners(updates)
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, intervalMs)
  }

  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
      this.pollInterval = undefined
    }
  }

  subscribe(listener: (data: any) => void) {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  private notifyListeners(data: any) {
    this.listeners.forEach(listener => listener(data))
  }
}

export const dataSubscription = new DataSubscriptionService()
