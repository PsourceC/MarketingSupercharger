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
}

export default function DevProfilePage() {
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
          <button 
            onClick={checkAllConnections}
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
        </div>
      </div>

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
                  <div key={connection.id} className={`connection-card ${connection.status} priority-${connection.priority}`}>
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
