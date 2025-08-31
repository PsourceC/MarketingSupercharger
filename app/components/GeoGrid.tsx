'use client'


import { useState, useEffect } from 'react'

interface Location {
  id: string
  name: string
  lat: number
  lng: number
  overallScore: number
  keywordScores: { [keyword: string]: number }
  population: number
  searchVolume: number
}

interface Competitor {
  name: string
  score: number
  color: string
}

// Austin metro area locations with realistic coordinates
const locations: Location[] = [
  {
    id: 'austin-central',
    name: 'Central Austin',
    lat: 30.2672,
    lng: -97.7431,
    overallScore: 65,
    keywordScores: {
      'solar-panels-near-austin': 8,
      'best-solar-company': 15,
      'cheap-solar-near-me': 22,
      'top-rated-installers': 11,
      'affordable-solar': 6
    },
    population: 950000,
    searchVolume: 12400
  },
  {
    id: 'georgetown',
    name: 'Georgetown',
    lat: 30.6332,
    lng: -97.6779,
    overallScore: 78,
    keywordScores: {
      'solar-panels-near-austin': 5,
      'best-solar-company': 8,
      'cheap-solar-near-me': 18,
      'top-rated-installers': 6,
      'affordable-solar': 4
    },
    population: 75000,
    searchVolume: 2100
  },
  {
    id: 'cedar-park',
    name: 'Cedar Park',
    lat: 30.5052,
    lng: -97.8203,
    overallScore: 72,
    keywordScores: {
      'solar-panels-near-austin': 6,
      'best-solar-company': 12,
      'cheap-solar-near-me': 15,
      'top-rated-installers': 9,
      'affordable-solar': 5
    },
    population: 77000,
    searchVolume: 1850
  },
  {
    id: 'round-rock',
    name: 'Round Rock',
    lat: 30.5084,
    lng: -97.6789,
    overallScore: 82,
    keywordScores: {
      'solar-panels-near-austin': 4,
      'best-solar-company': 7,
      'cheap-solar-near-me': 12,
      'top-rated-installers': 5,
      'affordable-solar': 3
    },
    population: 133000,
    searchVolume: 3200
  },
  {
    id: 'pflugerville',
    name: 'Pflugerville',
    lat: 30.4394,
    lng: -97.6200,
    overallScore: 88,
    keywordScores: {
      'solar-panels-near-austin': 3,
      'best-solar-company': 6,
      'cheap-solar-near-me': 9,
      'top-rated-installers': 4,
      'affordable-solar': 2
    },
    population: 65000,
    searchVolume: 1920
  },
  {
    id: 'leander',
    name: 'Leander',
    lat: 30.5788,
    lng: -97.8531,
    overallScore: 75,
    keywordScores: {
      'solar-panels-near-austin': 7,
      'best-solar-company': 10,
      'cheap-solar-near-me': 20,
      'top-rated-installers': 8,
      'affordable-solar': 6
    },
    population: 67000,
    searchVolume: 1650
  },
  {
    id: 'hutto',
    name: 'Hutto',
    lat: 30.5427,
    lng: -97.5464,
    overallScore: 85,
    keywordScores: {
      'solar-panels-near-austin': 5,
      'best-solar-company': 9,
      'cheap-solar-near-me': 14,
      'top-rated-installers': 7,
      'affordable-solar': 4
    },
    population: 28000,
    searchVolume: 890
  }
]

const competitors: Competitor[] = [
  { name: '512 Solar', score: 92, color: '#ef4444' },
  { name: 'ATX Solar', score: 78, color: '#f97316' },
  { name: 'Cool Solar', score: 65, color: '#6b7280' }
]

