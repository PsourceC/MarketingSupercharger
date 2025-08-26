'use client'

import Link from 'next/link'

interface Recommendation {
  id: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  category: 'GMB' | 'SEO' | 'Reviews' | 'Content' | 'Technical'
  title: string
  description: string
  impact: string
  effort: 'Low' | 'Medium' | 'High'
  timeline: string
  automatable: boolean
  currentStatus: string
  targetMetric: string
}

const recommendations: Recommendation[] = [
  {
    id: 'citations',
    priority: 'critical',
    category: 'SEO',
    title: 'Build Citation Portfolio',
    description: 'Currently at 2/100 citations. This is a major local SEO ranking factor that competitors are leveraging.',
    impact: 'Major improvement in local search rankings and map pack visibility',
    effort: 'Medium',
    timeline: '2-3 months',
    automatable: true,
    currentStatus: '2/100 complete',
    targetMetric: 'Reach 50+ citations in 90 days'
  },
  {
    id: 'gmb-posting',
    priority: 'critical', 
    category: 'GMB',
    title: 'Resume Consistent GMB Posting',
    description: 'Last post was 1 month ago while competitors post weekly. GMB posts improve local visibility and engagement.',
    impact: 'Increased local search visibility and customer engagement',
    effort: 'Low',
    timeline: 'Immediate',
    automatable: true,
    currentStatus: '1-2 posts/month (inconsistent)',
    targetMetric: '3-4 posts/week automated'
  },
  {
    id: 'review-collection',
    priority: 'high',
    category: 'Reviews', 
    title: 'Implement Review Collection System',
    description: 'Need 422 more reviews to match top competitor (512 Solar). Current response rate is only 25%.',
    impact: 'Improved trust signals and local ranking boost',
    effort: 'Medium',
    timeline: '6-12 months',
    automatable: true,
    currentStatus: '31 reviews total',
    targetMetric: '100+ reviews in 6 months'
  },
  {
    id: 'page-speed',
    priority: 'high',
    category: 'Technical',
    title: 'Optimize Page Speed',
    description: 'Mobile: 42, Desktop: 66. Page speed is a ranking factor and affects user experience.',
    impact: 'Better user experience and improved search rankings',
    effort: 'High',
    timeline: '2-4 weeks',
    automatable: false,
    currentStatus: 'Mobile: 42, Desktop: 66',
    targetMetric: 'Mobile: 80+, Desktop: 90+'
  },
  {
    id: 'schema-markup',
    priority: 'high',
    category: 'Technical',
    title: 'Add Local Business Schema',
    description: 'Missing structured data markup. Competitors likely have this implemented for rich snippets.',
    impact: 'Enhanced SERP features and better local SEO',
    effort: 'Low',
    timeline: '1 week',
    automatable: true,
    currentStatus: 'Not implemented',
    targetMetric: 'Full LocalBusiness schema deployed'
  },
  {
    id: 'gmb-photos',
    priority: 'medium',
    category: 'GMB',
    title: 'Increase GMB Photo Count',
    description: 'Currently 94 photos, need 150+ for optimal performance. Competitors have 170-220 photos.',
    impact: 'Better visual presence in search results',
    effort: 'Medium',
    timeline: 'Ongoing',
    automatable: false,
    currentStatus: '94 photos',
    targetMetric: '150+ photos'
  },
  {
    id: 'content-creation',
    priority: 'medium',
    category: 'Content',
    title: 'Regular Blog Content',
    description: 'Only 15 blog posts vs competitors with regular content. Fresh content helps SEO and establishes authority.',
    impact: 'Improved topic authority and long-tail keyword rankings',
    effort: 'Medium',
    timeline: 'Ongoing',
    automatable: true,
    currentStatus: '15 posts total',
    targetMetric: '2-3 posts/month'
  },
  {
    id: 'review-responses',
    priority: 'medium',
    category: 'Reviews',
    title: 'Improve Review Response Rate',
    description: 'Currently 25% response rate vs industry average of 89%. Responding shows engagement and care.',
    impact: 'Better customer relationships and local SEO signals',
    effort: 'Low',
    timeline: 'Immediate',
    automatable: true,
    currentStatus: '25% response rate',
    targetMetric: '90%+ response rate'
  },
  {
    id: 'social-posting',
    priority: 'low',
    category: 'Content',
    title: 'Regular Social Media Posting',
    description: 'Social signals and consistent brand presence across platforms helps overall digital marketing.',
    impact: 'Brand awareness and indirect SEO benefits',
    effort: 'Low',
    timeline: 'Ongoing',
    automatable: true,
    currentStatus: 'Inconsistent posting',
    targetMetric: '5+ posts/week across platforms'
  }
]

