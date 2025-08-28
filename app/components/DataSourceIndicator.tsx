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
      // Check OAuth status
      const authResponse = await fetch('/api/auth/status')
      const authData = await authResponse.json()
      
      setStatus({
        connected: authData.connected,
        isLive: authData.connected,
        source: authData.connected ? 'Google Search Console (Live)' : 'Sample Data',
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
