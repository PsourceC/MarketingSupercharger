import TabbedDashboard from './components/TabbedDashboard'
import HelpSystem from './components/HelpSystem'

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

      {/* Tabbed Dashboard Interface */}
      <TabbedDashboard />

      {/* Help System */}
      <HelpSystem />
    </div>
  )
}
