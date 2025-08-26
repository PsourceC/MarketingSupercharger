'use client'

import { useState } from 'react'
import Link from 'next/link'

interface KeywordData {
  keyword: string
  position: number
  previousPosition: number
  searchVolume: number
  difficulty: string
  trend: 'up' | 'down' | 'stable'
  url: string
}

interface CompetitorData {
  name: string
  website: string
  avgPosition: number
  visibilityScore: number
  backlinks: number
  reviews: number
  photos: number
}

const keywordData: KeywordData[] = [
  {
    keyword: 'Solar panels near Austin',
    position: 8,
    previousPosition: 12,
    searchVolume: 2400,
    difficulty: 'High',
    trend: 'up',
    url: '/solar-installation'
  },
  {
    keyword: 'Best solar company near me',
    position: 15,
    previousPosition: 18,
    searchVolume: 1800,
    difficulty: 'High', 
    trend: 'up',
    url: '/'
  },
  {
    keyword: 'Cheap solar near me',
    position: 22,
    previousPosition: 19,
    searchVolume: 1200,
    difficulty: 'Medium',
    trend: 'down',
    url: '/affordable-solar'
  },
  {
    keyword: 'Top rated solar installers Austin',
    position: 11,
    previousPosition: 14,
    searchVolume: 950,
    difficulty: 'Medium',
    trend: 'up',
    url: '/reviews'
  },
  {
    keyword: 'Affordable solar near me',
    position: 6,
    previousPosition: 8,
    searchVolume: 1600,
    difficulty: 'Medium',
    trend: 'up',
    url: '/financing'
  }
]

const competitorData: CompetitorData[] = [
  {
    name: '512 Solar',
    website: '512solar.com',
    avgPosition: 4.2,
    visibilityScore: 89,
    backlinks: 186,
    reviews: 453,
    photos: 227
  },
  {
    name: 'ATX Solar', 
    website: 'goatxsolar.com',
    avgPosition: 6.8,
    visibilityScore: 72,
    backlinks: 215,
    reviews: 186,
    photos: 178
  },
  {
    name: 'Cool Solar',
    website: 'coolsolarpower.co',
    avgPosition: 8.1,
    visibilityScore: 58,
    backlinks: 445,
    reviews: 69,
    photos: 40
  }
]

