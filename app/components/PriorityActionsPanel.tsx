'use client'


import { useState, useEffect } from 'react'
import { fetchPriorityActions, type PriorityAction, apiFetch } from '../services/api'


export default function PriorityActionsPanel() {
  const [expandedAction, setExpandedAction] = useState<string | null>(null)
  const [priorityActions, setPriorityActions] = useState<PriorityAction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Action handlers
  const handleStartAction = async (action: PriorityAction) => {
    try {
      // Mark action as in progress
      const response = await fetch('/api/actions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: action.id,
          status: 'in_progress',
          completionPercentage: 0
        })
      })

      if (response.ok) {
        // Navigate to appropriate page based on action category
        const targetPage = getActionTargetPage(action)
        if (targetPage) {
          window.open(targetPage, '_blank')
        }

        // Refresh actions list
        const data = await fetchPriorityActions()
        setPriorityActions(data)
      }
    } catch (error) {
      console.error('Error starting action:', error)
    }
  }

  const handleScheduleAction = (action: PriorityAction) => {
    // For now, navigate to the relevant page with schedule parameter
    const targetPage = getActionTargetPage(action)
    if (targetPage) {
      window.open(`${targetPage}?schedule=true`, '_blank')
    }
  }

  const handleAutomateAction = async (action: PriorityAction) => {
    try {
      // Enable automation for this action
      const response = await fetch('/api/auto-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionId: action.id,
          automation: true
        })
      })

      if (response.ok) {
        alert(`Automation enabled for: ${action.title}\n\nThis action will now run automatically based on triggers.`)

        // Refresh actions list
        const data = await fetchPriorityActions()
        setPriorityActions(data)
      }
    } catch (error) {
      console.error('Error automating action:', error)
    }
  }

  const getActionTargetPage = (action: PriorityAction): string | null => {
    switch (action.category) {
      case 'GMB': return '/gmb-automation'
      case 'SEO': return '/seo-tracking'
      case 'Reviews': return '/review-management'
      case 'Content': return '/content-calendar'
      case 'Technical': return '/setup'
      default: return '/dev-profile'
    }
  }

  // Load priority actions from API
  useEffect(() => {
    const loadActions = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchPriorityActions()
        setPriorityActions(data)
        setLastUpdated(new Date())
      } catch (err) {
        setError('Failed to load priority actions. Please check your API connection.')
        console.error('Error loading priority actions:', err)
      } finally {
        setLoading(false)
      }
    }

    loadActions()

    // Auto-refresh every 15 minutes
    const interval = setInterval(loadActions, 15 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Listen for global data refresh events
  useEffect(() => {
    const handleDataRefresh = () => {
      const loadActions = async () => {
        try {
          const data = await fetchPriorityActions()
          setPriorityActions(data)
          setLastUpdated(new Date())
        } catch (err) {
          console.error('Error refreshing priority actions:', err)
        }
      }
      loadActions()
    }

    window.addEventListener('dataRefresh', handleDataRefresh)
    return () => window.removeEventListener('dataRefresh', handleDataRefresh)
  }, [])

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return '🚨'
      case 'high': return '🔥'
      default: return '⚡'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#ef4444'
      case 'high': return '#f97316'
      default: return '#f59e0b'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'GMB': return '📱'
      case 'SEO': return '🔍'
      case 'Reviews': return '⭐'
      case 'Content': return '📝'
      case 'Technical': return '🛠️'
      default: return '📊'
    }
  }

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'Low': return '#10b981'
      case 'Medium': return '#f59e0b'
      case 'High': return '#ef4444'
      default: return '#6b7280'
    }
  }

  // Handle loading state
  if (loading) {
    return (
      <div className="priority-actions-panel loading">
        <div className="panel-header">
          <h3>🎯 Priority Action Queue</h3>
          <div className="loading-indicator">
            <span className="spinner">⏳</span>
            <span>Loading real action data...</span>
          </div>
        </div>
        <div className="actions-loading">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="action-item loading-skeleton">
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
              <div className="skeleton-line medium"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div className="priority-actions-panel error">
        <div className="panel-header">
          <h3>🎯 Priority Action Queue</h3>
          <div className="error-indicator">
            <span className="error-icon">⚠️</span>
            <span>Connection Issue</span>
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
            <div className="setup-hint">
              <h4>💡 To enable real priority actions:</h4>
              <ul>
                <li>Connect to project management APIs</li>
                <li>Set up automated task tracking</li>
                <li>Configure SEO monitoring tools</li>
                <li>Link business analytics platforms</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const criticalActions = priorityActions.filter(a => a.priority === 'critical')
  const highActions = priorityActions.filter(a => a.priority === 'high')
  const mediumActions = priorityActions.filter(a => a.priority === 'medium')

  return (
    <div className="priority-actions-panel">
      <div className="panel-header">
        <h3>🎯 Priority Action Queue</h3>
        <div className="header-info">
          <div className="queue-stats">
            <span className="stat-item critical">{criticalActions.length} Critical</span>
            <span className="stat-item high">{highActions.length} High</span>
            <span className="stat-item medium">{mediumActions.length} Medium</span>
          </div>
          <div className="data-status">
            <span className="data-indicator live">🟢</span>
            <span className="data-time">Updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      <div className="actions-list">
        {/* Critical Actions */}
        {criticalActions.length > 0 && (
          <div className="actions-section">
            <h4 className="section-title critical">🚨 Critical - Act Today</h4>
            {criticalActions.map(action => (
              <div
                key={action.id}
                className={`action-item critical ${expandedAction === action.id ? 'expanded' : ''}`}
                style={{ borderLeftColor: getPriorityColor(action.priority) }}
              >
                <div
                  className="action-header"
                  onClick={() => setExpandedAction(expandedAction === action.id ? null : action.id)}
                >
                  <div className="action-title-section">
                    <span className="priority-icon">{getPriorityIcon(action.priority)}</span>
                    <span className="category-icon">{getCategoryIcon(action.category)}</span>
                    <h5>{action.title}</h5>
                  </div>
                  <div className="action-meta">
                    <div className="action-badges">
                      {action.automatable && <span className="auto-badge">🤖 Auto</span>}
                      <span className="timeline-badge">{action.timeline}</span>
                    </div>
                    <span className="expand-icon">{expandedAction === action.id ? '▼' : '▶'}</span>
                  </div>
                </div>

                <p className="action-description">{action.description}</p>

                {action.completionPercentage !== undefined && (
                  <div className="progress-section">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${action.completionPercentage}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{action.completionPercentage}% complete</span>
                  </div>
                )}

                {expandedAction === action.id && (
                  <div className="action-details">
                    <div className="details-grid">
                      <div className="detail-item">
                        <span className="detail-label">Impact:</span>
                        <span className="detail-value">{action.impact}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Effort:</span>
                        <span
                          className="effort-badge"
                          style={{ color: getEffortColor(action.effort) }}
                        >
                          {action.effort}
                        </span>
                      </div>
                    </div>

                    <div className="next-steps">
                      <h6>Next Steps:</h6>
                      <ul>
                        {action.nextSteps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="action-buttons">
                      <button
                        className="action-btn primary"
                        onClick={() => handleStartAction(action)}
                      >
                        Start Now
                      </button>
                      <button
                        className="action-btn secondary"
                        onClick={() => handleScheduleAction(action)}
                      >
                        Schedule
                      </button>
                      {action.automatable && (
                        <button
                          className="action-btn automation"
                          onClick={() => handleAutomateAction(action)}
                        >
                          🤖 Automate
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* High Priority Actions */}
        {highActions.length > 0 && (
          <div className="actions-section">
            <h4 className="section-title high">🔥 High Priority - This Week</h4>
            {highActions.map(action => (
              <div
                key={action.id}
                className={`action-item high ${expandedAction === action.id ? 'expanded' : ''}`}
                style={{ borderLeftColor: getPriorityColor(action.priority) }}
              >
                <div
                  className="action-header"
                  onClick={() => setExpandedAction(expandedAction === action.id ? null : action.id)}
                >
                  <div className="action-title-section">
                    <span className="priority-icon">{getPriorityIcon(action.priority)}</span>
                    <span className="category-icon">{getCategoryIcon(action.category)}</span>
                    <h5>{action.title}</h5>
                  </div>
                  <div className="action-meta">
                    <div className="action-badges">
                      {action.automatable && <span className="auto-badge">🤖 Auto</span>}
                      <span className="timeline-badge">{action.timeline}</span>
                    </div>
                    <span className="expand-icon">{expandedAction === action.id ? '▼' : '▶'}</span>
                  </div>
                </div>

                <p className="action-description">{action.description}</p>

                {action.completionPercentage !== undefined && (
                  <div className="progress-section">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${action.completionPercentage}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{action.completionPercentage}% complete</span>
                  </div>
                )}

                {expandedAction === action.id && (
                  <div className="action-details">
                    <div className="details-grid">
                      <div className="detail-item">
                        <span className="detail-label">Impact:</span>
                        <span className="detail-value">{action.impact}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Effort:</span>
                        <span
                          className="effort-badge"
                          style={{ color: getEffortColor(action.effort) }}
                        >
                          {action.effort}
                        </span>
                      </div>
                    </div>

                    <div className="next-steps">
                      <h6>Next Steps:</h6>
                      <ul>
                        {action.nextSteps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="action-buttons">
                      <button
                        className="action-btn primary"
                        onClick={() => handleStartAction(action)}
                      >
                        Start Now
                      </button>
                      <button
                        className="action-btn secondary"
                        onClick={() => handleScheduleAction(action)}
                      >
                        Schedule
                      </button>
                      {action.automatable && (
                        <button
                          className="action-btn automation"
                          onClick={() => handleAutomateAction(action)}
                        >
                          🤖 Automate
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Medium Priority Actions */}
        {mediumActions.length > 0 && (
          <div className="actions-section">
            <h4 className="section-title medium">⚡ Medium Priority - This Month</h4>
            {mediumActions.map(action => (
              <div
                key={action.id}
                className={`action-item medium ${expandedAction === action.id ? 'expanded' : ''}`}
                style={{ borderLeftColor: getPriorityColor(action.priority) }}
              >
                <div
                  className="action-header"
                  onClick={() => setExpandedAction(expandedAction === action.id ? null : action.id)}
                >
                  <div className="action-title-section">
                    <span className="priority-icon">{getPriorityIcon(action.priority)}</span>
                    <span className="category-icon">{getCategoryIcon(action.category)}</span>
                    <h5>{action.title}</h5>
                  </div>
                  <div className="action-meta">
                    <div className="action-badges">
                      {action.automatable && <span className="auto-badge">🤖 Auto</span>}
                      <span className="timeline-badge">{action.timeline}</span>
                    </div>
                    <span className="expand-icon">{expandedAction === action.id ? '▼' : '▶'}</span>
                  </div>
                </div>

                <p className="action-description">{action.description}</p>

                {action.completionPercentage !== undefined && (
                  <div className="progress-section">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${action.completionPercentage}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{action.completionPercentage}% complete</span>
                  </div>
                )}

                {expandedAction === action.id && (
                  <div className="action-details">
                    <div className="details-grid">
                      <div className="detail-item">
                        <span className="detail-label">Impact:</span>
                        <span className="detail-value">{action.impact}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Effort:</span>
                        <span
                          className="effort-badge"
                          style={{ color: getEffortColor(action.effort) }}
                        >
                          {action.effort}
                        </span>
                      </div>
                    </div>

                    <div className="next-steps">
                      <h6>Next Steps:</h6>
                      <ul>
                        {action.nextSteps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="action-buttons">
                      <button
                        className="action-btn primary"
                        onClick={() => handleStartAction(action)}
                      >
                        Start Now
                      </button>
                      <button
                        className="action-btn secondary"
                        onClick={() => handleScheduleAction(action)}
                      >
                        Schedule
                      </button>
                      {action.automatable && (
                        <button
                          className="action-btn automation"
                          onClick={() => handleAutomateAction(action)}
                        >
                          🤖 Automate
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {priorityActions.length > 0 ? (
        <div className="action-summary">
          <h4>📊 Live Action Summary</h4>
          <div className="summary-stats">
            <div className="summary-stat">
              <span className="stat-number">{priorityActions.filter(a => a.automatable).length}</span>
              <span className="stat-label">Automatable</span>
            </div>
            <div className="summary-stat">
              <span className="stat-number">
                {priorityActions.length > 0
                  ? Math.round(priorityActions.reduce((sum, a) => sum + (a.completionPercentage || 0), 0) / priorityActions.length)
                  : 0}%
              </span>
              <span className="stat-label">Avg Complete</span>
            </div>
            <div className="summary-stat">
              <span className="stat-number">{priorityActions.filter(a => a.effort === 'Low').length}</span>
              <span className="stat-label">Quick Wins</span>
            </div>
            <div className="summary-stat">
              <span className="stat-number">{priorityActions.length}</span>
              <span className="stat-label">Total Actions</span>
            </div>
          </div>
          <div className="data-source-info">
            <p>📊 Actions generated from live business data and API monitoring</p>
          </div>
        </div>
      ) : (
        <div className="no-actions">
          <h4>🎯 No Actions Available</h4>
          <p>Connect your business APIs to generate personalized priority actions.</p>
          <button
            className="setup-actions-btn"
            onClick={() => window.open('/setup?focus=actions', '_blank')}
          >
            ⚙️ Setup Action Tracking
          </button>
        </div>
      )}
    </div>
  )
}
