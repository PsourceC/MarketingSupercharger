import Link from 'next/link'
import GeoGrid from './components/GeoGrid'
import MetricsOverview from './components/MetricsOverview'
import AutomationToolsGrid from './components/AutomationToolsGrid'
import PriorityActionsPanel from './components/PriorityActionsPanel'
import HelpSystem from './components/HelpSystem'

export default function Home() {
  return (
    <div className="enhanced-dashboard">
      <header className="main-header">
        <div className="header-content">
          <h1>🌞 Astrawatt Solar Marketing Command Center</h1>
          <p>Real-time local search performance across Austin metro area</p>
          <div className="last-updated">
            <span className="update-indicator">🔄</span>
            Last updated: {new Date().toLocaleString()} • Auto-refresh: ON
          </div>
        </div>
      </header>

      <div className="dashboard-grid">
        {/* Left Panel - Key Metrics */}
        <aside className="metrics-sidebar">
          <MetricsOverview />
          <PriorityActionsPanel />
        </aside>

        {/* Main Content Area */}
        <main className="main-content">
          {/* Geographic Performance Map */}
          <section className="geo-section">
            <div className="section-header">
              <h2>🗺️ Local Search Performance Map</h2>
              <div className="geo-controls">
                <select className="keyword-filter">
                  <option>All Keywords</option>
                  <option>Solar panels near Austin</option>
                  <option>Best solar company near me</option>
                  <option>Cheap solar near me</option>
                  <option>Top rated solar installers</option>
                  <option>Affordable solar near me</option>
                </select>
                <button className="refresh-btn">🔄 Refresh Data</button>
              </div>
            </div>
            <GeoGrid />
          </section>

          {/* Automation Tools */}
          <section className="tools-section">
            <h2>🚀 Marketing Automation Hub</h2>
            <AutomationToolsGrid />
          </section>
        </main>

        {/* Right Panel - Live Updates */}
        <aside className="updates-sidebar">
          <div className="live-updates">
            <h3>📈 Live Performance Feed</h3>
            <div className="update-stream">
              <div className="update-item positive">
                <span className="update-time">2m ago</span>
                <span className="update-text">"Affordable solar near me" jumped +2 positions in Cedar Park</span>
              </div>
              <div className="update-item negative">
                <span className="update-time">15m ago</span>
                <span className="update-text">"Solar installation Austin" dropped 1 position in Georgetown</span>
              </div>
              <div className="update-item neutral">
                <span className="update-time">1h ago</span>
                <span className="update-text">New competitor review detected: ATX Solar (+1 review)</span>
              </div>
              <div className="update-item positive">
                <span className="update-time">2h ago</span>
                <span className="update-text">GMB post engagement +15% in Round Rock area</span>
              </div>
            </div>
          </div>

          <div className="quick-actions">
            <h3>⚡ Quick Actions</h3>
            <div className="action-buttons">
              <button className="quick-btn urgent">🚨 Emergency Citation Boost</button>
              <button className="quick-btn primary">📱 Post GMB Update</button>
              <button className="quick-btn secondary">⭐ Send Review Request</button>
              <button className="quick-btn">📊 Generate Report</button>
            </div>
          </div>

          <div className="performance-alerts">
            <h3>🎯 Smart Alerts</h3>
            <div className="alert-list">
              <div className="alert urgent">
                <span className="alert-icon">🚨</span>
                <div>
                  <strong>Ranking Drop Alert</strong>
                  <p>"Best solar company" dropped 3 positions citywide</p>
                </div>
              </div>
              <div className="alert opportunity">
                <span className="alert-icon">💡</span>
                <div>
                  <strong>Opportunity Detected</strong>
                  <p>Competitor weak in Pflugerville - chance to rank higher</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
