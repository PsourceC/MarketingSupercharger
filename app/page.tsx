import Link from 'next/link'

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  positive?: boolean
}

function MetricCard({ title, value, change, positive }: MetricCardProps) {
  return (
    <div className="metric-card">
      <h3>{title}</h3>
      <div className="metric-value">{value}</div>
      {change && (
        <div className={`metric-change ${positive ? 'positive' : 'negative'}`}>
          {positive ? '↗' : '↘'} {change}
        </div>
      )}
    </div>
  )
}

export default function Home() {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🌞 Astrawatt Solar Marketing Automation</h1>
        <p>Streamline your SEO, GMB management, and competitor tracking</p>
      </header>

      <div className="metrics-grid">
        <MetricCard title="GMB Reviews" value="31" change="Need 422 more" positive={false} />
        <MetricCard title="GMB Photos" value="94" change="Need 56 more" positive={false} />
        <MetricCard title="Keyword Rankings" value="5 tracked" change="+2 this month" positive={true} />
        <MetricCard title="Citations" value="2/100" change="Critical" positive={false} />
      </div>

      <div className="automation-tools">
        <h2>🚀 Automation Tools</h2>
        <div className="tools-grid">
          <Link href="/gmb-automation" className="tool-card">
            <h3>📱 GMB Automation</h3>
            <p>Auto-generate posts, products, and service descriptions</p>
            <div className="tool-status urgent">Needs attention - Last post 1 month ago</div>
          </Link>
          
          <Link href="/seo-tracking" className="tool-card">
            <h3>📊 SEO Tracking</h3>
            <p>Monitor keywords, rankings, and competitor analysis</p>
            <div className="tool-status good">Tracking 5 core keywords</div>
          </Link>
          
          <Link href="/review-management" className="tool-card">
            <h3>⭐ Review Management</h3>
            <p>Generate responses and track review requests</p>
            <div className="tool-status warning">31 reviews vs competitors' 453</div>
          </Link>
          
          <Link href="/content-calendar" className="tool-card">
            <h3>📅 Content Calendar</h3>
            <p>Schedule posts and track content performance</p>
            <div className="tool-status warning">Inconsistent posting schedule</div>
          </Link>
          
          <Link href="/citation-builder" className="tool-card">
            <h3>🔗 Citation Builder</h3>
            <p>Build and track local citations automatically</p>
            <div className="tool-status urgent">Only 2/100 citations complete</div>
          </Link>
          
          <Link href="/competitor-intel" className="tool-card">
            <h3>🕵️ Competitor Intelligence</h3>
            <p>Monitor 512 Solar, ATX Solar, and Cool Solar</p>
            <div className="tool-status good">3 competitors tracked</div>
          </Link>

          <Link href="/recommendations" className="tool-card">
            <h3>💡 Strategic Recommendations</h3>
            <p>Complete analysis and 90-day implementation roadmap</p>
            <div className="tool-status good">9 actionable recommendations</div>
          </Link>
        </div>
      </div>

      <div className="priority-actions">
        <h2>🎯 Priority Actions</h2>
        <div className="action-list">
          <div className="action-item urgent">
            <span className="action-icon">🚨</span>
            <div>
              <h4>Critical: Build Citations</h4>
              <p>Only 2/100 citations complete - major ranking factor</p>
            </div>
          </div>
          <div className="action-item urgent">
            <span className="action-icon">📱</span>
            <div>
              <h4>Urgent: Resume GMB Posting</h4>
              <p>Last post 1 month ago - competitors posting regularly</p>
            </div>
          </div>
          <div className="action-item warning">
            <span className="action-icon">⭐</span>
            <div>
              <h4>Important: Increase Reviews</h4>
              <p>Need 422 more reviews to match top competitor</p>
            </div>
          </div>
          <div className="action-item warning">
            <span className="action-icon">📸</span>
            <div>
              <h4>Ongoing: Add GMB Photos</h4>
              <p>Need 56 more photos to reach 150 minimum</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
