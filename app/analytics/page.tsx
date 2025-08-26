import Link from 'next/link'

export default function Analytics() {
  return (
    <div className="dashboard">
      <header className="page-header">
        <Link href="/" className="back-button">← Back to Dashboard</Link>
        <h1>📈 Analytics Dashboard</h1>
        <p>Comprehensive performance reporting and insights</p>
      </header>

      <div className="coming-soon">
        <div className="coming-soon-content">
          <h2>🚧 Advanced Analytics Coming Soon</h2>
          <p>Comprehensive analytics and reporting features are currently under development.</p>
          
          <div className="preview-features">
            <h3>Planned Features:</h3>
            <ul>
              <li>✅ Custom performance dashboards</li>
              <li>✅ Automated daily/weekly/monthly reports</li>
              <li>✅ ROI tracking and attribution</li>
              <li>✅ Predictive analytics and forecasting</li>
              <li>✅ Export capabilities (PDF, Excel, etc.)</li>
            </ul>
          </div>
          
          <div className="current-status">
            <h3>📊 Available Analytics:</h3>
            <div className="status-grid">
              <div className="status-card good">
                <h4>SEO Tracking</h4>
                <div className="big-number">Active</div>
                <p>Real-time keyword monitoring</p>
              </div>
              <div className="status-card good">
                <h4>Review Monitoring</h4>
                <div className="big-number">Active</div>
                <p>Automated review tracking</p>
              </div>
              <div className="status-card">
                <h4>GEO Performance</h4>
                <div className="big-number">7 Locations</div>
                <p>Austin metro area coverage</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