export default function GeoGrid() {
  const [selectedKeyword, setSelectedKeyword] = useState<string>('all')
  const [showCompetitors, setShowCompetitors] = useState(true)
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null)

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981' // Green - excellent
    if (score >= 60) return '#f59e0b' // Yellow - good
    if (score >= 40) return '#f97316' // Orange - fair
    return '#ef4444' // Red - poor
  }

  const getScoreSize = (score: number) => {
    const base = 12
    const multiplier = score / 100
    return Math.max(base + (multiplier * 20), 8)
  }

  const getPositionRanking = (location: Location, keyword: string) => {
    if (keyword === 'all') return location.overallScore
    return location.keywordScores[keyword] || 20
  }

  return (
    <div className="geo-grid-container">
      <div className="geo-controls-bar">
        <div className="keyword-selector">
          <label>Target Keyword:</label>
          <select 
            value={selectedKeyword}
            onChange={(e) => setSelectedKeyword(e.target.value)}
            className="keyword-select"
          >
            <option value="all">All Keywords Average</option>
            <option value="solar-panels-near-austin">Solar panels near Austin</option>
            <option value="best-solar-company">Best solar company near me</option>
            <option value="cheap-solar-near-me">Cheap solar near me</option>
            <option value="top-rated-installers">Top rated solar installers</option>
            <option value="affordable-solar">Affordable solar near me</option>
          </select>
        </div>
        
        <div className="view-toggles">
          <label className="toggle-label">
            <input 
              type="checkbox" 
              checked={showCompetitors}
              onChange={(e) => setShowCompetitors(e.target.checked)}
            />
            Show Competitors
          </label>
        </div>
      </div>

      <div className="map-container">
        <div className="map-legend">
          <h4>Performance Legend</h4>
          <div className="legend-items">
            <div className="legend-item">
              <div className="legend-dot excellent"></div>
              <span>Excellent (Top 5)</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot very-good"></div>
              <span>Very Good (6-10)</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot good"></div>
              <span>Good (11-15)</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot fair"></div>
              <span>Fair (16-25)</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot poor"></div>
              <span>Needs Work (25+)</span>
            </div>
          </div>
          
          {showCompetitors && (
            <div className="competitor-legend">
              <h5>Competitors</h5>
              {competitors.map(comp => (
                <div key={comp.name} className="legend-item">
                  <div 
                    className="legend-dot competitor" 
                    style={{ backgroundColor: comp.color }}
                  ></div>
                  <span>{comp.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="austin-map">
          <svg viewBox="0 0 400 300" className="map-svg">
            {/* Austin metro area background */}
            <rect x="0" y="0" width="400" height="300" fill="#f8fafc" stroke="#e2e8f0" />
            
            {/* Location markers */}
            {locations.map(location => {
              const score = selectedKeyword === 'all' 
                ? location.overallScore 
                : getPositionRanking(location, selectedKeyword)
              
              const x = ((location.lng + 98) * 400) // Normalize longitude to SVG coordinate
              const y = ((31 - location.lat) * 300) // Normalize latitude to SVG coordinate
              const size = getScoreSize(score)
              const color = getScoreColor(score)
              
              return (
                <g key={location.id}>
                  <circle
                    cx={x}
                    cy={y}
                    r={size}
                    fill={color}
                    stroke="white"
                    strokeWidth="2"
                    className={`location-marker ${hoveredLocation === location.id ? 'hovered' : ''}`}
                    onMouseEnter={() => setHoveredLocation(location.id)}
                    onMouseLeave={() => setHoveredLocation(null)}
                  />
                  
                  {/* Ranking number inside circle */}
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {selectedKeyword === 'all' ? score : location.keywordScores[selectedKeyword] || '20+'}
                  </text>
                  
                  {/* Location label */}
                  <text
                    x={x}
                    y={y + size + 15}
                    textAnchor="middle"
                    fill="#374151"
                    fontSize="11"
                    fontWeight="500"
                  >
                    {location.name}
                  </text>
                </g>
              )
            })}
            
            {/* Competitor positions (simplified) */}
            {showCompetitors && competitors.map((comp, index) => (
              <g key={comp.name}>
                <rect
                  x={20 + (index * 80)}
                  y={20}
                  width={12}
                  height={12}
                  fill={comp.color}
                  stroke="white"
                  strokeWidth="1"
                />
                <text
                  x={20 + (index * 80) + 6}
                  y={30}
                  textAnchor="middle"
                  fill="white"
                  fontSize="8"
                  fontWeight="bold"
                >
                  {comp.score}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Location Details Panel */}
      {hoveredLocation && (
        <div className="location-details">
          {(() => {
            const location = locations.find(l => l.id === hoveredLocation)
            if (!location) return null
            
            const currentScore = selectedKeyword === 'all' 
              ? location.overallScore 
              : location.keywordScores[selectedKeyword] || 20
            
            return (
              <div className="details-content">
                <h4>{location.name}</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="label">Current Ranking:</span>
                    <span className={`value rank-${currentScore <= 5 ? 'excellent' : currentScore <= 15 ? 'good' : 'poor'}`}>
                      #{currentScore}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Search Volume:</span>
                    <span className="value">{location.searchVolume.toLocaleString()}/mo</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Population:</span>
                    <span className="value">{location.population.toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Opportunity Score:</span>
                    <span className="value">{location.overallScore}%</span>
                  </div>
                </div>
                
                {selectedKeyword === 'all' && (
                  <div className="keyword-breakdown">
                    <h5>Keyword Rankings:</h5>
                    {Object.entries(location.keywordScores).map(([keyword, rank]) => (
                      <div key={keyword} className="keyword-rank">
                        <span className="keyword-name">
                          {keyword.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span className={`rank rank-${rank <= 5 ? 'excellent' : rank <= 15 ? 'good' : 'poor'}`}>
                          #{rank}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      )}

      <div className="geo-insights">
        <h3>📊 Geographic Insights</h3>
        <div className="insights-grid">
          <div className="insight-card opportunity">
            <h4>🎯 Best Opportunity</h4>
            <p><strong>Pflugerville</strong> - Currently ranking #2-4 across most keywords. Push for #1 positions.</p>
          </div>
          <div className="insight-card warning">
            <h4>⚠️ Needs Attention</h4>
            <p><strong>Central Austin</strong> - Struggling with "best solar company" at #15. High search volume area.</p>
          </div>
          <div className="insight-card success">
            <h4>✅ Strong Performance</h4>
            <p><strong>Round Rock</strong> - Consistently in top 10. Focus on maintaining leadership.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
