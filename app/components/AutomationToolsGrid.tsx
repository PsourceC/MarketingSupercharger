'use client'

import Link from 'next/link'

interface AutomationTool {
  id: string
  title: string
  icon: string
  description: string
  status: 'good' | 'warning' | 'urgent'
  statusText: string
  href: string
  automation: boolean
  lastActivity?: string
  impact: 'high' | 'medium' | 'low'
}

const automationTools: AutomationTool[] = [
  {
    id: 'gmb-automation',
    title: 'GMB Content Engine',
    icon: '📱',
    description: 'Auto-generate and schedule GMB posts, products, and services',
    status: 'urgent',
    statusText: 'Last post 1 month ago - Needs immediate attention',
    href: '/gmb-automation',
    automation: true,
    lastActivity: '30 days ago',
    impact: 'high'
  },
  {
    id: 'seo-tracking',
    title: 'SEO Performance Monitor',
    icon: '📊',
    description: 'Real-time keyword tracking and competitor analysis',
    status: 'good',
    statusText: 'Tracking 5 keywords across 7 locations',
    href: '/seo-tracking',
    automation: true,
    lastActivity: '2 minutes ago',
    impact: 'high'
  },
  {
    id: 'review-management',
    title: 'Review Automation Hub',
    icon: '⭐',
    description: 'AI-powered review responses and collection campaigns',
    status: 'warning',
    statusText: '25% response rate - Industry avg: 89%',
    href: '/review-management',
    automation: true,
    lastActivity: '3 days ago',
    impact: 'high'
  },
  {
    id: 'citation-builder',
    title: 'Citation Building Engine',
    icon: '🔗',
    description: 'Automated local directory submissions and citation management',
    status: 'urgent',
    statusText: 'Only 2/100 citations - Critical for local SEO',
    href: '/citation-builder',
    automation: true,
    lastActivity: 'Never',
    impact: 'high'
  },
  {
    id: 'content-calendar',
    title: 'Content Scheduling System',
    icon: '📅',
    description: 'Plan and automate content across all marketing channels',
    status: 'warning',
    statusText: 'Inconsistent posting schedule detected',
    href: '/content-calendar',
    automation: true,
    lastActivity: '1 week ago',
    impact: 'medium'
  },
  {
    id: 'competitor-intel',
    title: 'Competitor Intelligence',
    icon: '🕵️',
    description: 'Monitor competitors and identify market opportunities',
    status: 'good',
    statusText: 'Tracking 3 main competitors actively',
    href: '/competitor-intel',
    automation: true,
    lastActivity: '1 hour ago',
    impact: 'medium'
  },
  {
    id: 'recommendations',
    title: 'Strategic Insights',
    icon: '💡',
    description: 'AI-powered recommendations and implementation roadmap',
    status: 'good',
    statusText: '9 actionable recommendations ready',
    href: '/recommendations',
    automation: false,
    lastActivity: 'Real-time',
    impact: 'high'
  },
  {
    id: 'reporting',
    title: 'Analytics Dashboard',
    icon: '📈',
    description: 'Comprehensive performance reporting and insights',
    status: 'good',
    statusText: 'Daily automated reports active',
    href: '/analytics',
    automation: true,
    lastActivity: 'Daily',
    impact: 'medium'
  }
]

