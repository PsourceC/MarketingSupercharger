'use client'

import { useState, useEffect } from 'react'
import { fetchCitationData, refreshCitationData } from '../services/api'

interface Citation {
  directory: string
  url: string
  businessName: string
  phone: string
  address: string
  website: string
  status: 'found' | 'not-found' | 'incorrect' | 'needs-update'
  lastChecked: Date
  consistency: number
  issues: string[]
}

interface CitationSummary {
  totalDirectories: number
  foundCitations: number
  consistentCitations: number
  inconsistentCitations: number
  missingCitations: number
  consistencyScore: number
  lastUpdated: Date
  topIssues: string[]
}

interface Recommendation {
  priority: 'high' | 'medium' | 'low'
  action: string
  description: string
  impact: string
  effort: 'Low' | 'Medium' | 'High'
}

export default function CitationMonitoringPage() {
  const [citationData, setCitationData] = useState<{
    citations: Citation[]
    summary: CitationSummary
    recommendations: Recommendation[]
    fromCache?: boolean
    error?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadCitationData = async () => {
    try {
      const data = await fetchCitationData()
      setCitationData(data)
    } catch (error) {
      console.error('Error loading citation data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshCitationData()
      await loadCitationData()
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadCitationData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Citation Monitoring</h1>
          <div className="bg-gray-900 rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Checking your business citations across directories...</p>
          </div>
        </div>
      </div>
    )
  }

  if (citationData?.error) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Citation Monitoring</h1>
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-400 mb-2">Service Error</h2>
            <p className="text-red-300">{citationData.error}</p>
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

  const { citations, summary, recommendations, fromCache } = citationData || { citations: [], summary: {} as CitationSummary, recommendations: [] }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'found': return 'text-green-400'
      case 'incorrect': return 'text-yellow-400'
      case 'not-found': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'found': return '✅'
      case 'incorrect': return '⚠️'
      case 'not-found': return '❌'
      default: return '❓'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-900/20'
      case 'medium': return 'border-l-yellow-500 bg-yellow-900/20'
      case 'low': return 'border-l-green-500 bg-green-900/20'
      default: return 'border-l-gray-500 bg-gray-900/20'
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Citation Monitoring</h1>
            <p className="text-gray-400">
              Custom service tracking your business listings across {summary.totalDirectories} directories
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
                Refreshing...
              </>
            ) : (
              <>
                🔄 Refresh Data
              </>
            )}
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-400 mb-2">Overall Consistency</h3>
            <div className="text-3xl font-bold text-blue-400">{summary.consistencyScore}%</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-400 mb-2">Found Citations</h3>
            <div className="text-3xl font-bold text-green-400">{summary.foundCitations}</div>
            <div className="text-sm text-gray-500">of {summary.totalDirectories} directories</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-400 mb-2">Needs Fixing</h3>
            <div className="text-3xl font-bold text-yellow-400">{summary.inconsistentCitations}</div>
            <div className="text-sm text-gray-500">incorrect listings</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-400 mb-2">Missing Listings</h3>
            <div className="text-3xl font-bold text-red-400">{summary.missingCitations}</div>
            <div className="text-sm text-gray-500">opportunities</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Citations List */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Directory Citations</h2>
            <div className="space-y-4">
              {citations.map((citation, index) => (
                <div key={index} className="border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{citation.directory}</h3>
                    <div className={`flex items-center gap-2 ${getStatusColor(citation.status)}`}>
                      <span>{getStatusIcon(citation.status)}</span>
                      <span className="capitalize">{citation.status.replace('-', ' ')}</span>
                    </div>
                  </div>
                  
                  {citation.status === 'found' && (
                    <div className="text-sm text-gray-400 space-y-1">
                      {citation.url && (
                        <div>
                          <span className="font-medium">URL:</span> 
                          <a href={citation.url} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-400 hover:underline ml-2">
                            {citation.url}
                          </a>
                        </div>
                      )}
                      {citation.businessName && (
                        <div><span className="font-medium">Business:</span> {citation.businessName}</div>
                      )}
                      {citation.phone && (
                        <div><span className="font-medium">Phone:</span> {citation.phone}</div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-medium">Consistency:</span>
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${citation.consistency}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">{citation.consistency}%</span>
                      </div>
                    </div>
                  )}

                  {citation.issues.length > 0 && (
                    <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-700 rounded">
                      <h4 className="text-sm font-medium text-yellow-400 mb-1">Issues:</h4>
                      <ul className="text-xs text-yellow-300 space-y-1">
                        {citation.issues.map((issue, i) => (
                          <li key={i}>• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Recommended Actions</h2>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={index} className={`border-l-4 p-4 rounded-r-lg ${getPriorityColor(rec.priority)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{rec.action}</h3>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        rec.priority === 'high' ? 'bg-red-600' : 
                        rec.priority === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
                      }`}>
                        {rec.priority.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                        {rec.effort} effort
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{rec.description}</p>
                  <p className="text-xs text-gray-400">{rec.impact}</p>
                </div>
              ))}
            </div>

            {summary.topIssues.length > 0 && (
              <div className="mt-6 p-4 bg-red-900/20 border border-red-700 rounded-lg">
                <h3 className="font-semibold text-red-400 mb-2">Top Issues to Fix</h3>
                <ul className="text-sm text-red-300 space-y-1">
                  {summary.topIssues.map((issue, index) => (
                    <li key={index}>• {issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Cost Savings Banner */}
        <div className="mt-8 bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-green-400 mb-2">💰 Cost-Effective Solution</h3>
          <p className="text-gray-300">
            This custom citation monitoring service provides essential functionality without expensive external subscriptions.
            Typical citation monitoring services cost $50-300/month. Our solution tracks the same data at a fraction of the cost.
          </p>
        </div>
      </div>
    </div>
  )
}
