'use client'

import { useState, useEffect } from 'react'

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
}

export default function DevProfile() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [connections, setConnections] = useState<ConnectionStatus[]>([])
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    setMounted(true)
    checkAllConnections()
  }, [])

  const checkAllConnections = async () => {
    setIsChecking(true)
    
    const connectionChecks: ConnectionStatus[] = [
      // Core Infrastructure
      {
        id: 'database',
        name: 'Database (Neon)',
        description: 'PostgreSQL database for storing rankings, metrics, and business data',
        status: 'disconnected',
        category: 'core',
        priority: 'critical',
        setupUrl: '/connect/neon',
        docsUrl: 'https://neon.tech/docs'
      },
      {
        id: 'google-oauth',
        name: 'Google Search Console',
        description: 'OAuth connection for real search ranking and performance data',
        status: 'disconnected',
        category: 'core',
        priority: 'critical',
        setupUrl: '#google-auth',
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
        setupUrl: '/connect/gmb',
        docsUrl: 'https://developers.google.com/my-business'
      },
      {
        id: 'citation-tracking',
        name: 'Citation Monitoring',
        description: 'Track business listings across directories (Moz Local, BrightLocal)',
        status: 'disconnected',
        category: 'optimization',
        priority: 'high',
        setupUrl: '/connect/citations',
        docsUrl: '/docs/citations'
      },
      {
        id: 'competitor-api',
        name: 'Competitor Tracking',
        description: 'Monitor competitor rankings and performance (SEMrush, Ahrefs)',
        status: 'disconnected',
        category: 'optimization',
        priority: 'medium',
        setupUrl: '/connect/competitors',
        docsUrl: '/docs/competitors'
      },
      
      // Analytics & Monitoring
      {
        id: 'google-analytics',
        name: 'Google Analytics',
        description: 'Website traffic and conversion tracking',
        status: 'disconnected',
        category: 'analytics',
        priority: 'high',
        setupUrl: '/connect/analytics',
        docsUrl: 'https://developers.google.com/analytics'
      },
      {
        id: 'search-console-api',
        name: 'Search Console API',
        description: 'Advanced search performance data and indexing status',
        status: 'disconnected',
        category: 'analytics',
        priority: 'medium',
        setupUrl: '/connect/search-console-api',
        docsUrl: 'https://developers.google.com/webmaster-tools/search-console-api'
      },
      
      // Notifications & Alerts
      {
        id: 'email-notifications',
        name: 'Email Notifications',
        description: 'Send alerts for ranking changes and performance updates',
        status: 'disconnected',
        category: 'notifications',
        priority: 'medium',
        setupUrl: '/connect/email',
        docsUrl: '/docs/notifications'
      },
      {
        id: 'slack-integration',
        name: 'Slack Integration',
        description: 'Daily performance reports and alerts in Slack',
        status: 'disconnected',
        category: 'notifications',
        priority: 'low',
        setupUrl: '/connect/slack',
        docsUrl: '/docs/slack'
      }
    ]

    // Check each connection status
    for (const connection of connectionChecks) {
      try {
        switch (connection.id) {
          case 'google-oauth':
            const authResponse = await fetch('/api/auth/status')
            const authData = await authResponse.json()
            connection.status = authData.connected ? 'connected' : 'disconnected'
            connection.lastChecked = new Date().toISOString()
            break
            
          case 'database':
            try {
              const dbResponse = await fetch('/api/metrics')
              connection.status = dbResponse.ok ? 'connected' : 'error'
              connection.lastChecked = new Date().toISOString()
            } catch {
              connection.status = 'error'
              connection.errorMessage = 'Database connection timeout'
            }
            break
            
          default:
            // For now, mark others as disconnected - you can implement checks later
            connection.status = 'disconnected'
            connection.lastChecked = new Date().toISOString()
        }
      } catch (error) {
        connection.status = 'error'
        connection.errorMessage = `Check failed: ${error.message}`
      }
    }

    setConnections(connectionChecks)
    setIsChecking(false)
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
      <div className="dev-profile">
        <div className="dev-profile-icon" style={{ backgroundColor: '#6b7280' }}>
          <span className="dev-icon">⚙️</span>
        </div>
      </div>
    )
  }

  return (
    <div className="dev-profile">
      <div 
        className="dev-profile-icon"
        onClick={() => setIsOpen(true)}
        style={{ backgroundColor: getStatusColor(overallStatus) }}
        title={`Connections: ${connectedCount}/${totalCount} - Click to manage`}
      >
        <span className="dev-icon">⚙️</span>
        <div className="connection-count">{connectedCount}/{totalCount}</div>
        <div className="status-ring" style={{ borderColor: getStatusColor(overallStatus) }}></div>
      </div>

      {isOpen && (
        <div className="dev-profile-modal" onClick={() => setIsOpen(false)}>
          <div className="dev-profile-panel" onClick={e => e.stopPropagation()}>
            <div className="panel-header">
              <div className="header-content">
                <h2>🔧 Development Profile</h2>
                <p>Manage all connections needed to optimize your solar business</p>
              </div>
              <div className="header-actions">
                <button 
                  onClick={checkAllConnections}
                  disabled={isChecking}
                  className="refresh-btn"
                >
                  {isChecking ? '⏳' : '����'} {isChecking ? 'Checking...' : 'Refresh All'}
                </button>
                <button onClick={() => setIsOpen(false)} className="close-btn">✕</button>
              </div>
            </div>

            <div className="status-overview">
              <div className="overall-status">
                <div className="status-circle" style={{ backgroundColor: getStatusColor(overallStatus) }}>
                  {getStatusIcon(overallStatus)}
                </div>
                <div className="status-info">
                  <h3>Overall Status: {overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)}</h3>
                  <p>{connectedCount} of {totalCount} connections active</p>
                </div>
              </div>
            </div>

            <div className="connections-grid">
              {['core', 'optimization', 'analytics', 'notifications'].map(category => {
                const categoryConnections = connections.filter(c => c.category === category)
                if (categoryConnections.length === 0) return null

                return (
                  <div key={category} className="connection-category">
                    <h4 className="category-header">
                      {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
                    </h4>
                    <div className="connection-list">
                      {categoryConnections.map(connection => (
                        <div key={connection.id} className={`connection-item ${connection.status} priority-${connection.priority}`}>
                          <div className="connection-header">
                            <div className="connection-status">
                              <span className="status-indicator">{getStatusIcon(connection.status)}</span>
                              <div className="connection-info">
                                <h5>{connection.name}</h5>
                                <p>{connection.description}</p>
                              </div>
                            </div>
                            <div className="connection-actions">
                              {connection.status !== 'connected' && (
                                <button 
                                  className="setup-btn"
                                  onClick={() => {
                                    if (connection.setupUrl.startsWith('#')) {
                                      // Scroll to element
                                      const element = document.querySelector(connection.setupUrl)
                                      element?.scrollIntoView({ behavior: 'smooth' })
                                      setIsOpen(false)
                                    } else {
                                      window.open(connection.setupUrl, '_blank')
                                    }
                                  }}
                                >
                                  Setup
                                </button>
                              )}
                              <button 
                                className="docs-btn"
                                onClick={() => window.open(connection.docsUrl, '_blank')}
                              >
                                📚
                              </button>
                            </div>
                          </div>
                          {connection.errorMessage && (
                            <div className="error-message">
                              ⚠️ {connection.errorMessage}
                            </div>
                          )}
                          {connection.lastChecked && (
                            <div className="last-checked">
                              Last checked: {new Date(connection.lastChecked).toLocaleTimeString()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="panel-footer">
              <div className="footer-info">
                <p>💡 <strong>Tip:</strong> Connect critical systems first for immediate optimization benefits</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
