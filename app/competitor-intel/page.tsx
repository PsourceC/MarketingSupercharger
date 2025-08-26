import Link from 'next/link'

export default function CompetitorIntel() {
  return (
    <div className="dashboard">
      <header className="page-header">
        <Link href="/" className="back-button">← Back to Dashboard</Link>
        <h1>🕵️ Competitor Intelligence</h1>
        <p>Monitor competitors and identify market opportunities</p>
      </header>

      <div className="coming-soon">
        <div className="coming-soon-content">
          <h2>🚧 Advanced Features Coming Soon</h2>
          <p>Enhanced competitor tracking features are currently under development.</p>
          
          <div className="preview-features">
            <h3>Planned Features:</h3>
            <ul>
              <li>✅ Real-time competitor ranking tracking</li>
              <li>✅ Automated content gap analysis</li>
              <li>✅ Pricing and promotion monitoring</li>
              <li>✅ Social media activity tracking</li>
              <li>✅ Market opportunity alerts</li>
            </ul>
          </div>
          
          <div className="current-status">
            <h3>📊 Current Competitor Analysis:</h3>
            <div className="status-grid">
              <div className="status-card">
                <h4>Tracked Competitors</h4>
                <div className="big-number">3</div>
                <p>512 Solar, ATX Solar, Cool Solar</p>
              </div>
              <div className="status-card warning">
                <h4>Review Gap</h4>
                <div className="big-number">422</div>
                <p>Reviews behind top competitor</p>
              </div>
              <div className="status-card good">
                <h4>Backlink Advantage</h4>
                <div className="big-number">+203</div>
                <p>More backlinks than top competitor</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
