'use client'

import { useState } from 'react'

interface PriorityAction {
  id: string
  priority: 'critical' | 'high' | 'medium'
  title: string
  description: string
  impact: string
  effort: 'Low' | 'Medium' | 'High'
  timeline: string
  automatable: boolean
  category: 'GMB' | 'SEO' | 'Reviews' | 'Content' | 'Technical'
  completionPercentage?: number
  nextSteps: string[]
}

const priorityActions: PriorityAction[] = [
  {
    id: 'resume-gmb-posting',
    priority: 'critical',
    title: 'Resume GMB Posting Schedule',
    description: 'Last post was 1 month ago. Competitors post weekly.',
    impact: 'Immediate improvement in local search visibility',
    effort: 'Low',
    timeline: 'Today',
    automatable: true,
    category: 'GMB',
    completionPercentage: 0,
    nextSteps: [
      'Activate GMB content automation',
      'Schedule 3-4 posts for this week',
      'Set up automated posting calendar'
    ]
  },
  {
    id: 'citation-emergency',
    priority: 'critical',
    title: 'Emergency Citation Building',
    description: 'Only 2/100 citations complete. Major ranking factor.',
    impact: 'Significant local search ranking improvement',
    effort: 'Medium',
    timeline: '2-4 weeks',
    automatable: true,
    category: 'SEO',
    completionPercentage: 2,
    nextSteps: [
      'Submit to top 20 directories immediately',
      'Set up automated citation monitoring',
      'Target 50+ citations in 90 days'
    ]
  },
  {
    id: 'review-response-system',
    priority: 'high',
    title: 'Implement Review Response Automation',
    description: 'Only 25% response rate vs 89% industry average.',
    impact: 'Better customer relations and local SEO signals',
    effort: 'Low',
    timeline: 'This week',
    automatable: true,
    category: 'Reviews',
    completionPercentage: 25,
    nextSteps: [
      'Activate AI response system',
      'Respond to all unresponded reviews',
      'Set up auto-responses for new reviews'
    ]
  },
  {
    id: 'page-speed-optimization',
    priority: 'high',
    title: 'Critical Page Speed Fix',
    description: 'Mobile: 42, Desktop: 66. Affecting rankings and UX.',
    impact: 'Better user experience and improved search rankings',
    effort: 'High',
    timeline: '2-4 weeks',
    automatable: false,
    category: 'Technical',
    completionPercentage: 0,
    nextSteps: [
      'Optimize images and reduce file sizes',
      'Minify CSS and JavaScript',
      'Implement CDN and caching'
    ]
  },
  {
    id: 'schema-markup',
    priority: 'high',
    title: 'Add Local Business Schema',
    description: 'Missing structured data markup for rich snippets.',
    impact: 'Enhanced SERP features and better local SEO',
    effort: 'Low',
    timeline: '1 week',
    automatable: true,
    category: 'Technical',
    completionPercentage: 0,
    nextSteps: [
      'Implement LocalBusiness schema',
      'Add service-specific markup',
      'Test with Google Rich Results tool'
    ]
  },
  {
    id: 'review-collection-campaign',
    priority: 'medium',
    title: 'Launch Review Collection Campaign',
    description: 'Need 422 more reviews to match top competitor.',
    impact: 'Improved trust signals and ranking boost',
    effort: 'Medium',
    timeline: '6-12 months',
    automatable: true,
    category: 'Reviews',
    completionPercentage: 7,
    nextSteps: [
      'Set up automated review requests',
      'Target 10+ new reviews monthly',
      'Create review incentive program'
    ]
  }
]