export default function AutomationToolsGrid() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return '✅'
      case 'warning': return '⚠️'
      case 'urgent': return '🚨'
      default: return '❓'
    }
  }

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high': return { text: 'High Impact', class: 'impact-high' }
      case 'medium': return { text: 'Medium Impact', class: 'impact-medium' }
      default: return { text: 'Low Impact', class: 'impact-low' }
    }
  }

  const urgentTools = automationTools.filter(tool => tool.status === 'urgent')
  const warningTools = automationTools.filter(tool => tool.status === 'warning')
  const goodTools = automationTools.filter(tool => tool.status === 'good')

  return (
    <div className="automation-tools-grid">
      {/* Urgent Tools - Priority Section */}
      {urgentTools.length > 0 && (
        <div className="tools-section urgent-section">
          <div className="section-header">
            <h3>🚨 Needs Immediate Attention</h3>
            <span className="tool-count">{urgentTools.length} tools</span>
          </div>
          <div className="tools-grid">
            {urgentTools.map(tool => {
              const impact = getImpactBadge(tool.impact)
              return (
                <Link key={tool.id} href={tool.href} className="tool-card urgent">
                  <div className="tool-header">
                    <div className="tool-icon-title">
                      <span className="tool-icon">{tool.icon}</span>
                      <h4>{tool.title}</h4>
                    </div>
                    <div className="tool-badges">
                      {tool.automation && <span className="automation-badge">🤖 AUTO</span>}
                      <span className={`impact-badge ${impact.class}`}>{impact.text}</span>
                    </div>
                  </div>
                  
                  <p className="tool-description">{tool.description}</p>
                  
                  <div className="tool-status urgent">
                    <span className="status-icon">{getStatusIcon(tool.status)}</span>
                    <span className="status-text">{tool.statusText}</span>
                  </div>
                  
                  <div className="tool-footer">
                    <span className="last-activity">Last: {tool.lastActivity}</span>
                    <span className="cta-arrow">→</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Warning Tools */}
      {warningTools.length > 0 && (
        <div className="tools-section warning-section">
          <div className="section-header">
            <h3>⚠️ Needs Optimization</h3>
            <span className="tool-count">{warningTools.length} tools</span>
          </div>
          <div className="tools-grid">
            {warningTools.map(tool => {
              const impact = getImpactBadge(tool.impact)
              return (
                <Link key={tool.id} href={tool.href} className="tool-card warning">
                  <div className="tool-header">
                    <div className="tool-icon-title">
                      <span className="tool-icon">{tool.icon}</span>
                      <h4>{tool.title}</h4>
                    </div>
                    <div className="tool-badges">
                      {tool.automation && <span className="automation-badge">🤖 AUTO</span>}
                      <span className={`impact-badge ${impact.class}`}>{impact.text}</span>
                    </div>
                  </div>
                  
                  <p className="tool-description">{tool.description}</p>
                  
                  <div className="tool-status warning">
                    <span className="status-icon">{getStatusIcon(tool.status)}</span>
                    <span className="status-text">{tool.statusText}</span>
                  </div>
                  
                  <div className="tool-footer">
                    <span className="last-activity">Last: {tool.lastActivity}</span>
                    <span className="cta-arrow">→</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Good Tools */}
      {goodTools.length > 0 && (
        <div className="tools-section good-section">
          <div className="section-header">
            <h3>✅ Performing Well</h3>
            <span className="tool-count">{goodTools.length} tools</span>
          </div>
          <div className="tools-grid">
            {goodTools.map(tool => {
              const impact = getImpactBadge(tool.impact)
              return (
                <Link key={tool.id} href={tool.href} className="tool-card good">
                  <div className="tool-header">
                    <div className="tool-icon-title">
                      <span className="tool-icon">{tool.icon}</span>
                      <h4>{tool.title}</h4>
                    </div>
                    <div className="tool-badges">
                      {tool.automation && <span className="automation-badge">🤖 AUTO</span>}
                      <span className={`impact-badge ${impact.class}`}>{impact.text}</span>
                    </div>
                  </div>
                  
                  <p className="tool-description">{tool.description}</p>
                  
                  <div className="tool-status good">
                    <span className="status-icon">{getStatusIcon(tool.status)}</span>
                    <span className="status-text">{tool.statusText}</span>
                  </div>
                  
                  <div className="tool-footer">
                    <span className="last-activity">Last: {tool.lastActivity}</span>
                    <span className="cta-arrow">→</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <div className="automation-summary">
        <h3>🤖 Automation Overview</h3>
        <div className="automation-stats">
          <div className="auto-stat">
            <span className="stat-number">{automationTools.filter(t => t.automation).length}</span>
            <span className="stat-label">Automated Tools</span>
          </div>
          <div className="auto-stat">
            <span className="stat-number">15h</span>
            <span className="stat-label">Weekly Time Saved</span>
          </div>
          <div className="auto-stat">
            <span className="stat-number">{Math.round((automationTools.filter(t => t.automation).length / automationTools.length) * 100)}%</span>
            <span className="stat-label">Automation Coverage</span>
          </div>
        </div>
      </div>
    </div>
  )
}
