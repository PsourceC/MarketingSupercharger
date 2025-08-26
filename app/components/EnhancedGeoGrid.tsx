'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const CircleMarker = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })
const Tooltip = dynamic(() => import('react-leaflet').then(mod => mod.Tooltip), { ssr: false })

interface Location {
  id: string
  name: string
  lat: number
  lng: number
  overallScore: number
  keywordScores: { [keyword: string]: number }
  population: number
  searchVolume: number
  lastUpdated: string
  trends: {
    keyword: string
    change: number
    changeText: string
  }[]
}

interface Competitor {
  name: string
  score: number
  color: string
  locations: { lat: number, lng: number, score: number }[]
}

// Austin metro area locations with real coordinates and updated data
const locations: Location[] = [
  {
    id: 'austin-central',
    name: 'Central Austin',
    lat: 30.2672,
    lng: -97.7431,
    overallScore: 12,
    keywordScores: {
      'solar-panels-near-austin': 8,
      'best-solar-company': 15,
      'cheap-solar-near-me': 22,
      'top-rated-installers': 11,
      'affordable-solar': 6
    },
    population: 950000,
    searchVolume: 12400,
    lastUpdated: '2 hours ago',
    trends: [
      { keyword: 'solar panels near me', change: +2, changeText: 'Moved up 2 positions' },
      { keyword: 'austin solar installer', change: -1, changeText: 'Dropped 1 position' }
    ]
  },
  {
    id: 'georgetown',
    name: 'Georgetown',
    lat: 30.6332,
    lng: -97.6779,
    overallScore: 6,
    keywordScores: {
      'solar-panels-near-austin': 5,
      'best-solar-company': 8,
      'cheap-solar-near-me': 18,
      'top-rated-installers': 6,
      'affordable-solar': 4
    },
    population: 75000,
    searchVolume: 2100,
    lastUpdated: '1 hour ago',
    trends: [
      { keyword: 'georgetown solar', change: +1, changeText: 'Improved 1 position' }
    ]
  },
  {
    id: 'cedar-park',
    name: 'Cedar Park',
    lat: 30.5052,
    lng: -97.8203,
    overallScore: 9,
    keywordScores: {
      'solar-panels-near-austin': 6,
      'best-solar-company': 12,
      'cheap-solar-near-me': 15,
      'top-rated-installers': 9,
      'affordable-solar': 5
    },
    population: 77000,
    searchVolume: 1850,
    lastUpdated: '30 minutes ago',
    trends: [
      { keyword: 'cedar park solar', change: +3, changeText: 'Big improvement: +3 positions' }
    ]
  },
  {
    id: 'round-rock',
    name: 'Round Rock',
    lat: 30.5084,
    lng: -97.6789,
    overallScore: 4,
    keywordScores: {
      'solar-panels-near-austin': 4,
      'best-solar-company': 7,
      'cheap-solar-near-me': 12,
      'top-rated-installers': 5,
      'affordable-solar': 3
    },
    population: 133000,
    searchVolume: 3200,
    lastUpdated: '15 minutes ago',
    trends: [
      { keyword: 'round rock solar', change: 0, changeText: 'Holding steady' }
    ]
  },
  {
    id: 'pflugerville',
    name: 'Pflugerville',
    lat: 30.4394,
    lng: -97.6200,
    overallScore: 3,
    keywordScores: {
      'solar-panels-near-austin': 3,
      'best-solar-company': 6,
      'cheap-solar-near-me': 9,
      'top-rated-installers': 4,
      'affordable-solar': 2
    },
    population: 65000,
    searchVolume: 1920,
    lastUpdated: '5 minutes ago',
    trends: [
      { keyword: 'pflugerville solar', change: +1, changeText: 'Moving up!' }
    ]
  },
  {
    id: 'leander',
    name: 'Leander',
    lat: 30.5788,
    lng: -97.8531,
    overallScore: 11,
    keywordScores: {
      'solar-panels-near-austin': 7,
      'best-solar-company': 10,
      'cheap-solar-near-me': 20,
      'top-rated-installers': 8,
      'affordable-solar': 6
    },
    population: 67000,
    searchVolume: 1650,
    lastUpdated: '1 hour ago',
    trends: [
      { keyword: 'leander solar', change: -2, changeText: 'Needs attention: -2 positions' }
    ]
  },
  {
    id: 'hutto',
    name: 'Hutto',
    lat: 30.5427,
    lng: -97.5464,
    overallScore: 7,
    keywordScores: {
      'solar-panels-near-austin': 5,
      'best-solar-company': 9,
      'cheap-solar-near-me': 14,
      'top-rated-installers': 7,
      'affordable-solar': 4
    },
    population: 28000,
    searchVolume: 890,
    lastUpdated: '45 minutes ago',
    trends: [
      { keyword: 'hutto solar installation', change: +2, changeText: 'Great progress: +2' }
    ]
  }
]

