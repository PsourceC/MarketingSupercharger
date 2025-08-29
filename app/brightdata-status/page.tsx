'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface BrightDataStatus {
  success: boolean
  connectionTest: string
  testSearch?: {
    keyword: string
    location: string
    domain: string
    position: number | null
    url?: string
    title?: string
    estimatedTraffic: number
  }
  config: {
    hasApiKey: boolean
    apiKeyLength: number
  }
  error?: string
}

export default function BrightDataStatusPage() {
  const [status, setStatus] = useState<BrightDataStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [testRunning, setTestRunning] = useState(false)

  useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-brightdata')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error('Error loading status:', error)
    } finally {
      setLoading(false)
    }
  }

  const runRankingTest = async () => {
    setTestRunning(true)
    try {
      const response = await fetch('/api/auto-ranking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: ['solar installation', 'solar panels'],
          locations: ['Phoenix, AZ', 'Austin, TX'],
          domain: 'affordablesolar.example'
        })
      })
      
      const data = await response.json()
      alert(`Ranking test completed!\n\nResults: ${data.results?.length || 0} rankings checked\nBright Data Results: ${data.summary?.brightDataResults || 0}\nFallback Results: ${data.summary?.fallbackResults || 0}`)
      
      // Refresh status after test
      loadStatus()
    } catch (error) {
      alert('Error running ranking test: ' + error)
    } finally {
      setTestRunning(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Bright Data status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Link href="/setup" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Back to Setup
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 Bright Data Integration Status</h1>
        <p className="text-gray-600">Real search result scraping for accurate ranking data</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Connection Status */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Connection Status</h2>
            {status?.success ? (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                ✅ Connected
              </span>
            ) : (
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                ❌ Error
              </span>
            )}
          </div>
          
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">API Key:</span>
              <span className="ml-2 text-sm text-gray-900">
                {status?.config.hasApiKey ? `Configured (${status.config.apiKeyLength} characters)` : 'Not configured'}
              </span>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-500">Status:</span>
              <span className="ml-2 text-sm text-gray-900">
                {status?.connectionTest || 'Unknown'}
              </span>
            </div>
            
            {status?.error && (
              <div>
                <span className="text-sm font-medium text-red-500">Error:</span>
                <p className="mt-1 text-sm text-red-600 bg-red-50 p-2 rounded">
                  {status.error}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Test Search Results */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Search Results</h2>
          
          {status?.testSearch ? (
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Keyword:</span>
                <span className="ml-2 text-sm text-gray-900">{status.testSearch.keyword}</span>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500">Location:</span>
                <span className="ml-2 text-sm text-gray-900">{status.testSearch.location}</span>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500">Domain:</span>
                <span className="ml-2 text-sm text-gray-900">{status.testSearch.domain}</span>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500">Position:</span>
                <span className={`ml-2 px-2 py-1 rounded text-sm font-medium ${
                  status.testSearch.position && status.testSearch.position <= 10 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {status.testSearch.position ? `#${status.testSearch.position}` : 'Not found in top 100'}
                </span>
              </div>
              
              {status.testSearch.url && (
                <div>
                  <span className="text-sm font-medium text-gray-500">URL:</span>
                  <a 
                    href={status.testSearch.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 text-sm text-blue-600 hover:text-blue-800 break-all"
                  >
                    {status.testSearch.url}
                  </a>
                </div>
              )}
              
              <div>
                <span className="text-sm font-medium text-gray-500">Est. Monthly Traffic:</span>
                <span className="ml-2 text-sm text-gray-900">{status.testSearch.estimatedTraffic} clicks</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No test search data available</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white border rounded-lg p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
        
        <div className="flex flex-wrap gap-4">
          <button
            onClick={loadStatus}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? '🔄 Refreshing...' : '🔄 Refresh Status'}
          </button>
          
          <button
            onClick={runRankingTest}
            disabled={testRunning || !status?.success}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            {testRunning ? '⏳ Running Test...' : '🚀 Run Ranking Test'}
          </button>
          
          <Link
            href="/auto-ranking"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            📊 View Ranking Tracker
          </Link>
        </div>
      </div>

      {/* Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-4">📘 About Bright Data Integration</h2>
        
        <div className="space-y-4 text-blue-800">
          <div>
            <h3 className="font-medium mb-2">🎯 Current Mode: Simulation</h3>
            <p className="text-sm">
              Your API key is configured and the system is running in simulation mode with realistic data. 
              This provides accurate ranking patterns while we finalize the real API endpoint configuration.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">✅ What's Working:</h3>
            <ul className="text-sm space-y-1 ml-4">
              <li>• API key validation and secure storage</li>
              <li>• Realistic ranking simulation based on solar industry data</li>
              <li>• Proper CTR calculations and traffic estimates</li>
              <li>• Integration with your ranking tracker database</li>
              <li>• Error handling and fallback systems</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">🚀 Next Steps:</h3>
            <ul className="text-sm space-y-1 ml-4">
              <li>• Real API endpoint configuration (when Bright Data docs are confirmed)</li>
              <li>• Live Google search result scraping</li>
              <li>• Competitor tracking and monitoring</li>
              <li>• Historical ranking data collection</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
