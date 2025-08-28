'use client'

import { useState } from 'react'
import EnhancedGeoGrid from './EnhancedGeoGrid'
import MetricsOverview from './MetricsOverview'
import AutomationToolsGrid from './AutomationToolsGrid'
import PriorityActionsPanel from './PriorityActionsPanel'
import DataRefreshSystem from './DataRefreshSystem'
import GoogleAuthButton from './GoogleAuthButton'
import DataSourceIndicator from './DataSourceIndicator'
import TempDataButton from './TempDataButton'
import ManualDataImport from './ManualDataImport'
import DevProfile from './DevProfile'

export default function UnifiedDashboard() {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())

  const toggleSection = (sectionId: string) => {
    const newCollapsed = new Set(collapsedSections)
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId)
    } else {
      newCollapsed.add(sectionId)
    }
    setCollapsedSections(newCollapsed)
  }

  const isCollapsed = (sectionId: string) => collapsedSections.has(sectionId)

  return (
    <div className="unified-dashboard">
      {/* Geographic Performance Section - Moved to Top */}
      <div className="dashboard-section">
        <div className="section-header expandable" onClick={() => toggleSection('geo')}>
          <div className="header-content">
            <h2>🗺️ Geographic Performance Analysis</h2>
            <p>See where customers discover your solar business across Austin metro area</p>
          </div>
          <button className="collapse-toggle">
            {isCollapsed('geo') ? '▼' : '▲'}
          </button>
        </div>
        {!isCollapsed('geo') && (
          <div className="section-content">
            <EnhancedGeoGrid />
          </div>
        )}
      </div>

      {/* Key Performance Overview Section */}
      <div className="dashboard-top-section">
        <div className="performance-metrics-container">
          <div className="metrics-overview-section">
            <div className="section-header">
              <h2>📊 Key Performance Metrics</h2>
              <p>Your solar business performance at a glance</p>
            </div>
            <GoogleAuthButton />
            <DataSourceIndicator />
            <TempDataButton />
            <ManualDataImport />
            <MetricsOverview />
          </div>

          <div className="summary-insights-section">
            <div className="summary-stats-container">
              <h3>📈 Summary Statistics</h3>
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

            <div className="quick-insights-container">
              <h3>💡 Quick Insights & Recommendations</h3>
              <div className="insight-cards-compact">
                <div className="insight-card highlight">
                  <div className="insight-header">
                    <span className="insight-icon">🎯</span>
                    <h4>Top Opportunity</h4>
                  </div>
                  <p>Pflugerville is your strongest market at #3 ranking. Focus your efforts here to reach #1 position!</p>
                </div>
                <div className="insight-card warning">
                  <div className="insight-header">
                    <span className="insight-icon">⚠️</span>
                    <h4>Needs Attention</h4>
                  </div>
                  <p>Central Austin ranks #12 but has 12,400 monthly searches - your biggest potential market!</p>
                </div>
                <div className="insight-card success">
                  <div className="insight-header">
                    <span className="insight-icon">📈</span>
                    <h4>Recent Success</h4>
                  </div>
                  <p>Cedar Park jumped +3 positions this month! Replicate these strategies elsewhere.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions and Marketing Section */}
      <div className="dashboard-dual-section">
        <div className="dual-section-left">
          <div className="section-header expandable" onClick={() => toggleSection('actions')}>
            <div className="header-content">
              <h2>🎯 Priority Actions</h2>
              <p>Data-driven tasks to improve rankings</p>
            </div>
            <button className="collapse-toggle">
              {isCollapsed('actions') ? '▼' : '▲'}
            </button>
          </div>
          {!isCollapsed('actions') && (
            <div className="section-content">
              <PriorityActionsPanel />
            </div>
          )}
        </div>

        <div className="dual-section-right">
          <div className="section-header expandable" onClick={() => toggleSection('marketing')}>
            <div className="header-content">
              <h2>🚀 Marketing Tools</h2>
              <p>Automated growth strategies</p>
            </div>
            <button className="collapse-toggle">
              {isCollapsed('marketing') ? '▼' : '▲'}
            </button>
          </div>
          {!isCollapsed('marketing') && (
            <div className="section-content">
              <AutomationToolsGrid />
            </div>
          )}
        </div>
      </div>

      {/* Analytics Section */}
      <div className="dashboard-section analytics-section">
        <div className="section-header expandable" onClick={() => toggleSection('analytics')}>
          <div className="header-content">
            <h2>📈 Detailed Analytics & Live Data</h2>
            <p>Comprehensive business insights and real-time information</p>
          </div>
          <button className="collapse-toggle">
            {isCollapsed('analytics') ? '▼' : '▲'}
          </button>
        </div>
        {!isCollapsed('analytics') && (
          <div className="section-content">
            <div className="analytics-container">
              <div className="live-data-section">
                <DataRefreshSystem />
              </div>
              <div className="detailed-analytics">
                <div className="analytics-cards">
                  <div className="analytics-card">
                    <h3>📊 Customer Discovery Sources</h3>
                    <div className="analytics-data">
                      <div className="data-item">
                        <span className="data-label">Google Search</span>
                        <span className="data-value">67%</span>
                        <span className="data-trend positive">+5%</span>
                      </div>
                      <div className="data-item">
                        <span className="data-label">Direct Website</span>
                        <span className="data-value">18%</span>
                        <span className="data-trend positive">+2%</span>
                      </div>
                      <div className="data-item">
                        <span className="data-label">Referrals</span>
                        <span className="data-value">15%</span>
                        <span className="data-trend neutral">0%</span>
                      </div>
                    </div>
                  </div>
                  <div className="analytics-card">
                    <h3>📈 Growth Trends</h3>
                    <div className="trend-data">
                      <div className="trend-item">
                        <span className="trend-label">Website Traffic</span>
                        <span className="trend-value positive">+12% this week</span>
                      </div>
                      <div className="trend-item">
                        <span className="trend-label">Search Visibility</span>
                        <span className="trend-value positive">+8% this month</span>
                      </div>
                      <div className="trend-item">
                        <span className="trend-label">Lead Generation</span>
                        <span className="trend-value positive">+23% this quarter</span>
                      </div>
                    </div>
                  </div>
                  <div className="analytics-card">
                    <h3>🎯 Business Impact</h3>
                    <div className="conversion-data">
                      <div className="conversion-item">
                        <span className="conversion-label">Quote Requests</span>
                        <span className="conversion-value">47</span>
                        <span className="conversion-period">this month</span>
                      </div>
                      <div className="conversion-item">
                        <span className="conversion-label">Phone Calls</span>
                        <span className="conversion-value">156</span>
                        <span className="conversion-period">this month</span>
                      </div>
                      <div className="conversion-item">
                        <span className="conversion-label">Map Directions</span>
                        <span className="conversion-value">89</span>
                        <span className="conversion-period">this month</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dev Profile - Floating Connection Manager */}
      <DevProfile />
    </div>
  )
}
