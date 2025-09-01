'use client'


import { useState, useEffect } from 'react'
import { fetchCompetitorData, refreshCompetitorData } from '../services/api'

interface CompetitorAnalysis {
  competitor: {
    id: string
    name: string
    domain: string
    location: string
    businessType: string
    lastUpdated: Date
  }
  rankings: Array<{
    keyword: string
    position: number | null
    url: string
    title: string
    estimatedTraffic: number
  }>
  averagePosition: number
  totalKeywords: number
  estimatedTraffic: number
  visibilityScore: number
  trending: 'up' | 'down' | 'stable'
}

interface CompetitorSummary {
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

interface Insight {
  insight: string
  type: 'opportunity' | 'threat' | 'trend'
  priority: 'high' | 'medium' | 'low'
  actionable: boolean
}

export default function CompetitorAnalysisPage() {
  const [competitorData, setCompetitorData] = useState<{
    competitors: CompetitorAnalysis[]
    summary: CompetitorSummary
    insights: Insight[]
    fromCache?: boolean
    error?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(null)

  const loadCompetitorData = async () => {
    try {
      const data = await fetchCompetitorData()
      setCompetitorData(data)
    } catch (error) {
      console.error('Error loading competitor data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshCompetitorData()
      await loadCompetitorData()
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadCompetitorData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Competitor Analysis</h1>
          <div className="bg-gray-900 rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Analyzing your competitive landscape...</p>
          </div>
        </div>
      </div>
    )
  }

  if (competitorData?.error) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Competitor Analysis</h1>
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-400 mb-2">Service Error</h2>
            <p className="text-red-300">{competitorData.error}</p>
            <button 
              onClick={handleRefresh}
              className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  const { competitors, summary, insights, fromCache } = competitorData || { 
    competitors: [], 
    summary: {} as CompetitorSummary, 
    insights: [] 
  }

  const getTrendingIcon = (trending: string) => {
    switch (trending) {
      case 'up': return '📈'
      case 'down': return '📉'
      case 'stable': return '➡️'
      default: return '❓'
    }
  }

  const getOpportunityColor = (opportunity: string) => {
    switch (opportunity) {
      case 'high': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'border-l-green-500 bg-green-900/20'
      case 'threat': return 'border-l-red-500 bg-red-900/20'
      case 'trend': return 'border-l-blue-500 bg-blue-900/20'
      default: return 'border-l-gray-500 bg-gray-900/20'
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Competitor Analysis</h1>
            <p className="text-gray-400">
              Custom tracking of {summary.totalCompetitors} competitors in your market
              {fromCache && ' (cached data)'}
            </p>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
          >
            {refreshing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Analyzing...
              </>
            ) : (
              <>
                🔍 Refresh Analysis
              </>
            )}
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-400 mb-2">Total Competitors</h3>
            <div className="text-3xl font-bold text-blue-400">{summary.totalCompetitors}</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-400 mb-2">Avg Position</h3>
            <div className="text-3xl font-bold text-orange-400">#{summary.averagePosition}</div>
            <div className="text-sm text-gray-500">competitor average</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-400 mb-2">Market Share</h3>
            <div className="text-3xl font-bold text-green-400">{summary.marketShare}%</div>
            <div className="text-sm text-gray-500">estimated opportunity</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-400 mb-2">Opportunities</h3>
            <div className="text-3xl font-bold text-purple-400">
              {summary.keywordGaps?.filter(gap => gap.opportunity === 'high').length || 0}
            </div>
            <div className="text-sm text-gray-500">high-opportunity keywords</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Competitors List */}
          <div className="lg:col-span-2 bg-gray-900 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Competitor Rankings</h2>
            <div className="space-y-4">
              {competitors.map((comp, index) => (
                <div 
                  key={comp.competitor.id} 
                  className={`border border-gray-700 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedCompetitor === comp.competitor.id ? 'border-blue-500 bg-blue-900/20' : 'hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedCompetitor(
                    selectedCompetitor === comp.competitor.id ? null : comp.competitor.id
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{comp.competitor.name}</h3>
                      <p className="text-sm text-gray-400">{comp.competitor.domain}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{getTrendingIcon(comp.trending)}</span>
                        <span className="text-sm px-2 py-1 bg-gray-700 rounded">
                          {comp.competitor.businessType.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">
                        Visibility: {comp.visibilityScore}%
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="text-center">
                      <div className="text-xl font-bold text-orange-400">#{Math.round(comp.averagePosition)}</div>
                      <div className="text-xs text-gray-500">Avg Position</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-400">{comp.totalKeywords}</div>
                      <div className="text-xs text-gray-500">Keywords</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-400">{comp.estimatedTraffic.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Est. Traffic</div>
                    </div>
                  </div>

                  {selectedCompetitor === comp.competitor.id && (
                    <div className="border-t border-gray-700 pt-4 mt-4">
                      <h4 className="font-medium mb-3">Keyword Rankings:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {comp.rankings.slice(0, 8).map((ranking, i) => (
                          <div key={i} className="flex justify-between items-center bg-gray-800 p-2 rounded text-sm">
                            <span className="truncate flex-1">{ranking.keyword}</span>
                            <span className={`font-bold ml-2 ${
                              ranking.position && ranking.position <= 5 ? 'text-green-400' :
                              ranking.position && ranking.position <= 10 ? 'text-yellow-400' :
                              'text-red-400'
                            }`}>
                              {ranking.position ? `#${ranking.position}` : 'Not ranked'}
                            </span>
                          </div>
                        ))}
                      </div>
                      {comp.rankings.length > 8 && (
                        <p className="text-xs text-gray-500 mt-2">
                          Showing top 8 of {comp.rankings.length} keywords
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Insights & Opportunities */}
          <div className="space-y-6">
            {/* Market Insights */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Market Insights</h3>
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <div key={index} className={`border-l-4 p-3 rounded-r-lg ${getInsightColor(insight.type)}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-1 bg-gray-700 rounded uppercase">
                        {insight.type}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        insight.priority === 'high' ? 'bg-red-600' : 
                        insight.priority === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
                      }`}>
                        {insight.priority}
                      </span>
                    </div>
                    <p className="text-sm">{insight.insight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Keyword Opportunities */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Keyword Opportunities</h3>
              <div className="space-y-3">
                {summary.keywordGaps?.slice(0, 10).map((gap, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm truncate flex-1">{gap.keyword}</span>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-xs text-gray-500">{gap.competitorCount} competitors</span>
                      <span className={`text-xs px-2 py-1 rounded ${getOpportunityColor(gap.opportunity)}`}>
                        {gap.opportunity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Competitors */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Top Performers</h3>
              <div className="space-y-3">
                {summary.topCompetitors?.slice(0, 5).map((competitor, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{competitor.name}</div>
                      <div className="text-xs text-gray-500">{competitor.domain}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">#{competitor.averagePosition}</div>
                      <div className="text-xs text-gray-500">{competitor.visibilityScore}% visibility</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cost Savings Banner */}
        <div className="mt-8 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-purple-400 mb-2">🎯 Smart Competitive Intelligence</h3>
          <p className="text-gray-300">
            This custom competitor tracking solution provides enterprise-level competitive intelligence without expensive subscriptions.
            Services like SEMrush or Ahrefs cost $100-500/month. Our solution delivers the essential insights your solar business needs.
          </p>
        </div>
      </div>
    </div>
  )
}
