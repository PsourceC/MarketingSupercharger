'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import GoogleAuthButton from '../components/GoogleAuthButton'
import DataSourceIndicator from '../components/DataSourceIndicator'
import TempDataButton from '../components/TempDataButton'
import ManualDataImport from '../components/ManualDataImport'
import '../dev-profile-enhanced.css'

interface ConnectionStatus {
  id: string
  name: string
  description: string
  status: 'connected' | 'disconnected' | 'error' | 'pending'
  category: 'core' | 'optimization' | 'analytics' | 'notifications'
  priority: 'critical' | 'high' | 'medium' | 'low'
  lastChecked?: string
  errorMessage?: string
  setupUrl?: string
  docsUrl?: string
  workaroundActive?: boolean
  workaroundText?: string
}

export default function DevProfilePage() {
  const [mounted, setMounted] = useState(false)
  const [connections, setConnections] = useState<ConnectionStatus[]>([])
  const [isChecking, setIsChecking] = useState(false)
  const [lastHealthCheck, setLastHealthCheck] = useState<string>('')
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)
  const isDevelopment = process.env.NODE_ENV === 'development'

  useEffect(() => {
    setMounted(true)
    checkAllConnections()

    // Set up automatic health checks - longer interval in development to avoid HMR conflicts
    const healthCheckInterval = setInterval(() => {
      if (autoRefreshEnabled && !isChecking && document.visibilityState === 'visible') {
        console.log('Running automatic health check...')
        checkAllConnections(true) // Pass true for silent/background check
      }
    }, isDevelopment ? 10 * 60 * 1000 : 5 * 60 * 1000) // 10 minutes in dev, 5 minutes in production

    return () => {
      clearInterval(healthCheckInterval)
    }
  }, [autoRefreshEnabled, isChecking])

  const checkAllConnections = async (silent = false) => {
    // Skip checks if webpack is hot reloading (in development)
    if (isDevelopment && (window as any).__webpack_require__?.hmrM) {
      console.log('Skipping health check - webpack HMR in progress')
      return
    }

    if (!silent) setIsChecking(true)
    
    const connectionChecks: ConnectionStatus[] = [
      // Core Infrastructure
      {
        id: 'database',
        name: 'Database (Neon)',
        description: 'PostgreSQL database for storing rankings, metrics, and business data. Click "Connect to Neon" in MCP Settings to get started.',
        status: 'disconnected',
        category: 'core',
        priority: 'critical',
        setupUrl: '#open-mcp-popover',
        docsUrl: 'https://neon.tech/docs'
      },
      {
        id: 'google-oauth',
        name: 'Google Search Console',
        description: 'OAuth connection for real search ranking and performance data. Scroll down to the Google Auth section to connect.',
        status: 'disconnected',
        category: 'core',
        priority: 'critical',
        setupUrl: '/#google-auth',
        docsUrl: 'https://developers.google.com/webmaster-tools'
      },
      
      // Optimization APIs
      {
        id: 'google-my-business',
        name: 'Google My Business',
        description: 'Track reviews, ratings, and local business performance',
        status: 'disconnected',
        category: 'optimization',
        priority: 'high',
        setupUrl: '/setup?service=google-my-business',
        docsUrl: 'https://developers.google.com/my-business'
      },
      {
        id: 'citation-tracking',
        name: 'Citation Monitoring',
        description: 'Track business listings across directories (Moz Local, BrightLocal)',
        status: 'disconnected',
        category: 'optimization',
        priority: 'high',
        setupUrl: '/setup?service=citation-tracking',
        docsUrl: '/setup?service=citation-tracking'
      },
      {
        id: 'competitor-api',
        name: 'Competitor Tracking',
        description: 'Monitor competitor rankings and performance (SEMrush, Ahrefs)',
        status: 'disconnected',
        category: 'optimization',
        priority: 'medium',
        setupUrl: '/setup?service=competitor-tracking',
        docsUrl: '/setup?service=competitor-tracking'
      },

      // Analytics & Monitoring
      {
        id: 'google-analytics',
        name: 'Google Analytics',
        description: 'Website traffic and conversion tracking',
        status: 'disconnected',
        category: 'analytics',
        priority: 'high',
        setupUrl: '/setup?service=google-analytics',
        docsUrl: 'https://developers.google.com/analytics'
      },

      // Notifications & Alerts
      {
        id: 'email-notifications',
        name: 'Email Notifications',
        description: 'Send alerts for ranking changes and performance updates',
        status: 'disconnected',
        category: 'notifications',
        priority: 'medium',
        setupUrl: '/setup?service=email-notifications',
        docsUrl: '/setup?service=email-notifications'
      },
      {
        id: 'slack-integration',
        name: 'Slack Integration',
        description: 'Daily performance reports and alerts in Slack',
        status: 'disconnected',
        category: 'notifications',
        priority: 'low',
        setupUrl: '/setup?service=slack-integration',
        docsUrl: '/setup?service=slack-integration'
      }
    ]

    const fetchWithTimeout = async (input: RequestInfo | URL, init: RequestInit = {}, timeoutMs = 8000) => {
      const controller = new AbortController()
      const id = setTimeout(() => controller.abort(), timeoutMs)
      try {
        return await fetch(input, { ...init, signal: controller.signal })
      } finally {
        clearTimeout(id)
      }
    }

    // Load unified service statuses for consistent mapping
    let unifiedStatuses: Record<string, { status: 'working' | 'partial' | 'not-setup'; message: string }> = {}
    try {
      const svcRes = await fetchWithTimeout('/api/service-status', { cache: 'no-cache', headers: { 'Cache-Control': 'no-cache' } }, 8000)
      if (svcRes.ok) {
        const svcData = await svcRes.json()
        unifiedStatuses = svcData.services || {}
      }
    } catch (e) {
      console.warn('Failed to load unified service statuses:', e)
    }

    const mapServiceToConnection = (svcId: string): { mapped: 'connected' | 'pending' | 'disconnected'; note?: string } => {
      const svc = unifiedStatuses[svcId]
      if (!svc) return { mapped: 'disconnected' }
      if (svc.status === 'working') return { mapped: 'connected' }
      if (svc.status === 'partial') return { mapped: 'pending', note: svc.message }
      return { mapped: 'disconnected' }
    }

    // Check each connection status with retry logic
    try {
    for (const connection of connectionChecks) {
      let retryCount = 0
      const maxRetries = 2

      while (retryCount <= maxRetries) {
        try {
          switch (connection.id) {
            case 'google-oauth': {
              try {
                const authResponse = await fetchWithTimeout('/api/auth/status', {
                  method: 'GET',
                  cache: 'no-cache',
                  headers: { 'Cache-Control': 'no-cache' }
                }, 5000)

                if (!authResponse.ok) {
                  throw new Error(`HTTP ${authResponse.status}: ${authResponse.statusText}`)
                }

                const authData = await authResponse.json()
                connection.status = authData.connected ? 'connected' : 'disconnected'
                connection.errorMessage = undefined

                if (!authData.connected) {
                  const ai = mapServiceToConnection('ai-ranking-tracker')
                  if (ai.mapped === 'connected') {
                    connection.status = 'pending'
                    connection.errorMessage = undefined
                    connection.description = 'OAuth optional right now. Alternative live data is active via AI Ranking Tracker.'
                    connection.workaroundActive = true
                    connection.workaroundText = 'AI Ranking Tracker live'
                  }
                }
                connection.lastChecked = new Date().toISOString()
              } catch (fetchError) {
                throw fetchError
              }
            }
              break

            case 'database': {
              const mapped = mapServiceToConnection('database')
              connection.status = mapped.mapped
              connection.errorMessage = mapped.note
              connection.lastChecked = new Date().toISOString()
            }
              break

            case 'google-my-business': {
              const mapped = mapServiceToConnection('google-my-business')
              connection.status = mapped.mapped
              connection.errorMessage = mapped.note
              connection.lastChecked = new Date().toISOString()
            }
              break

            case 'google-analytics': {
              const mapped = mapServiceToConnection('google-analytics')
              connection.status = mapped.mapped
              connection.errorMessage = mapped.note
              connection.lastChecked = new Date().toISOString()
            }
              break

            case 'citation-tracking': {
              const mapped = mapServiceToConnection('citation-monitoring')
              connection.status = mapped.mapped
              connection.errorMessage = mapped.note
              connection.lastChecked = new Date().toISOString()
            }
              break

            case 'competitor-api': {
              const mapped = mapServiceToConnection('competitor-tracking')
              connection.status = mapped.mapped
              connection.errorMessage = mapped.note
              connection.lastChecked = new Date().toISOString()
            }
              break

            default:
              connection.status = 'disconnected'
              connection.lastChecked = new Date().toISOString()
          }
          break // Success, exit retry loop

        } catch (error) {
          retryCount++
          let errorMessage = 'Unknown error'
          let shouldRetry = true

          // Handle different types of errors
          if (error.name === 'AbortError') {
            errorMessage = 'Connection timeout'
          } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            errorMessage = 'Network connection failed (likely HMR reload)'
            // Don't retry on HMR-related fetch failures
            if (retryCount === 1) shouldRetry = false
          } else if (error.message) {
            errorMessage = error.message
          }

          if (retryCount > maxRetries || !shouldRetry) {
            connection.status = 'error'
            connection.errorMessage = shouldRetry ?
              `Check failed after ${maxRetries} retries: ${errorMessage}` :
              `Connection check skipped: ${errorMessage}`
            connection.lastChecked = new Date().toISOString()
          } else {
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
          }
        }
      }
    }
    } catch (loopError) {
      console.warn('Connection check loop error:', loopError)
    }

    setConnections(connectionChecks)
    setLastHealthCheck(new Date().toISOString())
    if (!silent) setIsChecking(false)
  }

  const getOverallStatus = () => {
    if (connections.length === 0) return 'pending'
    
    const criticalConnected = connections
      .filter(c => c.priority === 'critical')
      .every(c => c.status === 'connected')
    
    const hasErrors = connections.some(c => c.status === 'error')
    const connectedCount = connections.filter(c => c.status === 'connected').length
    const totalCount = connections.length
    
    if (hasErrors) return 'error'
    if (criticalConnected && connectedCount >= totalCount * 0.8) return 'connected'
    if (connectedCount >= totalCount * 0.5) return 'partial'
    return 'disconnected'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return '✅'
      case 'error': return '❌'
      case 'pending': return '⏳'
      default: return '⚪'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Connected'
      case 'error': return 'Error'
      case 'pending': return 'Pending'
      case 'disconnected': return 'Not Connected'
      default: return 'Unknown'
    }
  }

  const getSetupActionText = (connection: ConnectionStatus) => {
    if (connection.status === 'connected') return 'Manage'
    if (connection.status === 'error') return 'Fix Connection'
    if (connection.priority === 'critical') return 'Setup Now (Critical)'
    if (connection.priority === 'high') return 'Setup (High Priority)'
    return 'Setup'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return '#10b981'
      case 'partial': return '#f59e0b'
      case 'error': return '#ef4444'
      case 'pending': return '#6b7280'
      default: return '#9ca3af'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'core': return '🏗️'
      case 'optimization': return '🚀'
      case 'analytics': return '📊'
      case 'notifications': return '🔔'
      default: return '⚙️'
    }
  }

  const overallStatus = getOverallStatus()
  const connectedCount = connections.filter(c => c.status === 'connected').length
  const totalCount = connections.length

  if (!mounted) {
    return (
      <div className="dev-profile-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading connection status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dev-profile-page">
      {/* Header */}
      <div className="profile-header">
        <div className="header-left">
          <Link href="/" className="back-button">
            ← Back to Dashboard
          </Link>
          <div className="header-info">
            <h1>🔧 Development Profile</h1>
            <p>Manage all connections needed to optimize your solar business</p>
          </div>
        </div>
        <div className="header-actions">
          <div className="health-check-info">
            {lastHealthCheck && (
              <span className="last-health-check">
                Last check: {new Date(lastHealthCheck).toLocaleTimeString()}
              </span>
            )}
            <label className="auto-refresh-toggle">
              <input
                type="checkbox"
                checked={autoRefreshEnabled}
                onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
              />
              Auto-refresh (5min)
            </label>
          </div>
          <button
            onClick={() => checkAllConnections()}
            disabled={isChecking}
            className="refresh-btn"
          >
            {isChecking ? '⏳' : '🔄'} {isChecking ? 'Checking...' : 'Refresh All'}
          </button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="status-overview-card">
        <div className="overall-status">
          <div className="status-circle" style={{ backgroundColor: getStatusColor(overallStatus) }}>
            {getStatusIcon(overallStatus)}
          </div>
          <div className="status-info">
            <h2>Overall Status: {overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)}</h2>
            <p>{connectedCount} of {totalCount} connections active</p>

            {/* Action Guidance */}
            {overallStatus === 'disconnected' && (
              <div className="status-guidance urgent">
                🚨 <strong>Action Required:</strong> Connect critical services to get started
              </div>
            )}
            {overallStatus === 'partial' && (
              <div className="status-guidance warning">
                ⚠️ <strong>Setup In Progress:</strong> Connect remaining services for full functionality
              </div>
            )}
            {overallStatus === 'connected' && (
              <div className="status-guidance success">
                ✅ <strong>All Set:</strong> All connections are working properly
              </div>
            )}
            {overallStatus === 'error' && (
              <div className="status-guidance error">
                ❌ <strong>Issues Detected:</strong> Fix connection errors below
              </div>
            )}
          </div>
        </div>
        <div className="status-stats">
          <div className="stat">
            <span className="stat-number">{connectedCount}</span>
            <span className="stat-label">Connected</span>
          </div>
          <div className="stat">
            <span className="stat-number">{connections.filter(c => c.status === 'error').length}</span>
            <span className="stat-label">Errors</span>
          </div>
          <div className="stat">
            <span className="stat-number">{connections.filter(c => c.priority === 'critical').length}</span>
            <span className="stat-label">Critical</span>
          </div>
          <div className="stat">
            <span className="stat-number">{connections.filter(c => c.status === 'disconnected' && c.priority === 'critical').length}</span>
            <span className="stat-label">Need Setup</span>
          </div>
        </div>
      </div>

      {/* Quick Actions for Critical Setup */}
      {overallStatus !== 'connected' && (
        <div className="quick-actions-section">
          <h3>���� Quick Setup Actions</h3>
          <div className="quick-actions-grid">
            {connections.filter(c => c.priority === 'critical' && c.status !== 'connected').length > 0 && (
              <div className="quick-action-card critical">
                <div className="action-icon">🚨</div>
                <div className="action-content">
                  <h4>Connect Critical Services</h4>
                  <p>Connect your database and Google services to unlock full optimization features</p>
                  <div className="action-buttons">
                    {connections.find(c => c.id === 'database' && c.status !== 'connected') && (
                      <button
                        className="action-btn database"
                        onClick={() => alert('To connect Database:\n\n1. Click "Connect" in top menu\n2. Find "Neon" in MCP list\n3. Connect your Neon database\n4. Configure connection settings')}
                      >
                        Connect Database
                      </button>
                    )}
                    {connections.find(c => c.id === 'google-oauth' && c.status !== 'connected') && (
                      <button
                        className="action-btn google-search-console"
                        onClick={() => {
                          const googleSection = document.querySelector('#google-auth')
                          if (googleSection) {
                            window.location.href = '/#google-auth'
                          } else {
                            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
                          }
                        }}
                      >
                        Connect Search Console
                      </button>
                    )}
                    {connections.find(c => c.id === 'google-my-business' && c.status !== 'connected') && (
                      <button
                        className="action-btn google-my-business"
                        onClick={() => {
                          // Navigate to GMB setup page
                          window.location.href = '/setup?service=google-my-business'
                        }}
                      >
                        Connect GMB
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="quick-action-card">
              <div className="action-icon">📊</div>
              <div className="action-content">
                <h4>Load Sample Data</h4>
                <p>Explore the dashboard with sample data while setting up connections</p>
                <TempDataButton />
              </div>
            </div>

            <div className="quick-action-card">
              <div className="action-icon">📁</div>
              <div className="action-content">
                <h4>Import Data</h4>
                <p>Upload CSV files from Google Search Console for instant analysis</p>
                <ManualDataImport />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Import & Connection Section */}
      <div className="data-import-section">
        <h3>📊 Data Sources & Import</h3>
        <div className="import-grid">
          <div className="import-card">
            <h4>🔗 Google Search Console Connection</h4>
            <p>Connect to Google Search Console to get real ranking and performance data</p>
            <GoogleAuthButton />
          </div>

          <div className="import-card">
            <h4>📈 Data Source Status</h4>
            <p>See whether you're viewing live data or sample data</p>
            <DataSourceIndicator />
          </div>

          <div className="import-card">
            <h4>🔄 Load Sample Data (While Setting Up Google)</h4>
            <p>Use sample data to explore the dashboard while setting up your Google connection</p>
            <TempDataButton />
          </div>

          <div className="import-card">
            <h4>📁 Import Search Console Data Manually</h4>
            <p>Upload CSV files from Google Search Console for instant data analysis</p>
            <ManualDataImport />
          </div>
        </div>
      </div>

      {/* Connections Grid */}
      <div className="connections-section">
        {['core', 'optimization', 'analytics', 'notifications'].map(category => {
          const categoryConnections = connections.filter(c => c.category === category)
          if (categoryConnections.length === 0) return null

          return (
            <div key={category} className="connection-category-card">
              <h3 className="category-header">
                {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
                <span className="category-count">
                  {categoryConnections.filter(c => c.status === 'connected').length}/{categoryConnections.length}
                </span>
              </h3>
              
              <div className="connection-grid">
                {categoryConnections.map(connection => (
                  <div key={connection.id} className={`connection-card ${connection.status} priority-${connection.priority}`} data-connection-id={connection.id}>
                    <div className="connection-header">
                      <div className="connection-title">
                        <span
                          className="status-indicator"
                          title={`Status: ${getStatusText(connection.status)}`}
                        >
                          {getStatusIcon(connection.status)}
                        </span>
                        <h4>{connection.name}</h4>
                        <span className={`priority-badge priority-${connection.priority}`}>
                          {connection.priority}
                        </span>
                        {connection.workaroundActive && (
                          <span className="priority-badge">WORKAROUND ACTIVE</span>
                        )}
                      </div>
                      <div className="status-text">
                        <span className={`status-label status-${connection.status}`}>
                          {getStatusText(connection.status)}
                        </span>
                      </div>
                    </div>

                    <p className="connection-description">{connection.description}</p>

                    {connection.status === 'connected' && (
                      <div className="success-message">
                        ✅ Connection is active and working properly
                      </div>
                    )}

                    {connection.errorMessage && (
                      <div className="error-message">
                        {connection.errorMessage}
                      </div>
                    )}

                    <div className="connection-footer">
                      <div className="connection-actions">
                        <button
                          className={`setup-btn ${connection.priority === 'critical' ? 'critical' : ''}`}
                          onClick={() => {
                            if (connection.setupUrl === '#open-mcp-popover') {
                              // For MCP connections, show specific instructions
                              alert(`To setup ${connection.name}:\n\n1. Click the "Connect" button in the top menu\n2. Find and connect to the relevant MCP service\n3. Follow the setup instructions\n\nFor database: Connect to Neon\nFor other services: Look for the specific service in the MCP list`)
                            } else if (connection.setupUrl.startsWith('#')) {
                              // Navigate back to dashboard and scroll to element
                              window.location.href = `/${connection.setupUrl}`
                            } else if (connection.setupUrl.startsWith('/setup')) {
                              // Navigate to setup page
                              window.location.href = connection.setupUrl
                            } else {
                              window.open(connection.setupUrl, '_blank')
                            }
                          }}
                        >
                          {getSetupActionText(connection)}
                        </button>
                        <button
                          className="docs-btn"
                          onClick={() => window.open(connection.docsUrl, '_blank')}
                          title="View Documentation"
                        >
                          📚
                        </button>
                      </div>

                      {connection.lastChecked && (
                        <div className="last-checked">
                          Last checked: {new Date(connection.lastChecked).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Tips */}
      <div className="tips-section">
        <h3>💡 Quick Setup Tips</h3>
        <div className="tips-grid">
          <div className="tip">
            <span className="tip-icon">🚨</span>
            <div className="tip-content">
              <h4>Start with Critical</h4>
              <p>Connect Database and Google Search Console first for immediate optimization benefits</p>
            </div>
          </div>
          <div className="tip">
            <span className="tip-icon">🚀</span>
            <div className="tip-content">
              <h4>Automation Ready</h4>
              <p>Once connected, most tools will automatically update your business data</p>
            </div>
          </div>
          <div className="tip">
            <span className="tip-icon">📊</span>
            <div className="tip-content">
              <h4>Live Monitoring</h4>
              <p>All connections are monitored in real-time for issues and performance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
