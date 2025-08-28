'use client'

import { useState } from 'react'
import EnhancedGeoGrid from './EnhancedGeoGrid'
import MetricsOverview from './MetricsOverview'
import AutomationToolsGrid from './AutomationToolsGrid'
import PriorityActionsPanel from './PriorityActionsPanel'
import DataRefreshSystem from './DataRefreshSystem'

interface Tab {
  id: string
  label: string
  icon: string
  badge?: string
  description: string
}

const tabs: Tab[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '📊',
    description: 'Key metrics and business overview'
  },
  {
    id: 'performance',
    label: 'Performance',
    icon: '🗺️',
    description: 'Geographic performance and customer discovery'
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: '🚀',
    description: 'Automation tools and growth strategies'
  },
  {
    id: 'actions',
    label: 'Actions',
    icon: '🎯',
    badge: '6',
    description: 'Priority tasks and recommendations'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: '📈',
    description: 'Live data and detailed insights'
  }
]

export default function TabbedDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="tab-content dashboard-content">
            <div className="dashboard-overview">
              <div className="overview-grid">
                <div className="metrics-section">
                  <MetricsOverview />
                </div>
                <div className="quick-insights">
                  <div className="insight-cards">
                    <div className="insight-card highlight">
                      <div className="insight-header">
                        <span className="insight-icon">🎯</span>
                        <h3>Top Opportunity</h3>
                      </div>
                      <p>Pflugerville is your strongest market at #3 ranking. Push for #1!</p>
                      <button className="insight-action">Focus Here</button>
                    </div>
                    <div className="insight-card warning">
                      <div className="insight-header">
                        <span className="insight-icon">⚠️</span>
                        <h3>Needs Attention</h3>
                      </div>
                      <p>Central Austin at #12 - your biggest potential market needs work.</p>
                      <button className="insight-action">Fix Now</button>
                    </div>
                    <div className="insight-card success">
                      <div className="insight-header">
                        <span className="insight-icon">📈</span>
                        <h3>Growing Fast</h3>
                      </div>
                      <p>Cedar Park jumped +3 positions this month!</p>
                      <button className="insight-action">Analyze</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="dashboard-summary">
                <div className="summary-stats">
                  <div className="summary-stat">
                    <span className="stat-number">12.4</span>
                    <span className="stat-label">Avg Ranking</span>
                    <span className="stat-change positive">+2.3 improved</span>
                  </div>
                  <div className="summary-stat">
                    <span className="stat-number">34%</span>
                    <span className="stat-label">Visibility</span>
                    <span className="stat-change positive">+8% this month</span>
                  </div>
                  <div className="summary-stat">
                    <span className="stat-number">31</span>
                    <span className="stat-label">Reviews</span>
                    <span className="stat-change negative">Need 119 more</span>
                  </div>
                  <div className="summary-stat">
                    <span className="stat-number">389</span>
                    <span className="stat-label">Backlinks</span>
                    <span className="stat-change positive">+15 new</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'performance':
        return (
          <div className="tab-content performance-content">
            <div className="performance-header">
              <h2>🗺️ Geographic Performance Analysis</h2>
              <p>See where customers discover your solar business across Austin metro area</p>
            </div>
            <div className="geo-section-enhanced">
              <EnhancedGeoGrid />
            </div>
          </div>
        )

      case 'marketing':
        return (
          <div className="tab-content marketing-content">
            <div className="marketing-header">
              <h2>🚀 Marketing Automation & Growth Tools</h2>
              <p>Automated tools to attract more customers and grow your solar business</p>
            </div>
            <AutomationToolsGrid />
          </div>
        )

      case 'actions':
        return (
          <div className="tab-content actions-content">
            <div className="actions-header">
              <h2>🎯 Priority Actions & Recommendations</h2>
              <p>Data-driven tasks to improve your search rankings and customer acquisition</p>
            </div>
            <PriorityActionsPanel />
          </div>
        )

      case 'analytics':
        return (
          <div className="tab-content analytics-content">
            <div className="analytics-grid">
              <div className="live-data-section">
                <DataRefreshSystem />
              </div>
              <div className="detailed-analytics">
                <div className="analytics-cards">
                  <div className="analytics-card">
                    <h3>📊 Traffic Sources</h3>
                    <div className="analytics-data">
                      <div className="data-item">
                        <span className="data-label">Organic Search</span>
                        <span className="data-value">67%</span>
                      </div>
                      <div className="data-item">
                        <span className="data-label">Direct</span>
                        <span className="data-value">18%</span>
                      </div>
                      <div className="data-item">
                        <span className="data-label">Referral</span>
                        <span className="data-value">15%</span>
                      </div>
                    </div>
                  </div>
                  <div className="analytics-card">
                    <h3>📈 Performance Trends</h3>
                    <div className="trend-data">
                      <div className="trend-item">
                        <span className="trend-label">This Week</span>
                        <span className="trend-value positive">+12% traffic</span>
                      </div>
                      <div className="trend-item">
                        <span className="trend-label">This Month</span>
                        <span className="trend-value positive">+8% visibility</span>
                      </div>
                      <div className="trend-item">
                        <span className="trend-label">Quarter</span>
                        <span className="trend-value positive">+23% leads</span>
                      </div>
                    </div>
                  </div>
                  <div className="analytics-card">
                    <h3>🎯 Conversion Metrics</h3>
                    <div className="conversion-data">
                      <div className="conversion-item">
                        <span className="conversion-label">Lead Conversion</span>
                        <span className="conversion-value">3.2%</span>
                      </div>
                      <div className="conversion-item">
                        <span className="conversion-label">Call-to-Action</span>
                        <span className="conversion-value">5.7%</span>
                      </div>
                      <div className="conversion-item">
                        <span className="conversion-label">Quote Requests</span>
                        <span className="conversion-value">12.4%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="tabbed-dashboard">
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <div className="tab-list">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              title={tab.description}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
              {tab.badge && (
                <span className="tab-badge">{tab.badge}</span>
              )}
            </button>
          ))}
        </div>
        <div className="tab-description">
          <span className="current-tab-desc">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </span>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-container">
        {renderTabContent()}
      </div>
    </div>
  )
}
