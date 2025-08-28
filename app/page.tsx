import Link from 'next/link'
import EnhancedGeoGrid from './components/EnhancedGeoGrid'
import MetricsOverview from './components/MetricsOverview'
import AutomationToolsGrid from './components/AutomationToolsGrid'
import PriorityActionsPanel from './components/PriorityActionsPanel'
import HelpSystem from './components/HelpSystem'
import DataRefreshSystem from './components/DataRefreshSystem'

export default function Home() {
  return (
    <div className="enhanced-dashboard">
      <header className="main-header">
        <div className="header-content">
          <h1>🌞 Your Solar Business Dashboard</h1>
          <p>See how customers find your solar business online across Austin</p>
          <div className="last-updated">
            <span className="update-indicator">🔄</span>
            Updated: {new Date().toLocaleString()} • Fresh data every 15 minutes
          </div>
        </div>
      </header>

      <div className="dashboard-grid">
        {/* Left Panel - Key Metrics */}
        <aside className="metrics-sidebar">
          <MetricsOverview />
        </aside>

        {/* Main Content Area */}
        <main className="main-content">
          {/* Geographic Performance Map */}
          <section className="geo-section">
            <div className="section-header">
              <h2>🗺️ Where Customers Find You</h2>
              <div className="geo-controls">
                <select className="keyword-filter">
                  <option>All Search Terms</option>
                  <option>Solar panels near Austin</option>
                  <option>Best solar company near me</option>
                  <option>Cheap solar near me</option>
                  <option>Top rated solar installers</option>
                  <option>Affordable solar near me</option>
                </select>
                <button className="refresh-btn">🔄 Update Map</button>
              </div>
            </div>
            <EnhancedGeoGrid />
          </section>

          {/* Automation Tools */}
          <section className="tools-section">
            <h2>🚀 Tools to Get More Customers</h2>
            <AutomationToolsGrid />
          </section>
        </main>

        {/* Right Panel - Live Updates */}
        <aside className="updates-sidebar">
          <DataRefreshSystem />

          <div className="live-updates">
            <h3>📈 What's Happening Now</h3>
            <div className="update-stream">
              <div className="update-item positive">
                <span className="update-time">2m ago</span>
                <span className="update-text">Good news! You moved up 2 spots in Cedar Park for "affordable solar"</span>
              </div>
              <div className="update-item negative">
                <span className="update-time">15m ago</span>
                <span className="update-text">You dropped 1 spot in Georgetown - let's fix this!</span>
              </div>
              <div className="update-item neutral">
                <span className="update-time">1h ago</span>
                <span className="update-text">ATX Solar got a new review - they're at 187 total</span>
              </div>
              <div className="update-item positive">
                <span className="update-time">2h ago</span>
                <span className="update-text">Your Google post got 15% more views in Round Rock</span>
              </div>
            </div>
          </div>

          <div className="quick-actions">
            <h3>⚡ Quick Actions</h3>
            <div className="action-buttons">
              <button className="quick-btn urgent">🚨 Fix Critical Issues</button>
              <button className="quick-btn primary">📱 Post on Google</button>
              <button className="quick-btn secondary">⭐ Ask for Reviews</button>
              <button className="quick-btn">📊 Download Report</button>
            </div>
          </div>

          <div className="performance-alerts">
            <h3>🎯 Important Alerts</h3>
            <div className="alert-list">
              <div className="alert urgent">
                <span className="alert-icon">🚨</span>
                <div>
                  <strong>You're losing ground!</strong>
                  <p>Your ranking for "best solar company" dropped 3 spots citywide</p>
                </div>
              </div>
              <div className="alert opportunity">
                <span className="alert-icon">💡</span>
                <div>
                  <strong>Great opportunity!</strong>
                  <p>Your competitor is weak in Pflugerville - you can rank higher here</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Priority Actions - Full Width Horizontal Section */}
      <section className="priority-actions-section">
        <PriorityActionsPanel />
      </section>

      {/* Help System */}
      <HelpSystem />
    </div>
  )
}
