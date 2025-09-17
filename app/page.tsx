import UnifiedDashboard from './components/UnifiedDashboard'
import HelpSystem from './components/HelpSystem'
import ClientTimestamp from './components/ClientTimestamp'
import Link from 'next/link'
import ErrorGuard from './components/ErrorGuard'
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
          <div className="header-actions" aria-label="Quick links">
            <Link href="/profile" className="back-button" aria-label="Open Business Profile">🏢 Business Profile</Link>
            <Link href="/setup?service=business-profile" className="back-button" aria-label="Open Business Profile setup guide">⚙️ Setup Guide</Link>
          </div>
        </div>
      </header>

      {/* Unified Dashboard Interface */}
      <UnifiedDashboard />

      {/* Help System */}
      <HelpSystem />
    </div>
  )
}
