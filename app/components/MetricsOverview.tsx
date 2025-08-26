'use client'

import { useState, useEffect } from 'react'

interface Metric {
  id: string
  title: string
  value: string | number
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: string
  target?: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  explanation: string
  whyItMatters: string
}

const metrics: Metric[] = [
  {
    id: 'avg-position',
    title: 'Search Ranking',
    value: 12.4,
    change: 'Improved +2.3 spots',
    changeType: 'positive',
    icon: '🎯',
    target: 'Goal: Top 8',
    priority: 'high'
  },
  {
    id: 'visibility-score',
    title: 'How Often You Appear',
    value: '34%',
    change: 'Up +8% this month',
    changeType: 'positive',
    icon: '👁️',
    target: 'Goal: 60%+',
    priority: 'medium'
  },
  {
    id: 'gmb-reviews',
    title: 'Google Reviews',
    value: 31,
    change: 'Need 119 more to compete',
    changeType: 'negative',
    icon: '⭐',
    target: 'Goal: 150+',
    priority: 'critical'
  },
  {
    id: 'citations',
    title: 'Directory Listings',
    value: '2/100',
    change: 'Needs urgent attention',
    changeType: 'negative',
    icon: '🔗',
    target: 'Goal: 50+',
    priority: 'critical'
  },
  {
    id: 'backlinks',
    title: 'Website References',
    value: 389,
    change: '+15 new this month',
    changeType: 'positive',
    icon: '🌐',
    target: 'Doing great!',
    priority: 'low'
  },
  {
    id: 'gmb-photos',
    title: 'Google Business Photos',
    value: 94,
    change: 'Add 56 more photos',
    changeType: 'negative',
    icon: '📸',
    target: 'Goal: 150+',
    priority: 'medium'
  }
]

export default function MetricsOverview() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#ef4444'
      case 'high': return '#f97316'
      case 'medium': return '#f59e0b'
      default: return '#10b981'
    }
  }

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'positive': return '📈'
      case 'negative': return '����'
      default: return '➡️'
    }
  }

  return (
    <div className="metrics-overview">
      <div className="metrics-header">
        <h3>📊 Key Performance Metrics</h3>
        <div className="period-selector">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="period-select"
          >
            <option value="7d">7 days</option>
            <option value="30d">30 days</option>
            <option value="90d">90 days</option>
          </select>
        </div>
      </div>

      <div className="metrics-grid">
        {metrics.map(metric => (
          <div 
            key={metric.id} 
            className={`metric-card priority-${metric.priority}`}
            style={{ borderLeftColor: getPriorityColor(metric.priority) }}
          >
            <div className="metric-header">
              <span className="metric-icon">{metric.icon}</span>
              <span className="metric-title">{metric.title}</span>
            </div>
            
            <div className="metric-value">
              {metric.value}
            </div>
            
            <div className={`metric-change ${metric.changeType}`}>
              <span className="change-icon">{getChangeIcon(metric.changeType)}</span>
              <span className="change-text">{metric.change}</span>
            </div>
            
            {metric.target && (
              <div className="metric-target">
                {metric.target}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="competitor-comparison">
        <h4>🥊 vs Top Competitor (512 Solar)</h4>
        <div className="comparison-bars">
          <div className="comparison-item">
            <span className="comp-label">Reviews</span>
            <div className="comp-bar">
              <div className="comp-progress yours" style={{ width: '6.8%' }}></div>
              <div className="comp-progress theirs" style={{ width: '100%' }}></div>
            </div>
            <span className="comp-values">31 vs 453</span>
          </div>
          
          <div className="comparison-item">
            <span className="comp-label">Photos</span>
            <div className="comp-bar">
              <div className="comp-progress yours" style={{ width: '41.4%' }}></div>
              <div className="comp-progress theirs" style={{ width: '100%' }}></div>
            </div>
            <span className="comp-values">94 vs 227</span>
          </div>
          
          <div className="comparison-item">
            <span className="comp-label">Backlinks</span>
            <div className="comp-bar">
              <div className="comp-progress yours" style={{ width: '100%' }}></div>
              <div className="comp-progress theirs" style={{ width: '47.8%' }}></div>
            </div>
            <span className="comp-values">389 vs 186</span>
          </div>
        </div>
      </div>

      <div className="trend-summary">
        <h4>📈 30-Day Trend Summary</h4>
        <div className="trend-items">
          <div className="trend-item positive">
            <span>📍 Keyword positions improved in 4/7 locations</span>
          </div>
          <div className="trend-item positive">
            <span>📊 Search visibility up 8% month-over-month</span>
          </div>
          <div className="trend-item negative">
            <span>📱 GMB posting frequency decreased</span>
          </div>
          <div className="trend-item neutral">
            <span>⭐ Review growth slower than competitors</span>
          </div>
        </div>
      </div>
    </div>
  )
}
