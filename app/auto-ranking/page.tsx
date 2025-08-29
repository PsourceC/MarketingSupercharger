'use client'

import { useState, useEffect } from 'react'

interface RankingResult {
  location: string
  keyword: string
  position: number
  estimatedClicks: number
  estimatedImpressions: number
}

interface RecentRanking {
  location_name: string
  keyword: string
  ranking_position: number
  clicks: number
  impressions: number
  ctr: number
  created_at: string
}

export default function AutoRankingPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<RankingResult[]>([])
  const [recentRankings, setRecentRankings] = useState<RecentRanking[]>([])
  const [automationStatus, setAutomationStatus] = useState<any>(null)
  const [config, setConfig] = useState({
    keywords: ['solar installation', 'solar panels', 'solar financing'],
    locations: ['Phoenix, AZ', 'Tucson, AZ', 'Mesa, AZ'],
    domain: 'affordablesolar.example'
  })

  useEffect(() => {
    loadRecentRankings()
    loadAutomationStatus()
  }, [])

  const loadAutomationStatus = async () => {
    try {
      const response = await fetch('/api/auto-schedule')
      const data = await response.json()
      setAutomationStatus(data)
    } catch (error) {
      console.error('Error loading automation status:', error)
    }
  }

  const runScheduledCheck = async () => {
    setIsRunning(true)
    try {
      const response = await fetch('/api/auto-schedule', { method: 'POST' })
      const data = await response.json()

      if (data.success) {
        alert(`Automated check completed! Processed ${data.processed} keyword/location combinations.`)
        loadRecentRankings()
        loadAutomationStatus()
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      alert('Error running automated check: ' + error)
    } finally {
      setIsRunning(false)
    }
  }

  const loadRecentRankings = async () => {
    try {
      const response = await fetch('/api/auto-ranking')
      const data = await response.json()
      setRecentRankings(data.rankings || [])
    } catch (error) {
      console.error('Error loading recent rankings:', error)
    }
  }

  const runAutomaticRanking = async () => {
    setIsRunning(true)
    setResults([])
    
    try {
      const response = await fetch('/api/auto-ranking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setResults(data.results)
        loadRecentRankings() // Refresh recent data
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      alert('Error running ranking check: ' + error)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">AI-Powered Ranking Tracker</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">🤖 Alternative to Google Search Console</h2>
        <p className="text-blue-700">
          This tool uses AI and web search APIs to automatically track your rankings without requiring DNS access or Google Search Console setup.
        </p>
      </div>

      {automationStatus && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">🔄 Automation Status</h3>
              <div className="text-green-700 text-sm space-y-1">
                <p><strong>Status:</strong> {automationStatus.status}</p>
                <p><strong>Keywords Tracked:</strong> {automationStatus.configuredKeywords}</p>
                <p><strong>Locations Tracked:</strong> {automationStatus.configuredLocations}</p>
                <p><strong>Recent Entries (24h):</strong> {automationStatus.recentEntries}</p>
                {automationStatus.lastCheck && (
                  <p><strong>Last Check:</strong> {new Date(automationStatus.lastCheck).toLocaleString()}</p>
                )}
              </div>
            </div>
            <button
              onClick={runScheduledCheck}
              disabled={isRunning}
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {isRunning ? 'Running...' : 'Run Now'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Configuration</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Domain</label>
            <input
              type="text"
              value={config.domain}
              onChange={(e) => setConfig({...config, domain: e.target.value})}
              className="w-full p-2 border rounded"
              placeholder="yourdomain.com"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Keywords (one per line)</label>
            <textarea
              value={config.keywords.join('\n')}
              onChange={(e) => setConfig({...config, keywords: e.target.value.split('\n').filter(k => k.trim())})}
              className="w-full p-2 border rounded h-24"
              placeholder="solar installation&#10;solar panels&#10;solar financing"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Locations (one per line)</label>
            <textarea
              value={config.locations.join('\n')}
              onChange={(e) => setConfig({...config, locations: e.target.value.split('\n').filter(l => l.trim())})}
              className="w-full p-2 border rounded h-24"
              placeholder="Phoenix, AZ&#10;Tucson, AZ&#10;Mesa, AZ"
            />
          </div>

          <button
            onClick={runAutomaticRanking}
            disabled={isRunning}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isRunning ? 'Checking Rankings...' : 'Run Ranking Check'}
          </button>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Real Search APIs (Optional)</h3>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-gray-50 rounded">
              <strong>SerpApi</strong> - Google search results API
              <br />
              <span className="text-gray-600">Professional ranking tracking</span>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <strong>Bright Data</strong> - Web scraping platform
              <br />
              <span className="text-gray-600">Large-scale search data</span>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <strong>ScrapingBee</strong> - Search result scraper
              <br />
              <span className="text-gray-600">Easy integration for rankings</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Current implementation uses AI estimates. Connect real APIs for accurate data.
          </p>
        </div>
      </div>

      {results.length > 0 && (
        <div className="bg-white border rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Latest Results</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Location</th>
                  <th className="text-left p-2">Keyword</th>
                  <th className="text-left p-2">Position</th>
                  <th className="text-left p-2">Est. Impressions</th>
                  <th className="text-left p-2">Est. Clicks</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">{result.location}</td>
                    <td className="p-2">{result.keyword}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        result.position <= 3 ? 'bg-green-100 text-green-800' :
                        result.position <= 10 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        #{result.position}
                      </span>
                    </td>
                    <td className="p-2">{result.estimatedImpressions.toLocaleString()}</td>
                    <td className="p-2">{result.estimatedClicks.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {recentRankings.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Recent Tracking Data (Last 7 Days)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Location</th>
                  <th className="text-left p-2">Keyword</th>
                  <th className="text-left p-2">Position</th>
                  <th className="text-left p-2">Impressions</th>
                  <th className="text-left p-2">Clicks</th>
                  <th className="text-left p-2">CTR</th>
                </tr>
              </thead>
              <tbody>
                {recentRankings.slice(0, 20).map((ranking, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">{new Date(ranking.created_at).toLocaleDateString()}</td>
                    <td className="p-2">{ranking.location_name}</td>
                    <td className="p-2">{ranking.keyword}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        ranking.ranking_position <= 3 ? 'bg-green-100 text-green-800' :
                        ranking.ranking_position <= 10 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        #{ranking.ranking_position}
                      </span>
                    </td>
                    <td className="p-2">{ranking.impressions.toLocaleString()}</td>
                    <td className="p-2">{ranking.clicks.toLocaleString()}</td>
                    <td className="p-2">{ranking.ctr.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
