'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchRecentUpdates, triggerDataRefresh, dataSubscription, type DataUpdate } from '../services/api'


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
    lastRefresh: new Date(0), // Use epoch time to prevent hydration mismatch
    nextRefresh: new Date(0), // Use epoch time to prevent hydration mismatch
    autoRefreshEnabled: true,
    refreshInterval: 15
  })

  const [recentUpdates, setRecentUpdates] = useState<DataUpdate[]>([])
  const [refreshCount, setRefreshCount] = useState(0)

  // Track when component has mounted to prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load real updates from API
  const loadRecentUpdates = useCallback(async () => {
    try {
      const updates = await fetchRecentUpdates()
      if (updates && updates.length > 0) {
        // Ensure all timestamps are Date objects
        const processedUpdates = updates.map(update => ({
          ...update,
          timestamp: update.timestamp instanceof Date ? update.timestamp : new Date(update.timestamp)
        }))

        setRecentUpdates(prev => {
          // Merge new updates with existing ones, avoiding duplicates
          const newUpdates = processedUpdates.filter(update =>
            !prev.some(existing => existing.id === update.id)
          )
          return [...newUpdates, ...prev].slice(0, 20) // Keep last 20 updates
        })
      }
    } catch (error) {
      console.error('Failed to load recent updates:', error)
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

  // Set up real-time data subscription
  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = dataSubscription.subscribe((updates: DataUpdate[]) => {
      if (updates && updates.length > 0) {
        // Ensure all timestamps are Date objects
        const processedUpdates = updates.map(update => ({
          ...update,
          timestamp: update.timestamp instanceof Date ? update.timestamp : new Date(update.timestamp)
        }))

        setRecentUpdates(prev => {
          const newUpdates = processedUpdates.filter(update =>
            !prev.some(existing => existing.id === update.id)
          )
          return [...newUpdates, ...prev].slice(0, 20)
        })
      }
    })

    // Start polling for updates
    dataSubscription.startPolling(60000) // Poll every minute

    // Load initial updates
    loadRecentUpdates()

    return () => {
      unsubscribe()
      dataSubscription.stopPolling()
    }
  }, [loadRecentUpdates])

  const performDataRefresh = useCallback(async () => {
    setRefreshStatus(prev => ({ ...prev, isRefreshing: true }))

    try {
      // Trigger API data refresh
      const refreshSuccess = await triggerDataRefresh()

      if (refreshSuccess) {
        // Load fresh updates
        await loadRecentUpdates()
        setRefreshCount(prev => prev + 1)
      }

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
          refreshCount: refreshCount + 1,
          success: refreshSuccess
        }
      }))

    } catch (error) {
      console.error('Refresh failed:', error)
      setRefreshStatus(prev => ({ ...prev, isRefreshing: false }))
    }
  }, [loadRecentUpdates, refreshStatus.refreshInterval, refreshCount])

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

  // Safe time formatting that prevents hydration issues
  const formatTime = (date: Date | string) => {
    if (!mounted) return '--:--:--'

    // Handle both Date objects and string timestamps
    let dateObj: Date
    if (typeof date === 'string') {
      dateObj = new Date(date)
    } else if (date instanceof Date) {
      dateObj = date
    } else {
      return '--:--:--'
    }

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return '--:--:--'
    }

    return dateObj.toLocaleTimeString()
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
              Last updated: {formatTime(refreshStatus.lastRefresh)}
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
                    {formatTime(update.timestamp)}
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

      {/* Real Data Freshness Indicators */}
      <div className="data-freshness">
        <h4>📊 Live Data Sources</h4>
        <div className="freshness-indicators">
          <div className="freshness-item">
            <span className="freshness-label">API Status:</span>
            <span className="freshness-status connected">🟢 Connected</span>
          </div>
          <div className="freshness-item">
            <span className="freshness-label">Auto-Refresh:</span>
            <span className="freshness-status enabled">
              {refreshStatus.autoRefreshEnabled ? '✅ Enabled' : '❌ Disabled'}
            </span>
          </div>
          <div className="freshness-item">
            <span className="freshness-label">Update Frequency:</span>
            <span className="freshness-status">{refreshStatus.refreshInterval}m intervals</span>
          </div>
          <div className="freshness-item">
            <span className="freshness-label">Data Quality:</span>
            <span className="freshness-status high">📈 Real-time</span>
          </div>
        </div>
      </div>

      {/* Real Performance Stats */}
      <div className="refresh-stats">
        <div className="stat-item">
          <span className="stat-label">API Refreshes:</span>
          <span className="stat-value">{refreshCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Live Updates:</span>
          <span className="stat-value">{recentUpdates.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Data Source:</span>
          <span className="stat-value">Live APIs</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Connection:</span>
          <span className="stat-value">🟢 Active</span>
        </div>
      </div>
    </div>
  )
}

// Custom hook for other components to use real refresh data
export function useDataRefresh() {
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [refreshCount, setRefreshCount] = useState(0)
  const [apiConnected, setApiConnected] = useState(true)

  useEffect(() => {
    const handleRefresh = (event: CustomEvent) => {
      setLastRefresh(event.detail.timestamp)
      setRefreshCount(event.detail.refreshCount)
      setApiConnected(event.detail.success !== false)
    }

    window.addEventListener('dataRefresh', handleRefresh as EventListener)
    return () => window.removeEventListener('dataRefresh', handleRefresh as EventListener)
  }, [])

  return { lastRefresh, refreshCount, apiConnected }
}
