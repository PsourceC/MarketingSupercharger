'use client'

import { useState, useEffect } from 'react'

interface DataSourceStatus {
  connected: boolean
  isLive: boolean
  source: string
  lastUpdated?: string
}

export default function DataSourceIndicator() {
  const [mounted, setMounted] = useState(false)
  const [status, setStatus] = useState<DataSourceStatus>({
    connected: false,
    isLive: false,
    source: 'Loading...'
  })

  useEffect(() => {
    setMounted(true)
    checkDataSource()
  }, [])

  const checkDataSource = async () => {
    try {
      const [svcRes, authRes] = await Promise.all([
        fetch('/api/service-status', { cache: 'no-cache', headers: { 'Cache-Control': 'no-cache' } }),
        fetch('/api/auth/status', { cache: 'no-cache', headers: { 'Cache-Control': 'no-cache' } })
      ])

      const svcJson = svcRes.ok ? await svcRes.json() : { services: {} }
      const services = svcJson.services || {}
      const authJson = authRes.ok ? await authRes.json() : { connected: false }

      const aiLive = services['ai-ranking-tracker']?.status === 'working'
      const gscLive = !!authJson.connected

      let isLive = false
      let source = 'Sample Data'
      if (gscLive) {
        isLive = true
        source = 'Google Search Console (Live)'
      } else if (aiLive) {
        isLive = true
        source = 'AI Ranking Tracker (Live)'
      }

      setStatus({
        connected: isLive,
        isLive,
        source,
        lastUpdated: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error checking data source:', error)
      setStatus({
        connected: false,
        isLive: false,
        source: 'Sample Data'
      })
    }
  }

  if (!mounted) {
    return (
      <div className="data-source-indicator">
        <span className="data-source-status loading">
          <span className="status-dot"></span>
          Loading...
        </span>
      </div>
    )
  }

  return (
    <div className="data-source-indicator">
      <div className="data-source-status">
        <span className={`status-dot ${status.isLive ? 'live' : 'sample'}`}></span>
        <span className="source-text">
          {status.isLive ? '🔴 LIVE' : '📊 SAMPLE'} Data: {status.source}
        </span>
        {status.isLive && (
          <span className="live-badge">Real-time</span>
        )}
      </div>
      
      {!status.connected && (
        <p className="connection-prompt">
          💡 <strong>Connect Google Search Console</strong> above to see your real data!
        </p>
      )}
    </div>
  )
}
