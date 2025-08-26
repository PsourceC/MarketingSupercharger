import Link from 'next/link'

export default function ContentCalendar() {
  return (
    <div className="dashboard">
      <header className="page-header">
        <Link href="/" className="back-button">← Back to Dashboard</Link>
        <h1>📅 Content Scheduling System</h1>
        <p>Plan and automate content across all marketing channels</p>
      </header>

      <div className="coming-soon">
        <div className="coming-soon-content">
          <h2>🚧 Coming Soon</h2>
          <p>The Content Scheduling System is currently under development and will be available soon.</p>
          
          <div className="preview-features">
            <h3>Planned Features:</h3>
            <ul>
              <li>✅ Unified content calendar for all platforms</li>
              <li>✅ Automated posting to GMB, social media, and blog</li>
              <li>✅ Content templates and AI generation</li>
              <li>✅ Performance tracking and optimization</li>
              <li>✅ Seasonal campaign planning</li>
            </ul>
          </div>
          
          <div className="current-status">
            <h3>📊 Current Content Status:</h3>
            <div className="status-grid">
              <div className="status-card warning">
                <h4>Posting Frequency</h4>
                <div className="big-number">1-2/month</div>
                <p>Inconsistent vs competitors' weekly posts</p>
              </div>
              <div className="status-card">
                <h4>Content Channels</h4>
                <div className="big-number">4</div>
                <p>GMB, Blog, Social Media, Email</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