const competitors: Competitor[] = [
  { 
    name: '512 Solar', 
    score: 92, 
    color: '#ef4444',
    locations: [
      { lat: 30.2672, lng: -97.7431, score: 1 },
      { lat: 30.6332, lng: -97.6779, score: 2 },
      { lat: 30.5052, lng: -97.8203, score: 1 }
    ]
  },
  { 
    name: 'ATX Solar', 
    score: 78, 
    color: '#f97316',
    locations: [
      { lat: 30.2672, lng: -97.7431, score: 3 },
      { lat: 30.5084, lng: -97.6789, score: 2 },
      { lat: 30.4394, lng: -97.6200, score: 4 }
    ]
  },
  { 
    name: 'Cool Solar', 
    score: 65, 
    color: '#6b7280',
    locations: [
      { lat: 30.5788, lng: -97.8531, score: 5 },
      { lat: 30.5427, lng: -97.5464, score: 6 }
    ]
  }
]

export default function EnhancedGeoGrid() {
  const [selectedKeyword, setSelectedKeyword] = useState<string>('all')
  const [showCompetitors, setShowCompetitors] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  useEffect(() => {
    setMapReady(true)
  }, [])

  const getScoreColor = (score: number) => {
    if (score <= 5) return '#10b981' // Green - excellent (top 5)
    if (score <= 10) return '#3b82f6' // Blue - very good (6-10)
    if (score <= 15) return '#f59e0b' // Yellow - good (11-15)
    if (score <= 25) return '#f97316' // Orange - fair (16-25)
    return '#ef4444' // Red - poor (25+)
  }

  const getScoreSize = (score: number) => {
    // Larger circles for better rankings (lower numbers)
    if (score <= 5) return 25 // Top 5 positions
    if (score <= 10) return 20 // Top 10 positions
    if (score <= 15) return 15 // Top 15 positions
    return 12 // Below 15
  }

  const getPositionRanking = (location: Location, keyword: string) => {
    if (keyword === 'all') return location.overallScore
    return location.keywordScores[keyword] || 20
  }

  const getPerformanceLabel = (score: number) => {
    if (score <= 3) return 'Excellent! 🏆'
    if (score <= 5) return 'Very Good 🎯'
    if (score <= 10) return 'Good ✅'
    if (score <= 15) return 'Fair ⚠️'
    return 'Needs Work 🚨'
  }

  const refreshData = () => {
    setLastRefresh(new Date())
    // In a real app, this would trigger an API call
    console.log('Refreshing map data...')
  }

  if (!mapReady) {
    return (
      <div className="map-loading">
        <div className="loading-content">
          <div className="spinner"></div>
          <p>Loading Austin area map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="enhanced-geo-grid">
      <div className="geo-controls-enhanced">
        <div className="control-group">
          <label className="control-label">🔍 Target Keyword:</label>
          <select 
            value={selectedKeyword}
            onChange={(e) => setSelectedKeyword(e.target.value)}
            className="enhanced-select"
          >
            <option value="all">📊 Overall Performance</option>
            <option value="solar-panels-near-austin">☀️ Solar panels near Austin</option>
            <option value="best-solar-company">🏆 Best solar company near me</option>
            <option value="cheap-solar-near-me">💰 Cheap solar near me</option>
            <option value="top-rated-installers">⭐ Top rated solar installers</option>
            <option value="affordable-solar">💵 Affordable solar near me</option>
          </select>
        </div>
        
        <div className="control-group">
          <label className="toggle-control">
            <input 
              type="checkbox" 
              checked={showCompetitors}
              onChange={(e) => setShowCompetitors(e.target.checked)}
            />
            <span className="toggle-text">🥊 Show Competitors</span>
          </label>
        </div>

        <div className="control-group">
          <button 
            onClick={refreshData}
            className="refresh-button"
            title="Get latest ranking data"
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>

      <div className="map-section">
        <div className="map-sidebar">
          <div className="performance-legend">
            <h4>🎯 Performance Guide</h4>
            <div className="legend-grid">
              <div className="legend-item excellent">
                <div className="legend-circle" style={{ backgroundColor: '#10b981' }}></div>
                <span>Top 5 Positions</span>
                <span className="legend-desc">Excellent! 🏆</span>
              </div>
              <div className="legend-item very-good">
                <div className="legend-circle" style={{ backgroundColor: '#3b82f6' }}></div>
                <span>Positions 6-10</span>
                <span className="legend-desc">Very Good 🎯</span>
              </div>
              <div className="legend-item good">
                <div className="legend-circle" style={{ backgroundColor: '#f59e0b' }}></div>
                <span>Positions 11-15</span>
                <span className="legend-desc">Good ✅</span>
              </div>
              <div className="legend-item fair">
                <div className="legend-circle" style={{ backgroundColor: '#f97316' }}></div>
                <span>Positions 16-25</span>
                <span className="legend-desc">Fair ⚠️</span>
              </div>
              <div className="legend-item poor">
                <div className="legend-circle" style={{ backgroundColor: '#ef4444' }}></div>
                <span>Position 25+</span>
                <span className="legend-desc">Needs Work 🚨</span>
              </div>
            </div>
          </div>

          {showCompetitors && (
            <div className="competitor-legend">
              <h4>🥊 Competitors</h4>
              <div className="competitor-list">
                {competitors.map(comp => (
                  <div key={comp.name} className="competitor-item">
                    <div 
                      className="competitor-marker" 
                      style={{ backgroundColor: comp.color }}
                    ></div>
                    <div className="competitor-info">
                      <span className="competitor-name">{comp.name}</span>
                      <span className="competitor-score">Avg: #{comp.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="map-stats">
            <h4>📊 Quick Stats</h4>
            <div className="stats-list">
              <div className="stat-item">
                <span className="stat-label">Best Area:</span>
                <span className="stat-value">Pflugerville (#3)</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Needs Focus:</span>
                <span className="stat-value">Central Austin (#12)</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Last Update:</span>
                <span className="stat-value">{lastRefresh.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="map-container-enhanced">
          <MapContainer
            center={[30.4518, -97.7431]}
            zoom={10}
            style={{ height: '500px', width: '100%' }}
            className="austin-map-leaflet"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Your business locations */}
            {locations.map(location => {
              const score = selectedKeyword === 'all' 
                ? location.overallScore 
                : getPositionRanking(location, selectedKeyword)
              
              const color = getScoreColor(score)
              const size = getScoreSize(score)
              
              return (
                <CircleMarker
                  key={location.id}
                  center={[location.lat, location.lng]}
                  radius={size}
                  fillColor={color}
                  color="white"
                  weight={3}
                  opacity={1}
                  fillOpacity={0.8}
                  eventHandlers={{
                    click: () => setSelectedLocation(location.id === selectedLocation ? null : location.id)
                  }}
                >
                  <Tooltip permanent={false} direction="top">
                    <div className="map-tooltip">
                      <strong>{location.name}</strong><br/>
                      Ranking: #{score}<br/>
                      {getPerformanceLabel(score)}
                    </div>
                  </Tooltip>
                  
                  <Popup>
                    <div className="location-popup">
                      <h3>{location.name}</h3>
                      <div className="popup-content">
                        <div className="popup-stat">
                          <span className="popup-label">Current Ranking:</span>
                          <span className={`popup-value rank-${score <= 5 ? 'excellent' : score <= 10 ? 'good' : 'poor'}`}>
                            #{score} {getPerformanceLabel(score)}
                          </span>
                        </div>
                        <div className="popup-stat">
                          <span className="popup-label">Monthly Searches:</span>
                          <span className="popup-value">{location.searchVolume.toLocaleString()}</span>
                        </div>
                        <div className="popup-stat">
                          <span className="popup-label">Population:</span>
                          <span className="popup-value">{location.population.toLocaleString()}</span>
                        </div>
                        <div className="popup-stat">
                          <span className="popup-label">Last Updated:</span>
                          <span className="popup-value">{location.lastUpdated}</span>
                        </div>
                        
                        {location.trends.length > 0 && (
                          <div className="popup-trends">
                            <h4>Recent Changes:</h4>
                            {location.trends.map((trend, idx) => (
                              <div key={idx} className={`trend-item ${trend.change > 0 ? 'positive' : trend.change < 0 ? 'negative' : 'neutral'}`}>
                                <span className="trend-icon">
                                  {trend.change > 0 ? '📈' : trend.change < 0 ? '📉' : '➡️'}
                                </span>
                                <span className="trend-text">{trend.changeText}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              )
            })}
            
            {/* Competitor locations */}
            {showCompetitors && competitors.map(competitor => 
              competitor.locations.map((loc, idx) => (
                <CircleMarker
                  key={`${competitor.name}-${idx}`}
                  center={[loc.lat + 0.01, loc.lng + 0.01]} // Slight offset to avoid overlap
                  radius={8}
                  fillColor={competitor.color}
                  color="white"
                  weight={2}
                  opacity={0.7}
                  fillOpacity={0.6}
                >
                  <Tooltip>
                    <div className="competitor-tooltip">
                      <strong>{competitor.name}</strong><br/>
                      Ranking: #{loc.score}
                    </div>
                  </Tooltip>
                </CircleMarker>
              ))
            )}
          </MapContainer>
        </div>
      </div>

      <div className="insights-enhanced">
        <h3>💡 Smart Insights</h3>
        <div className="insights-grid-enhanced">
          <div className="insight-card opportunity">
            <div className="insight-header">
              <span className="insight-icon">🎯</span>
              <h4>Best Opportunity</h4>
            </div>
            <p><strong>Pflugerville</strong> is your strongest area at position #3. Push for #1 to dominate this market!</p>
            <div className="insight-action">
              <button className="insight-btn">📱 Boost Pflugerville GMB</button>
            </div>
          </div>
          
          <div className="insight-card warning">
            <div className="insight-header">
              <span className="insight-icon">⚠️</span>
              <h4>Needs Attention</h4>
            </div>
            <p><strong>Central Austin</strong> at position #12 needs work. This is your biggest potential market with 12,400 monthly searches.</p>
            <div className="insight-action">
              <button className="insight-btn">🚀 Launch Austin Campaign</button>
            </div>
          </div>
          
          <div className="insight-card success">
            <div className="insight-header">
              <span className="insight-icon">✅</span>
              <h4>Success Story</h4>
            </div>
            <p><strong>Cedar Park</strong> jumped +3 positions this month! Whatever you're doing there, replicate it elsewhere.</p>
            <div className="insight-action">
              <button className="insight-btn">📊 Analyze Cedar Park</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
