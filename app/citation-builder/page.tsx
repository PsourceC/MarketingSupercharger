import Link from 'next/link'

export default function CitationBuilder() {
  return (
    <div className="dashboard">
      <header className="page-header">
        <Link href="/" className="back-button">← Back to Dashboard</Link>
        <h1>🔗 Citation Building Engine</h1>
        <p>Automated local directory submissions and citation management</p>
      </header>

      <div className="coming-soon">
        <div className="coming-soon-content">
          <h2>🚧 Coming Soon</h2>
          <p>The Citation Building Engine is currently under development and will be available soon.</p>
          
          <div className="preview-features">
            <h3>Planned Features:</h3>
            <ul>
              <li>✅ Automated directory submissions to 100+ platforms</li>
              <li>✅ Citation monitoring and consistency tracking</li>
              <li>✅ Local business listing optimization</li>
              <li>✅ Progress tracking and reporting</li>
              <li>✅ Competitor citation analysis</li>
            </ul>
          </div>
          
          <div className="current-status">
            <h3>📊 Current Citation Status:</h3>
            <div className="status-grid">
              <div className="status-card urgent">
                <h4>Citations Completed</h4>
                <div className="big-number">2/100</div>
                <p>Critical gap vs competitors</p>
              </div>
              <div className="status-card">
                <h4>Priority Directories</h4>
                <div className="big-number">25</div>
                <p>High-impact platforms to target first</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
