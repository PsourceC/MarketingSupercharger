'use client'

import { useState, useEffect, useCallback } from 'react'

interface DataUpdate {
  id: string
  timestamp: Date
  type: 'ranking' | 'review' | 'gmb' | 'citation' | 'competitor'
  location: string
  message: string
  impact: 'positive' | 'negative' | 'neutral'
  priority: 'high' | 'medium' | 'low'
  metric?: string
  oldValue?: number
  newValue?: number
}

interface RefreshStatus {
  isRefreshing: boolean
  lastRefresh: Date
  nextRefresh: Date
  autoRefreshEnabled: boolean
  refreshInterval: number // in minutes
}

export default function DataRefreshSystem() {
  const [mounted, setMounted] = useState(false)
  const [refreshStatus, setRefreshStatus] = useState<RefreshStatus>({
    isRefreshing: false,
    lastRefresh: new Date(),
    nextRefresh: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    autoRefreshEnabled: true,
    refreshInterval: 15
  })

  const [recentUpdates, setRecentUpdates] = useState<DataUpdate[]>([])
  const [refreshCount, setRefreshCount] = useState(0)

  // Track when component has mounted to prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Simulate realistic data updates
  const generateRandomUpdate = useCallback((): DataUpdate => {
    const locations = ['Central Austin', 'Georgetown', 'Cedar Park', 'Round Rock', 'Pflugerville', 'Leander', 'Hutto']
    const updateTypes = [
      {
        type: 'ranking' as const,
        messages: [
          'moved up 2 positions for "solar panels near me"',
          'dropped 1 position for "best solar company"',
          'reached top 5 for "affordable solar installation"',
          'competitor pushed you down 1 spot',
          'gained 3 positions after GMB optimization'
        ]
      },
      {
        type: 'review' as const,
        messages: [
          'received new 5-star review',
          'review average increased to 4.8 stars',
          'competitor got 3 new reviews',
          'review response rate improved to 92%'
        ]
      },
      {
        type: 'gmb' as const,
        messages: [
          'GMB post got 45% more engagement',
          'Google Business Profile views increased 23%',
          'new photos received 156 views',
          'GMB Q&A activity detected'
        ]
      },
      {
        type: 'citation' as const,
        messages: [
          'new citation discovered on YellowPages',
          'citation consistency improved by 5%',
          'NAP data updated across 3 directories',
          'duplicate listing removed from Yelp'
        ]
      },
      {
        type: 'competitor' as const,
        messages: [
          'competitor launched new GMB campaign',
          'competitor prices changed by 15%',
          'new competitor entered the market',
          'competitor ranking declined in 2 locations'
        ]
      }
    ]

    const location = locations[Math.floor(Math.random() * locations.length)]
    const typeData = updateTypes[Math.floor(Math.random() * updateTypes.length)]
    const message = typeData.messages[Math.floor(Math.random() * typeData.messages.length)]
    
    // Determine impact based on message content
    let impact: 'positive' | 'negative' | 'neutral' = 'neutral'
    if (message.includes('up') || message.includes('increased') || message.includes('improved') || message.includes('gained') || message.includes('5-star')) {
      impact = 'positive'
    } else if (message.includes('down') || message.includes('dropped') || message.includes('declined') || message.includes('pushed')) {
      impact = 'negative'
    }

    const priority = impact === 'positive' || impact === 'negative' ? 'medium' : 'low'

    return {
      id: `update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: typeData.type,
      location,
      message: `${location} ${message}`,
      impact,
      priority
    }
  }, [])

  // Auto-refresh timer
  useEffect(() => {
    if (!refreshStatus.autoRefreshEnabled) return

    const interval = setInterval(() => {
      const now = new Date()
      if (now >= refreshStatus.nextRefresh) {
        performDataRefresh()
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [refreshStatus.autoRefreshEnabled, refreshStatus.nextRefresh])

  // Generate random updates periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every 2 minutes
        const newUpdate = generateRandomUpdate()
        setRecentUpdates(prev => [newUpdate, ...prev.slice(0, 19)]) // Keep last 20 updates
      }
    }, 120000) // Every 2 minutes

    return () => clearInterval(interval)
  }, [generateRandomUpdate])

  const performDataRefresh = useCallback(async () => {
    setRefreshStatus(prev => ({ ...prev, isRefreshing: true }))
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate 1-3 new updates during refresh
      const numUpdates = Math.floor(Math.random() * 3) + 1
      const newUpdates = Array.from({ length: numUpdates }, () => generateRandomUpdate())
      
      setRecentUpdates(prev => [...newUpdates, ...prev.slice(0, 17)]) // Keep total at 20
      setRefreshCount(prev => prev + 1)
      
      const now = new Date()
      const nextRefresh = new Date(now.getTime() + refreshStatus.refreshInterval * 60 * 1000)
      
      setRefreshStatus(prev => ({
        ...prev,
        isRefreshing: false,
        lastRefresh: now,
        nextRefresh
      }))
      
      // Trigger custom event for other components to listen to
      window.dispatchEvent(new CustomEvent('dataRefresh', { 
        detail: { 
          timestamp: now, 
          updates: newUpdates,
          refreshCount: refreshCount + 1
        } 
      }))
      
    } catch (error) {
      console.error('Refresh failed:', error)
      setRefreshStatus(prev => ({ ...prev, isRefreshing: false }))
    }
  }, [generateRandomUpdate, refreshStatus.refreshInterval, refreshCount])

  const toggleAutoRefresh = () => {
    setRefreshStatus(prev => ({ ...prev, autoRefreshEnabled: !prev.autoRefreshEnabled }))
  }

  const manualRefresh = () => {
    if (!refreshStatus.isRefreshing) {
      performDataRefresh()
    }
  }

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'ranking': return '📊'
      case 'review': return '⭐'
      case 'gmb': return '📱'
      case 'citation': return '🔗'
      case 'competitor': return '🥊'
      default: return '📈'
    }
  }

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return '📈'
      case 'negative': return '📉'
      default: return '➡️'
    }
  }

  const timeUntilNextRefresh = Math.max(0, Math.floor((refreshStatus.nextRefresh.getTime() - Date.now()) / 1000))
  const minutesUntilRefresh = Math.floor(timeUntilNextRefresh / 60)
  const secondsUntilRefresh = timeUntilNextRefresh % 60

  return (
    <div className="data-refresh-system">
      {/* Refresh Status Header */}
      <div className="refresh-status-header">
        <div className="refresh-info">
          <div className="refresh-indicator">
            <span className={`status-dot ${refreshStatus.isRefreshing ? 'refreshing' : 'ready'}`}></span>
            <span className="status-text">
              {refreshStatus.isRefreshing ? 'Updating data...' : 'Data is current'}
            </span>
          </div>
          <div className="refresh-timing">
            <span className="last-refresh">
              Last updated: {refreshStatus.lastRefresh.toLocaleTimeString()}
            </span>
            {refreshStatus.autoRefreshEnabled && !refreshStatus.isRefreshing && (
              <span className="next-refresh">
                Next update in: {minutesUntilRefresh}m {secondsUntilRefresh}s
              </span>
            )}
          </div>
        </div>
        
        <div className="refresh-controls">
          <button 
            onClick={manualRefresh}
            disabled={refreshStatus.isRefreshing}
            className="manual-refresh-btn"
            title="Refresh data now"
          >
            {refreshStatus.isRefreshing ? '⏳' : '🔄'} 
            {refreshStatus.isRefreshing ? 'Updating...' : 'Refresh Now'}
          </button>
          
          <button 
            onClick={toggleAutoRefresh}
            className={`auto-refresh-toggle ${refreshStatus.autoRefreshEnabled ? 'enabled' : 'disabled'}`}
            title={`${refreshStatus.autoRefreshEnabled ? 'Disable' : 'Enable'} auto-refresh`}
          >
            {refreshStatus.autoRefreshEnabled ? '⏸️' : '▶️'} 
            Auto {refreshStatus.autoRefreshEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Live Updates Feed */}
      {recentUpdates.length > 0 && (
        <div className="live-updates-feed">
          <h4>📡 Live Updates</h4>
          <div className="updates-list">
            {recentUpdates.slice(0, 5).map(update => (
              <div 
                key={update.id} 
                className={`update-item ${update.impact} priority-${update.priority}`}
              >
                <div className="update-header">
                  <span className="update-type-icon">{getUpdateIcon(update.type)}</span>
                  <span className="update-impact-icon">{getImpactIcon(update.impact)}</span>
                  <span className="update-time">
                    {update.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="update-message">{update.message}</div>
              </div>
            ))}
          </div>
          
          {recentUpdates.length > 5 && (
            <div className="updates-summary">
              <span>+ {recentUpdates.length - 5} more updates</span>
              <button className="view-all-btn">View All Updates</button>
            </div>
          )}
        </div>
      )}

      {/* Data Freshness Indicators */}
      <div className="data-freshness">
        <h4>📊 Data Freshness</h4>
        <div className="freshness-indicators">
          <div className="freshness-item">
            <span className="freshness-label">Ranking Data:</span>
            <span className="freshness-status fresh">Fresh (5m ago)</span>
          </div>
          <div className="freshness-item">
            <span className="freshness-label">Review Data:</span>
            <span className="freshness-status fresh">Fresh (12m ago)</span>
          </div>
          <div className="freshness-item">
            <span className="freshness-label">GMB Data:</span>
            <span className="freshness-status fresh">Fresh (8m ago)</span>
          </div>
          <div className="freshness-item">
            <span className="freshness-label">Citation Data:</span>
            <span className="freshness-status stale">Updating (2h ago)</span>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="refresh-stats">
        <div className="stat-item">
          <span className="stat-label">Data Refreshes Today:</span>
          <span className="stat-value">{refreshCount + 47}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Live Updates:</span>
          <span className="stat-value">{recentUpdates.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Avg Response Time:</span>
          <span className="stat-value">1.2s</span>
        </div>
      </div>
    </div>
  )
}

// Custom hook for other components to use refresh data
export function useDataRefresh() {
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [refreshCount, setRefreshCount] = useState(0)

  useEffect(() => {
    const handleRefresh = (event: CustomEvent) => {
      setLastRefresh(event.detail.timestamp)
      setRefreshCount(event.detail.refreshCount)
    }

    window.addEventListener('dataRefresh', handleRefresh as EventListener)
    return () => window.removeEventListener('dataRefresh', handleRefresh as EventListener)
  }, [])

  return { lastRefresh, refreshCount }
}