export default function PriorityActionsPanel() {
  const [expandedAction, setExpandedAction] = useState<string | null>(null)

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return '🚨'
      case 'high': return '🔥'
      default: return '⚡'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#ef4444'
      case 'high': return '#f97316'
      default: return '#f59e0b'
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

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'Low': return '#10b981'
      case 'Medium': return '#f59e0b'
      case 'High': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const criticalActions = priorityActions.filter(a => a.priority === 'critical')
  const highActions = priorityActions.filter(a => a.priority === 'high')
  const mediumActions = priorityActions.filter(a => a.priority === 'medium')

  return (
    <div className="priority-actions-panel">
      <div className="panel-header">
        <h3>🎯 Priority Action Queue</h3>
        <div className="queue-stats">
          <span className="stat-item critical">{criticalActions.length} Critical</span>
          <span className="stat-item high">{highActions.length} High</span>
          <span className="stat-item medium">{mediumActions.length} Medium</span>
        </div>
      </div>

      <div className="actions-list">
        {/* Critical Actions */}
        {criticalActions.length > 0 && (
          <div className="actions-section">
            <h4 className="section-title critical">🚨 Critical - Act Today</h4>
            {criticalActions.map(action => (
              <div 
                key={action.id} 
                className={`action-item critical ${expandedAction === action.id ? 'expanded' : ''}`}
                style={{ borderLeftColor: getPriorityColor(action.priority) }}
              >
                <div 
                  className="action-header"
                  onClick={() => setExpandedAction(expandedAction === action.id ? null : action.id)}
                >
                  <div className="action-title-section">
                    <span className="priority-icon">{getPriorityIcon(action.priority)}</span>
                    <span className="category-icon">{getCategoryIcon(action.category)}</span>
                    <h5>{action.title}</h5>
                  </div>
                  <div className="action-meta">
                    {action.automatable && <span className="auto-badge">🤖</span>}
                    <span className="timeline-badge">{action.timeline}</span>
                    <span className="expand-icon">{expandedAction === action.id ? '▼' : '▶'}</span>
                  </div>
                </div>
                
                <p className="action-description">{action.description}</p>
                
                {action.completionPercentage !== undefined && (
                  <div className="progress-section">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${action.completionPercentage}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{action.completionPercentage}% complete</span>
                  </div>
                )}
                
                {expandedAction === action.id && (
                  <div className="action-details">
                    <div className="details-grid">
                      <div className="detail-item">
                        <span className="detail-label">Impact:</span>
                        <span className="detail-value">{action.impact}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Effort:</span>
                        <span 
                          className="effort-badge"
                          style={{ color: getEffortColor(action.effort) }}
                        >
                          {action.effort}
                        </span>
                      </div>
                    </div>
                    
                    <div className="next-steps">
                      <h6>Next Steps:</h6>
                      <ul>
                        {action.nextSteps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="action-buttons">
                      <button className="action-btn primary">Start Now</button>
                      <button className="action-btn secondary">Schedule</button>
                      {action.automatable && (
                        <button className="action-btn automation">🤖 Automate</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* High Priority Actions */}
        {highActions.length > 0 && (
          <div className="actions-section">
            <h4 className="section-title high">🔥 High Priority - This Week</h4>
            {highActions.map(action => (
              <div 
                key={action.id} 
                className={`action-item high ${expandedAction === action.id ? 'expanded' : ''}`}
                style={{ borderLeftColor: getPriorityColor(action.priority) }}
              >
                <div 
                  className="action-header"
                  onClick={() => setExpandedAction(expandedAction === action.id ? null : action.id)}
                >
                  <div className="action-title-section">
                    <span className="priority-icon">{getPriorityIcon(action.priority)}</span>
                    <span className="category-icon">{getCategoryIcon(action.category)}</span>
                    <h5>{action.title}</h5>
                  </div>
                  <div className="action-meta">
                    {action.automatable && <span className="auto-badge">🤖</span>}
                    <span className="timeline-badge">{action.timeline}</span>
                    <span className="expand-icon">{expandedAction === action.id ? '▼' : '▶'}</span>
                  </div>
                </div>
                
                <p className="action-description">{action.description}</p>
                
                {action.completionPercentage !== undefined && (
                  <div className="progress-section">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${action.completionPercentage}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{action.completionPercentage}% complete</span>
                  </div>
                )}
                
                {expandedAction === action.id && (
                  <div className="action-details">
                    <div className="details-grid">
                      <div className="detail-item">
                        <span className="detail-label">Impact:</span>
                        <span className="detail-value">{action.impact}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Effort:</span>
                        <span 
                          className="effort-badge"
                          style={{ color: getEffortColor(action.effort) }}
                        >
                          {action.effort}
                        </span>
                      </div>
                    </div>
                    
                    <div className="next-steps">
                      <h6>Next Steps:</h6>
                      <ul>
                        {action.nextSteps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="action-buttons">
                      <button className="action-btn primary">Start Now</button>
                      <button className="action-btn secondary">Schedule</button>
                      {action.automatable && (
                        <button className="action-btn automation">🤖 Automate</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Medium Priority Actions */}
        {mediumActions.length > 0 && (
          <div className="actions-section">
            <h4 className="section-title medium">⚡ Medium Priority - This Month</h4>
            {mediumActions.map(action => (
              <div 
                key={action.id} 
                className={`action-item medium ${expandedAction === action.id ? 'expanded' : ''}`}
                style={{ borderLeftColor: getPriorityColor(action.priority) }}
              >
                <div 
                  className="action-header"
                  onClick={() => setExpandedAction(expandedAction === action.id ? null : action.id)}
                >
                  <div className="action-title-section">
                    <span className="priority-icon">{getPriorityIcon(action.priority)}</span>
                    <span className="category-icon">{getCategoryIcon(action.category)}</span>
                    <h5>{action.title}</h5>
                  </div>
                  <div className="action-meta">
                    {action.automatable && <span className="auto-badge">🤖</span>}
                    <span className="timeline-badge">{action.timeline}</span>
                    <span className="expand-icon">{expandedAction === action.id ? '▼' : '▶'}</span>
                  </div>
                </div>
                
                <p className="action-description">{action.description}</p>
                
                {action.completionPercentage !== undefined && (
                  <div className="progress-section">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${action.completionPercentage}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{action.completionPercentage}% complete</span>
                  </div>
                )}
                
                {expandedAction === action.id && (
                  <div className="action-details">
                    <div className="details-grid">
                      <div className="detail-item">
                        <span className="detail-label">Impact:</span>
                        <span className="detail-value">{action.impact}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Effort:</span>
                        <span 
                          className="effort-badge"
                          style={{ color: getEffortColor(action.effort) }}
                        >
                          {action.effort}
                        </span>
                      </div>
                    </div>
                    
                    <div className="next-steps">
                      <h6>Next Steps:</h6>
                      <ul>
                        {action.nextSteps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="action-buttons">
                      <button className="action-btn primary">Start Now</button>
                      <button className="action-btn secondary">Schedule</button>
                      {action.automatable && (
                        <button className="action-btn automation">🤖 Automate</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="action-summary">
        <h4>📊 Action Summary</h4>
        <div className="summary-stats">
          <div className="summary-stat">
            <span className="stat-number">{priorityActions.filter(a => a.automatable).length}</span>
            <span className="stat-label">Automatable</span>
          </div>
          <div className="summary-stat">
            <span className="stat-number">
              {Math.round(priorityActions.reduce((sum, a) => sum + (a.completionPercentage || 0), 0) / priorityActions.length)}%
            </span>
            <span className="stat-label">Avg Complete</span>
          </div>
          <div className="summary-stat">
            <span className="stat-number">{priorityActions.filter(a => a.effort === 'Low').length}</span>
            <span className="stat-label">Quick Wins</span>
          </div>
        </div>
      </div>
    </div>
  )
}
