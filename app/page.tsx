import UnifiedDashboard from './components/UnifiedDashboard'
import HelpSystem from './components/HelpSystem'
import ClientTimestamp from './components/ClientTimestamp'
import './unified-dashboard.css'
import './google-auth.css'
import './manual-import.css'

export default function Home() {
  return (
    <div className="enhanced-dashboard">
      <header className="main-header">
        <div className="header-content">
          <h1>🌞 Your Solar Business Dashboard</h1>
          <p>See how customers find your solar business online across Austin</p>
          <ClientTimestamp />
        </div>
      </header>

      {/* Unified Dashboard Interface */}
      <UnifiedDashboard />

      {/* Help System */}
      <HelpSystem />
    </div>
  )
}
