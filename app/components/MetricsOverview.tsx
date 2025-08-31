'use client'


import { useState, useEffect } from 'react'
import { fetchBusinessMetrics, type Metric } from '../services/api'

export default function MetricsOverview() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [showTooltip, setShowTooltip] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [compLoading, setCompLoading] = useState(false)
  const [topKeywords, setTopKeywords] = useState<{ keyword: string; avgPosition: number; clicks: number; impressions: number; ctr: number }[]>([])

  // Fetch real metrics data
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchBusinessMetrics()
        setMetrics(data)
        setLastUpdated(new Date())
      } catch (err) {
        setError('Failed to load metrics data. Please check your API connection.')
        console.error('Error loading metrics:', err)
      } finally {
        setLoading(false)
      }
    }

    loadMetrics()

    // Auto-refresh every 5 minutes
    const interval = setInterval(loadMetrics, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [selectedPeriod])

  // Listen for global data refresh events
  useEffect(() => {
    const handleDataRefresh = () => {
      const loadMetrics = async () => {
        try {
          const data = await fetchBusinessMetrics()
          setMetrics(data)
          setLastUpdated(new Date())
        } catch (err) {
          console.error('Error refreshing metrics:', err)
        }
      }
      loadMetrics()
    }

    window.addEventListener('dataRefresh', handleDataRefresh)
    return () => window.removeEventListener('dataRefresh', handleDataRefresh)
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#ef4444'
      case 'high': return '#f97316'
      case 'medium': return '#f59e0b'
      default: return '#10b981'
    }
  }

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'positive': return '📈'
      case 'negative': return '📉'
      default: return '➡️'
    }
  }

  if (loading) {
    return (
      <div className="metrics-overview loading">
        <div className="metrics-header">
          <h3>📊 Key Performance Metrics</h3>
          <div className="loading-indicator">
            <span className="spinner">⏳</span>
            <span>Loading real data...</span>
          </div>
        </div>
        <div className="metrics-loading">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="metric-card loading-skeleton">
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
              <div className="skeleton-line"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="metrics-overview error">
        <div className="metrics-header">
          <h3>📊 Key Performance Metrics</h3>
          <div className="error-indicator">
            <span className="error-icon">⚠️</span>
            <span>Data Connection Issue</span>
          </div>
        </div>
        <div className="error-message">
          <p>{error}</p>
          <div className="error-actions">
            <button
              onClick={() => window.location.reload()}
              className="retry-btn"
            >
              🔄 Retry Connection
            </button>
            <p className="setup-hint">
              💡 <strong>Need to connect data sources?</strong>
              <br />Set up Google Search Console, GMB API, and ranking tracking services.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="metrics-overview">
      <div className="metrics-header">
        <h3>📊 Key Performance Metrics</h3>
        <div className="header-controls">
          <div className="period-selector">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="period-select"
            >
              <option value="7d">7 days</option>
              <option value="30d">30 days</option>
              <option value="90d">90 days</option>
            </select>
          </div>
          <div className="data-status">
            <span className="data-indicator live">🟢</span>
            <span className="data-time">Updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}</span>
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        {metrics.map(metric => (
          <div
            key={metric.id}
            className={`metric-card priority-${metric.priority}`}
          >
            <div className="metric-header">
              <span className="metric-icon">{metric.icon}</span>
              <div className="metric-title-section">
                <span className="metric-title">{metric.title}</span>
                <button
                  className="help-button"
                  onClick={() => setShowTooltip(showTooltip === metric.id ? null : metric.id)}
                  title="Click for explanation"
                >
                  💡
                </button>
              </div>
            </div>

            <div className="metric-value">
              {metric.value}
            </div>

            <div className={`metric-change ${metric.changeType}`}>
              <span className="change-icon">{getChangeIcon(metric.changeType)}</span>
              <span className="change-text">{metric.change}</span>
            </div>

            {metric.target && (
              <div className="metric-target">
                {metric.target}
              </div>
            )}

            {showTooltip === metric.id && (
              <div className="metric-tooltip">
                <div className="tooltip-content">
                  <h4>What this means:</h4>
                  <p>{metric.explanation}</p>
                  <h4>Why it matters:</h4>
                  <p>{metric.whyItMatters}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {topKeywords.length > 0 && (
        <div className="top-keywords-panel">
          <h4>🏆 Top Performing Keywords</h4>
          <p className="text-sm text-gray-500">Based on clicks over the last 60 days</p>
          <div className="top-keywords-list">
            {topKeywords.map((k) => (
              <div key={k.keyword} className="top-keyword-row">
                <div className="kw-col">{k.keyword}</div>
                <div className="pos-col">#{Math.round(k.avgPosition || 0)}</div>
                <div className="clicks-col">👆 {k.clicks}</div>
                <div className="impr-col">👁️ {k.impressions}</div>
                <div className="ctr-col">📊 {k.ctr}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Competitor Comparison - only show if we have metric data */}
      {metrics.length > 0 && (
        <div className="competitor-comparison">
          <h4>🥊 Competitive Analysis</h4>
          <div className="comparison-note">
            <p>📊 Real-time competitive data from connected APIs</p>
            <div className="comparison-actions">
              <button
                className="comp-refresh-btn"
                disabled={compLoading}
                onClick={async () => {
                  try {
                    setCompLoading(true)
                    await apiFetch('/competitor-tracking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'refresh' }) })
                    const data = await apiFetch<any>('/competitor-tracking')
                    if (data?.error) throw new Error(data.error)
                    window.location.href = '/competitor-analysis'
                  } catch (e: any) {
                    alert('Failed to update competitors: ' + (e?.message || 'Unknown error'))
                  } finally {
                    setCompLoading(false)
                  }
                }}
              >
                {compLoading ? '⏳ Updating…' : '🔄 Update Competitors'}
              </button>
              <button
                className="comp-setup-btn"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    if (!location.hash || location.hash !== '#competitor-profile') {
                      location.hash = '#competitor-profile'
                    }
                    // small nudge to ensure scroll
                    setTimeout(() => {
                      const el = document.getElementById('competitor-profile')
                      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }, 50)
                  }
                }}
              >
                ⚙️ Configure Tracking
              </button>
            </div>
            <p className="mini-help">Configure: set your service areas and keywords. Update: runs discovery and analysis, then opens the Competitive Analysis page.</p>
          </div>
        </div>
      )}

      {/* Dynamic Trend Summary */}
      {metrics.length > 0 && (
        <div className="trend-summary">
          <h4>📈 Live Trend Analysis</h4>
          <div className="trend-items">
            {metrics.filter(m => m.changeType === 'positive').length > 0 && (
              <div className="trend-item positive">
                <span>📈 {metrics.filter(m => m.changeType === 'positive').length} metrics improving</span>
              </div>
            )}
            {metrics.filter(m => m.changeType === 'negative').length > 0 && (
              <div className="trend-item negative">
                <span>📉 {metrics.filter(m => m.changeType === 'negative').length} metrics need attention</span>
              </div>
            )}
            {metrics.filter(m => m.priority === 'critical').length > 0 && (
              <div className="trend-item critical">
                <span>🚨 {metrics.filter(m => m.priority === 'critical').length} critical issues require immediate action</span>
              </div>
            )}
            <div className="trend-item neutral">
              <span>🔄 Data refreshed from live APIs every 5 minutes</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