export default function Recommendations() {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'critical'
      case 'high': return 'high' 
      case 'medium': return 'medium'
      default: return 'low'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'GMB': return '📱'
      case 'SEO': return '🔍'
      case 'Reviews': return '⭐'
      case 'Content': return '📝'
      case 'Technical': return '⚙️'
      default: return '📊'
    }
  }

  const criticalItems = recommendations.filter(r => r.priority === 'critical')
  const highItems = recommendations.filter(r => r.priority === 'high')
  const mediumItems = recommendations.filter(r => r.priority === 'medium')
  const lowItems = recommendations.filter(r => r.priority === 'low')

  return (
    <div className="recommendations">
      <header className="page-header">
        <Link href="/" className="back-button">← Back to Dashboard</Link>
        <h1>💡 Marketing Automation Recommendations</h1>
        <p>Strategic improvements based on competitor analysis and current performance gaps</p>
      </header>

      <div className="executive-summary">
        <h2>📋 Executive Summary</h2>
        <div className="summary-grid">
          <div className="summary-card critical">
            <h3>🚨 Critical Issues</h3>
            <div className="summary-count">{criticalItems.length}</div>
            <p>Immediate attention required</p>
          </div>
          <div className="summary-card high">
            <h3>🔥 High Priority</h3>
            <div className="summary-count">{highItems.length}</div>
            <p>Significant impact opportunities</p>
          </div>
          <div className="summary-card medium">
            <h3>⚡ Medium Priority</h3>
            <div className="summary-count">{mediumItems.length}</div>
            <p>Steady improvement areas</p>
          </div>
          <div className="summary-card low">
            <h3>📈 Nice to Have</h3>
            <div className="summary-count">{lowItems.length}</div>
            <p>Long-term optimization</p>
          </div>
        </div>
      </div>

      <div className="automation-potential">
        <h2>🤖 Automation Potential</h2>
        <div className="automation-stats">
          <div className="automation-stat">
            <span className="stat-number">{recommendations.filter(r => r.automatable).length}</span>
            <span className="stat-label">Automatable Tasks</span>
          </div>
          <div className="automation-stat">
            <span className="stat-number">{Math.round((recommendations.filter(r => r.automatable).length / recommendations.length) * 100)}%</span>
            <span className="stat-label">Automation Coverage</span>
          </div>
          <div className="automation-stat">
            <span className="stat-number">15h/week</span>
            <span className="stat-label">Estimated Time Savings</span>
          </div>
        </div>
      </div>

      <div className="recommendations-sections">
        {criticalItems.length > 0 && (
          <div className="recommendations-section">
            <h2>🚨 Critical Priority - Take Action Immediately</h2>
            <div className="recommendations-grid">
              {criticalItems.map(rec => (
                <div key={rec.id} className={`recommendation-card ${getPriorityColor(rec.priority)}`}>
                  <div className="recommendation-header">
                    <span className="category-icon">{getCategoryIcon(rec.category)}</span>
                    <span className="category-label">{rec.category}</span>
                    {rec.automatable && <span className="automation-badge">🤖 Automatable</span>}
                  </div>
                  
                  <h3>{rec.title}</h3>
                  <p className="description">{rec.description}</p>
                  
                  <div className="recommendation-metrics">
                    <div className="metric">
                      <span className="metric-label">Impact:</span>
                      <span className="metric-value">{rec.impact}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Effort:</span>
                      <span className={`effort-badge ${rec.effort.toLowerCase()}`}>{rec.effort}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Timeline:</span>
                      <span className="metric-value">{rec.timeline}</span>
                    </div>
                  </div>
                  
                  <div className="status-tracking">
                    <div className="current-status">
                      <strong>Current:</strong> {rec.currentStatus}
                    </div>
                    <div className="target-metric">
                      <strong>Target:</strong> {rec.targetMetric}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {highItems.length > 0 && (
          <div className="recommendations-section">
            <h2>🔥 High Priority - Significant Impact</h2>
            <div className="recommendations-grid">
              {highItems.map(rec => (
                <div key={rec.id} className={`recommendation-card ${getPriorityColor(rec.priority)}`}>
                  <div className="recommendation-header">
                    <span className="category-icon">{getCategoryIcon(rec.category)}</span>
                    <span className="category-label">{rec.category}</span>
                    {rec.automatable && <span className="automation-badge">🤖 Automatable</span>}
                  </div>
                  
                  <h3>{rec.title}</h3>
                  <p className="description">{rec.description}</p>
                  
                  <div className="recommendation-metrics">
                    <div className="metric">
                      <span className="metric-label">Impact:</span>
                      <span className="metric-value">{rec.impact}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Effort:</span>
                      <span className={`effort-badge ${rec.effort.toLowerCase()}`}>{rec.effort}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Timeline:</span>
                      <span className="metric-value">{rec.timeline}</span>
                    </div>
                  </div>
                  
                  <div className="status-tracking">
                    <div className="current-status">
                      <strong>Current:</strong> {rec.currentStatus}
                    </div>
                    <div className="target-metric">
                      <strong>Target:</strong> {rec.targetMetric}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {mediumItems.length > 0 && (
          <div className="recommendations-section">
            <h2>⚡ Medium Priority - Steady Improvements</h2>
            <div className="recommendations-grid">
              {mediumItems.map(rec => (
                <div key={rec.id} className={`recommendation-card ${getPriorityColor(rec.priority)}`}>
                  <div className="recommendation-header">
                    <span className="category-icon">{getCategoryIcon(rec.category)}</span>
                    <span className="category-label">{rec.category}</span>
                    {rec.automatable && <span className="automation-badge">🤖 Automatable</span>}
                  </div>
                  
                  <h3>{rec.title}</h3>
                  <p className="description">{rec.description}</p>
                  
                  <div className="recommendation-metrics">
                    <div className="metric">
                      <span className="metric-label">Impact:</span>
                      <span className="metric-value">{rec.impact}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Effort:</span>
                      <span className={`effort-badge ${rec.effort.toLowerCase()}`}>{rec.effort}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Timeline:</span>
                      <span className="metric-value">{rec.timeline}</span>
                    </div>
                  </div>
                  
                  <div className="status-tracking">
                    <div className="current-status">
                      <strong>Current:</strong> {rec.currentStatus}
                    </div>
                    <div className="target-metric">
                      <strong>Target:</strong> {rec.targetMetric}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="implementation-roadmap">
          <h2>🗺️ 90-Day Implementation Roadmap</h2>
          <div className="roadmap-timeline">
            <div className="timeline-phase">
              <h3>Week 1-2: Critical Fixes</h3>
              <ul>
                <li>✅ Resume GMB posting schedule (3-4 posts/week)</li>
                <li>✅ Implement automated review response system</li>
                <li>✅ Add LocalBusiness schema markup</li>
              </ul>
            </div>
            
            <div className="timeline-phase">
              <h3>Week 3-6: High Impact Items</h3>
              <ul>
                <li>🔧 Optimize page speed (mobile & desktop)</li>
                <li>📝 Begin citation building campaign</li>
                <li>⭐ Launch automated review collection</li>
              </ul>
            </div>
            
            <div className="timeline-phase">
              <h3>Week 7-12: Ongoing Optimization</h3>
              <ul>
                <li>📸 Increase GMB photo portfolio</li>
                <li>📝 Establish regular content calendar</li>
                <li>📱 Monitor and optimize all automated systems</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="competitive-advantage">
          <h2>🏆 Competitive Advantage</h2>
          <div className="advantage-grid">
            <div className="advantage-card">
              <h3>Citation Lead</h3>
              <p>Currently behind by 400+ citations. Aggressive building campaign can close this gap in 6 months.</p>
            </div>
            <div className="advantage-card">
              <h3>Review Volume</h3>
              <p>512 Solar has 453 reviews vs your 31. Target 10+ new reviews monthly to reach 100+ in 6 months.</p>
            </div>
            <div className="advantage-card">
              <h3>Backlink Quality</h3>
              <p>You actually lead in backlinks (389 vs competitors' 186-445). Leverage this strength further.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