export default function SEOTracking() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d')
  const [showDetails, setShowDetails] = useState<string | null>(null)

  const getPositionColor = (position: number) => {
    if (position <= 3) return 'excellent'
    if (position <= 10) return 'good'
    if (position <= 20) return 'fair'
    return 'poor'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈'
      case 'down': return '📉'
      default: return '➡️'
    }
  }

  return (
    <div className="seo-tracking">
      <header className="page-header">
        <Link href="/" className="back-button">← Back to Dashboard</Link>
        <h1>📊 SEO Tracking & Analytics</h1>
        <p>Monitor keyword rankings, competitor performance, and search visibility</p>
      </header>

      <div className="tracking-overview">
        <div className="overview-card">
          <h3>🎯 Average Position</h3>
          <div className="big-metric">12.4</div>
          <div className="metric-change positive">↗ +2.3 vs last month</div>
        </div>
        <div className="overview-card">
          <h3>👁️ Search Visibility</h3>
          <div className="big-metric">34%</div>
          <div className="metric-change positive">↗ +8% vs last month</div>
        </div>
        <div className="overview-card">
          <h3>🔗 Total Backlinks</h3>
          <div className="big-metric">389</div>
          <div className="metric-change positive">↗ +15 new links</div>
        </div>
        <div className="overview-card">
          <h3>🏆 Competitor Gap</h3>
          <div className="big-metric">-7.8</div>
          <div className="metric-change negative">↘ Behind top competitor</div>
        </div>
      </div>

      <div className="keyword-tracking">
        <div className="section-header">
          <h2>🔍 Keyword Performance</h2>
          <div className="timeframe-selector">
            <button 
              className={selectedTimeframe === '7d' ? 'active' : ''}
              onClick={() => setSelectedTimeframe('7d')}
            >
              7 days
            </button>
            <button 
              className={selectedTimeframe === '30d' ? 'active' : ''}
              onClick={() => setSelectedTimeframe('30d')}
            >
              30 days
            </button>
            <button 
              className={selectedTimeframe === '90d' ? 'active' : ''}
              onClick={() => setSelectedTimeframe('90d')}
            >
              90 days
            </button>
          </div>
        </div>
        
        <div className="keywords-table">
          <div className="table-header">
            <div>Keyword</div>
            <div>Position</div>
            <div>Change</div>
            <div>Volume</div>
            <div>Difficulty</div>
            <div>Trend</div>
            <div>Actions</div>
          </div>
          
          {keywordData.map((keyword, index) => (
            <div key={index} className="table-row">
              <div className="keyword-cell">
                <strong>{keyword.keyword}</strong>
                <div className="keyword-url">{keyword.url}</div>
              </div>
              <div className={`position-cell ${getPositionColor(keyword.position)}`}>
                #{keyword.position}
              </div>
              <div className="change-cell">
                {keyword.position < keyword.previousPosition ? (
                  <span className="positive">+{keyword.previousPosition - keyword.position}</span>
                ) : keyword.position > keyword.previousPosition ? (
                  <span className="negative">-{keyword.position - keyword.previousPosition}</span>
                ) : (
                  <span className="neutral">0</span>
                )}
              </div>
              <div className="volume-cell">{keyword.searchVolume.toLocaleString()}</div>
              <div className={`difficulty-cell ${keyword.difficulty.toLowerCase()}`}>
                {keyword.difficulty}
              </div>
              <div className="trend-cell">
                {getTrendIcon(keyword.trend)}
              </div>
              <div className="actions-cell">
                <button 
                  onClick={() => setShowDetails(keyword.keyword)}
                  className="action-btn-small"
                >
                  📈 Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="competitor-analysis">
        <h2>🥊 Competitor Analysis</h2>
        <div className="competitors-grid">
          {competitorData.map((competitor, index) => (
            <div key={index} className="competitor-card">
              <div className="competitor-header">
                <h3>{competitor.name}</h3>
                <a href={`https://${competitor.website}`} target="_blank" rel="noopener noreferrer">
                  {competitor.website}
                </a>
              </div>
              
              <div className="competitor-metrics">
                <div className="metric">
                  <span className="label">Avg Position:</span>
                  <span className="value excellent">#{competitor.avgPosition}</span>
                </div>
                <div className="metric">
                  <span className="label">Visibility:</span>
                  <span className="value">{competitor.visibilityScore}%</span>
                </div>
                <div className="metric">
                  <span className="label">Backlinks:</span>
                  <span className="value">{competitor.backlinks}</span>
                </div>
                <div className="metric">
                  <span className="label">Reviews:</span>
                  <span className="value warning">{competitor.reviews}</span>
                </div>
                <div className="metric">
                  <span className="label">Photos:</span>
                  <span className="value">{competitor.photos}</span>
                </div>
              </div>
              
              <div className="competitive-gaps">
                <h4>📊 Gaps vs Astrawatt:</h4>
                <ul>
                  <li className="gap negative">Reviews: -{competitor.reviews - 31} behind</li>
                  <li className="gap negative">Photos: -{competitor.photos - 94} behind</li>
                  <li className="gap positive">Backlinks: +{389 - competitor.backlinks} ahead</li>
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="seo-recommendations">
        <h2>💡 SEO Recommendations</h2>
        <div className="recommendations-grid">
          <div className="recommendation-card urgent">
            <h3>🚨 Critical: Page Speed</h3>
            <p>Mobile: 42, Desktop: 66</p>
            <p><strong>Action:</strong> Optimize images and reduce JS bundle size</p>
            <button className="action-btn">🔧 Fix Issues</button>
          </div>
          
          <div className="recommendation-card important">
            <h3>📋 Missing Schema Markup</h3>
            <p>No LocalBusiness schema detected</p>
            <p><strong>Action:</strong> Add structured data for better SERP features</p>
            <button className="action-btn">⚡ Add Schema</button>
          </div>
          
          <div className="recommendation-card">
            <h3>📝 Content Gaps</h3>
            <p>Missing blog posts compared to competitors</p>
            <p><strong>Action:</strong> Create 2-3 posts monthly on solar topics</p>
            <button className="action-btn">✍️ Create Content</button>
          </div>
          
          <div className="recommendation-card">
            <h3>🔗 Link Building</h3>
            <p>Good backlink profile but could improve quality</p>
            <p><strong>Action:</strong> Target local directory listings and partnerships</p>
            <button className="action-btn">🎯 Build Links</button>
          </div>
        </div>
      </div>

      <div className="tracking-alerts">
        <h2>🚨 Ranking Alerts</h2>
        <div className="alerts-list">
          <div className="alert-item positive">
            <span className="alert-icon">📈</span>
            <div>
              <strong>"Affordable solar near me"</strong> moved up 2 positions to #6
              <div className="alert-time">2 hours ago</div>
            </div>
          </div>
          <div className="alert-item negative">
            <span className="alert-icon">📉</span>
            <div>
              <strong>"Cheap solar near me"</strong> dropped 3 positions to #22
              <div className="alert-time">1 day ago</div>
            </div>
          </div>
          <div className="alert-item positive">
            <span className="alert-icon">📈</span>
            <div>
              <strong>"Solar panels near Austin"</strong> moved up 4 positions to #8
              <div className="alert-time">3 days ago</div>
            </div>
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="keyword-details-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>📊 Keyword Details: {showDetails}</h3>
              <button onClick={() => setShowDetails(null)} className="close-btn">✕</button>
            </div>
            
            <div className="keyword-details">
              <div className="details-section">
                <h4>📈 Position History</h4>
                <div className="position-chart">
                  <div className="chart-placeholder">
                    [Position tracking chart would go here]
                  </div>
                </div>
              </div>
              
              <div className="details-section">
                <h4>🏆 Top Competing Pages</h4>
                <div className="competing-pages">
                  <div className="competing-page">
                    <strong>#1 512solar.com/solar-panels-austin</strong>
                    <p>Title: "Austin Solar Panel Installation | 512 Solar"</p>
                  </div>
                  <div className="competing-page">
                    <strong>#2 goatxsolar.com/austin</strong>
                    <p>Title: "Solar Installation Austin TX | ATX Solar"</p>
                  </div>
                  <div className="competing-page">
                    <strong>#3 coolsolarpower.co/austin-solar</strong>
                    <p>Title: "Best Solar Panels Austin Texas | Cool Solar"</p>
                  </div>
                </div>
              </div>
              
              <div className="details-section">
                <h4>💡 Optimization Suggestions</h4>
                <ul>
                  <li>✅ Add "Austin" to title tag for better local relevance</li>
                  <li>📝 Include customer testimonials from Austin area</li>
                  <li>🗺️ Add local landmark references in content</li>
                  <li>📸 Include photos of local Austin installations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
