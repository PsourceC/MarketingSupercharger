'use client'

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { suggestCities } from '../lib/city-suggestions'
import { getCityCoords } from '../lib/geo'

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
  locations: {
    lat: number,
    lng: number,
    score: number,
    areaName: string,
    marketShare: number,
    recentTrend: 'up' | 'down' | 'stable'
  }[]
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
      { lat: 30.2672, lng: -97.7431, score: 1, areaName: 'Central Austin', marketShare: 35, recentTrend: 'stable' },
      { lat: 30.6332, lng: -97.6779, score: 2, areaName: 'Georgetown', marketShare: 28, recentTrend: 'up' },
      { lat: 30.5052, lng: -97.8203, score: 1, areaName: 'Cedar Park', marketShare: 32, recentTrend: 'down' }
    ]
  },
  {
    name: 'ATX Solar',
    score: 78,
    color: '#f97316',
    locations: [
      { lat: 30.2672, lng: -97.7431, score: 3, areaName: 'Central Austin', marketShare: 22, recentTrend: 'up' },
      { lat: 30.5084, lng: -97.6789, score: 2, areaName: 'Round Rock', marketShare: 25, recentTrend: 'stable' },
      { lat: 30.4394, lng: -97.6200, score: 4, areaName: 'Pflugerville', marketShare: 18, recentTrend: 'down' }
    ]
  },
  {
    name: 'Cool Solar',
    score: 65,
    color: '#6b7280',
    locations: [
      { lat: 30.5788, lng: -97.8531, score: 5, areaName: 'Leander', marketShare: 15, recentTrend: 'stable' },
      { lat: 30.5427, lng: -97.5464, score: 6, areaName: 'Hutto', marketShare: 12, recentTrend: 'up' }
    ]
  }
]

export default function EnhancedGeoGrid() {
  const router = useRouter()
  const [selectedKeyword, setSelectedKeyword] = useState<string>('all')
  const [showCompetitors, setShowCompetitors] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [selectedAreaName, setSelectedAreaName] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [competitorComparisonMode, setCompetitorComparisonMode] = useState(false)
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>('all')
  const [topByArea, setTopByArea] = useState<Record<string, { keyword: string; avgPosition: number; clicks: number; impressions: number; ctr: number }[]>>({})
  const [availableKeywords, setAvailableKeywords] = useState<string[]>([
    'solar-panels-near-austin',
    'best-solar-company',
    'cheap-solar-near-me',
    'top-rated-installers',
    'affordable-solar'
  ])
  const [currentLocations, setCurrentLocations] = useState<Location[]>(locations)
  const [dbLocations, setDbLocations] = useState<Array<{ name: string; lat: number; lng: number }>>([])
  const [dynamicCompetitors, setDynamicCompetitors] = useState<Competitor[]>([])
  const [competitorAnalysesRaw, setCompetitorAnalysesRaw] = useState<any[]>([])
  const [newArea, setNewArea] = useState<string>('')
  const [areaSuggestions, setAreaSuggestions] = useState<string[]>([])
  const [smartInsights, setSmartInsights] = useState<null | {
    area: string,
    generatedAt: string,
    keywordsAnalyzed: number,
    opportunities: Array<{ keyword: string; volume: number; ourPosition: number; leader: string | null; leaderPosition: number; gap: number; potentialClicks: number }>,
    quickWins: Array<{ keyword: string; volume: number; ourPosition: number; leader: string | null; leaderPosition: number; gap: number; potentialClicks: number }>,
    threats: Array<{ keyword: string; volume: number; ourPosition: number; leader: string | null; leaderPosition: number; gap: number; potentialClicks: number }>,
    recommendedKeywords: Array<{ keyword: string; estimatedVolume: number; competitorCount: number; opportunity: number }>,
    recommendations: Array<{ area: string; keyword: string; suggestions: any[] }>
  }>(null)

  useEffect(() => {
    setMapReady(true)
    // preload top keywords by area
    fetch('/api/rankings/by-area').then(r => r.json()).then(data => {
      if (data?.areas) {
        setTopByArea(data.areas)
        const all = new Set<string>()
        Object.values(data.areas as Record<string, any[]>).forEach(list => {
          (list as any[]).forEach(k => all.add(k.keyword))
        })
        if (all.size > 0) setAvailableKeywords(Array.from(all))
      }
    }).catch(() => {})

    // Load DB locations to map area names to coordinates and render bubbles
    fetch('/api/locations').then(r => r.json()).then((locs: any[]) => {
      if (Array.isArray(locs) && locs.length > 0) {
        setDbLocations(locs.map(l => ({ name: l.name, lat: Number(l.lat), lng: Number(l.lng) })))
        if (!selectedAreaName && locs.length) {
          setSelectedAreaName(String(locs[0].name))
        }
        const mapped: Location[] = locs.map((l: any) => ({
          id: String(l.id || l.name),
          name: String(l.name),
          lat: Number(l.lat),
          lng: Number(l.lng),
          overallScore: Number(l.overallScore || 0),
          keywordScores: (l.keywordScores || {}),
          population: Number(l.population || 0),
          searchVolume: Number(l.searchVolume || 0),
          lastUpdated: String(l.lastUpdated || '—'),
          trends: Array.isArray(l.trends) ? l.trends : []
        }))
        setCurrentLocations(mapped)
      }
    }).catch(() => {})

    // Load dynamic competitors discovered/tracked by backend
    fetch('/api/competitor-tracking').then(r => r.json()).then(data => {
      try {
        if (!data || !Array.isArray(data.competitors)) return
        setCompetitorAnalysesRaw(data.competitors)
        const palette = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#22c55e', '#eab308']
        const byAreaCoords = (areaName: string) => {
          const m = dbLocations.find(d => d.name === areaName)
          if (m) return { lat: m.lat, lng: m.lng }
          return { lat: 30.2672, lng: -97.7431 }
        }
        const comps: Competitor[] = (data.competitors as any[]).map((a: any, idx: number) => {
          const color = palette[idx % palette.length]
          const avg = Math.round(Number(a?.averagePosition || 0)) || 50
          const groups: Record<string, { positions: number[]; traffic: number }> = {}
          for (const r of (a?.rankings || [])) {
            const loc = String(r.location || 'Unknown')
            const pos = Number(r.position || 0)
            if (!groups[loc]) groups[loc] = { positions: [], traffic: 0 }
            if (pos > 0) groups[loc].positions.push(pos)
            groups[loc].traffic += Number(r.estimatedTraffic || 0)
          }
          const locationsList = Object.keys(groups).map(areaName => {
            const coords = byAreaCoords(areaName)
            const positions = groups[areaName].positions
            const score = positions.length ? Math.round(positions.reduce((s, p) => s + p, 0) / positions.length) : avg
            const marketShare = Math.max(5, Math.min(40, Math.round(groups[areaName].traffic / 100)))
            return { lat: coords.lat, lng: coords.lng, score, areaName, marketShare, recentTrend: 'stable' as const }
          })
          const compName = a?.competitor?.name || a?.competitor?.domain || 'Competitor'
          return { name: compName, score: avg, color, locations: locationsList }
        })
        if (comps.length) setDynamicCompetitors(comps)
      } catch {}
    }).catch(() => {})
  }, [])

  // Load smart insights scoped to selected area (or overall first area)
  useEffect(() => {
    const areaName = selectedLocation
      ? currentLocations.find(l => l.id === selectedLocation)?.name
      : currentLocations[0]?.name
    if (!areaName) return
    let cancelled = false
    fetch(`/api/insights/smart?area=${encodeURIComponent(areaName)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (cancelled) return
        if (data && data.area) setSmartInsights(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [selectedLocation, currentLocations, selectedKeyword])

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
    const raw = keyword === 'all' ? Number(location.overallScore || 0) : Number(location.keywordScores[keyword] || 0)
    return raw > 0 ? raw : 20
  }

  const getPerformanceLabel = (score: number) => {
    if (score <= 3) return 'Excellent! 🏆'
    if (score <= 5) return 'Very Good 🎯'
    if (score <= 10) return 'Good ✅'
    if (score <= 15) return 'Fair ⚠️'
    return 'Needs Work 🚨'
  }

  const getCompetitiveGap = (yourScore: number, competitorScore: number) => {
    const gap = yourScore - competitorScore
    if (gap <= 0) return { status: 'winning', text: `Leading by ${Math.abs(gap)} positions`, color: '#10b981' }
    if (gap <= 3) return { status: 'close', text: `Behind by ${gap} positions`, color: '#f59e0b' }
    return { status: 'behind', text: `Behind by ${gap} positions`, color: '#ef4444' }
  }

  const getAreaCompetitors = (areaName: string) => {
    // Prefer raw analyses to compute per-keyword positions; fallback to pre-aggregated
    if (competitorAnalysesRaw.length) {
      const palette = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#22c55e', '#eab308']
      return competitorAnalysesRaw.map((a: any, idx: number) => {
        const color = palette[idx % palette.length]
        const ranks = (a.rankings || []).filter((r: any) => String(r.location) === areaName)
        const filtered = selectedKeyword === 'all' ? ranks : ranks.filter((r: any) => String(r.keyword) === selectedKeyword)
        const positions = filtered.map((r: any) => Number(r.position || 0)).filter((p: number) => p > 0)
        const score = positions.length ? Math.round(positions.reduce((s: number, p: number) => s + p, 0) / positions.length) : (Math.round(Number(a.averagePosition || 50)) || 50)
        const traffic = filtered.reduce((s: number, r: any) => s + Number(r.estimatedTraffic || 0), 0)
        const marketShare = Math.max(5, Math.min(40, Math.round(traffic / 100)))
        return { name: a.competitor?.name || a.competitor?.domain || 'Competitor', color, location: { lat: 0, lng: 0, score, areaName, marketShare, recentTrend: 'stable' as const } }
      }).filter(Boolean)
    }
    const list = (dynamicCompetitors.length ? dynamicCompetitors : competitors)
    return list.map(comp => {
      const location = comp.locations.find(loc => loc.areaName === areaName)
      return location ? { ...comp, location } : null
    }).filter(Boolean)
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch(trend) {
      case 'up': return '📈'
      case 'down': return '📉'
      default: return '➡️'
    }
  }

  const refreshData = async () => {
    setLastRefresh(new Date())
    try {
      // Fire-and-forget competitor schedule to avoid blocking UI/network instrumentation
      fetch('/api/competitor-tracking/schedule', { method: 'POST' }).catch(() => null)

      // Short, resilient refresh request with timeout
      const controller = new AbortController()
      const t = setTimeout(() => controller.abort(), 10000)
      try {
        await fetch('/api/refresh', { method: 'POST', signal: controller.signal })
      } finally {
        clearTimeout(t)
      }

      window.dispatchEvent(new CustomEvent('dataRefresh'))
      console.log('Data refresh triggered')
    } catch (error) {
      console.warn('Non-blocking refresh error:', (error as any)?.message || error)
    }
  }

  async function addAreaByName(areaNameInput: string) {
    const raw = String(areaNameInput || '').trim()
    if (!raw) return
    const canonical = /,\s*[A-Za-z]{2}$/.test(raw) ? raw : `${raw}, TX`
    const coords = getCityCoords(canonical)
    if (!coords) {
      const sug = suggestCities(raw)
      setAreaSuggestions(sug)
      return
    }
    try {
      const cfg = await fetch('/api/business-config').then(r => r.json())
      const serviceAreas: string[] = Array.isArray(cfg.serviceAreas) ? cfg.serviceAreas : []
      if (serviceAreas.includes(canonical)) return
      const payload = {
        businessName: cfg.businessName || '',
        websiteUrl: cfg.websiteUrl || '',
        serviceAreas: [...serviceAreas, canonical],
        targetKeywords: cfg.targetKeywords || { global: [], areas: {}, competitors: {} }
      }
      await fetch('/api/business-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      // Bootstrap initial rankings for this area so the map has real data
      await fetch('/api/keywords/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ area: canonical, limit: 12 })
      }).catch(() => null)

      fetch('/api/competitor-tracking/schedule', { method: 'POST' }).catch(() => null)
      const locs: any[] = await fetch('/api/locations').then(r => r.json())
      const mapped: Location[] = locs.map((l: any) => ({
        id: String(l.id || l.name),
        name: String(l.name),
        lat: Number(l.lat),
        lng: Number(l.lng),
        overallScore: Number(l.overallScore || 0),
        keywordScores: (l.keywordScores || {}),
        population: Number(l.population || 0),
        searchVolume: Number(l.searchVolume || 0),
        lastUpdated: String(l.lastUpdated || '—'),
        trends: Array.isArray(l.trends) ? l.trends : []
      }))
      setCurrentLocations(mapped)
      setNewArea('')
      setAreaSuggestions([])
    } catch (e) {
      console.error('Failed to add area')
    }
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

  const viewLocations: Location[] = selectedLocation ? (currentLocations.filter(l => l.id === selectedLocation)) : currentLocations

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
            {availableKeywords.map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
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

        {showCompetitors && (
          <div className="control-group">
            <label className="control-label">🎯 Compare With:</label>
            <select
              value={selectedCompetitor}
              onChange={(e) => setSelectedCompetitor(e.target.value)}
              className="enhanced-select competitor-select"
            >
              <option value="all">All Competitors</option>
              {(dynamicCompetitors.length ? dynamicCompetitors : competitors).map(comp => (
                <option key={comp.name} value={comp.name}>{comp.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="control-group">
          <label className="toggle-control">
            <input
              type="checkbox"
              checked={competitorComparisonMode}
              onChange={(e) => setCompetitorComparisonMode(e.target.checked)}
            />
            <span className="toggle-text">📊 Comparison Mode</span>
          </label>
        </div>

        <div className="control-group">
          <label className="control-label">📍 Insights Area:</label>
          <select
            value={selectedAreaName || ''}
            onChange={(e) => setSelectedAreaName(e.target.value || null)}
            className="enhanced-select"
          >
            {currentLocations.map(l => (
              <option key={l.id} value={l.name}>{l.name}</option>
            ))}
          </select>
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

        <div className="control-group">
          <label className="control-label">➕ Add Area:</label>
          <div className="add-area-inline">
            <input
              className="enhanced-select"
              placeholder="e.g., Lakeway, TX"
              value={newArea}
              onChange={(e) => {
                const v = e.target.value
                setNewArea(v)
                setAreaSuggestions(v.trim() ? suggestCities(v) : [])
              }}
              list="area-suggestions"
            />
            <button
              className="refresh-button"
              onClick={() => addAreaByName(newArea)}
              title="Add area and refresh data"
            >
              ➕ Add
            </button>
            <datalist id="area-suggestions">
              {areaSuggestions.map(s => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
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
                {(() => {
                  const areaName = selectedAreaName || currentLocations[0]?.name
                  const list: any[] = areaName ? (getAreaCompetitors(areaName) as any[]) : []
                  return list.map((comp: any) => (
                    <div key={comp.name} className="competitor-item">
                      <div className="competitor-marker" style={{ backgroundColor: comp.color }}></div>
                      <div className="competitor-info">
                        <span className="competitor-name">{comp.name}</span>
                        <span className="competitor-score">#{comp.location.score} in {areaName}</span>
                      </div>
                    </div>
                  ))
                })()}
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
                <span className="stat-value">{lastRefresh ? lastRefresh.toLocaleTimeString() : '—'}</span>
              </div>
            </div>
          </div>

          {selectedLocation && (
            <div className="area-top-keywords">
              <h4>🏆 Top Keywords — {currentLocations.find(l => l.id === selectedLocation)?.name}</h4>
              <div className="top-list">
                {(topByArea[currentLocations.find(l => l.id === selectedLocation)?.name || ''] || []).map(k => (
                  <div key={k.keyword} className="top-row">
                    <div className="kw">{k.keyword}</div>
                    <div className="pos">#{Math.round(k.avgPosition || 0)}</div>
                    <div className="clicks">👆 {k.clicks}</div>
                    <div className="ctr">📊 {k.ctr}%</div>
                  </div>
                ))}
              </div>
              <button
                className="insight-btn"
                onClick={async () => {
                  try {
                    const areaName = currentLocations.find(l => l.id === selectedLocation)?.name
                    if (!areaName) return
                    const top = (topByArea[areaName] || []).slice(0, 5).map(k => k.keyword)
                    const cfg = await fetch('/api/business-config').then(r => r.json())
                    const domain = new URL(cfg.websiteUrl || 'https://example.com').hostname.replace('www.','')
                    await fetch('/api/auto-ranking', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ keywords: top, locations: [areaName], domain })
                    })
                    alert('Area update started for top keywords')
                  } catch (e) {
                    alert('Failed to run area update')
                  }
                }}
              >
                🚀 Run Area Update
              </button>
              <p className="hint">Uses Bright Data (or simulation) to scrape and update rankings for these keywords.</p>
            </div>
          )}
        </div>

        <div className="map-container-enhanced">
          <MapContainer
            center={currentLocations.length > 0 ? [currentLocations[0].lat, currentLocations[0].lng] : [30.4518, -97.7431]}
            zoom={10}
            style={{ height: '500px', width: '100%' }}
            className="austin-map-leaflet"
>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Your business locations */}
            {currentLocations.map(location => {
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
                    click: () => {
                      const next = location.id === selectedLocation ? null : location.id
                      setSelectedLocation(next)
                      setSelectedAreaName(location.name)
                    }
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
                          <span className="popup-label">Your Ranking:</span>
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

                        {showCompetitors && (
                          <div className="competitor-analysis">
                            <h4>�� Competitive Analysis</h4>
                            {getAreaCompetitors(location.name).map((comp: any) => {
                              const gap = getCompetitiveGap(score, comp.location.score)
                              return (
                                <div key={comp.name} className="competitor-comparison">
                                  <div className="competitor-header">
                                    <span
                                      className="competitor-dot"
                                      style={{ backgroundColor: comp.color }}
                                    ></span>
                                    <span className="competitor-name">{comp.name}</span>
                                    <span className="competitor-rank">#{comp.location.score}</span>
                                  </div>
                                  <div className="gap-analysis">
                                    <span
                                      className="gap-indicator"
                                      style={{ color: gap.color }}
                                    >
                                      {gap.text}
                                    </span>
                                    <span className="market-share">
                                      {comp.location.marketShare}% market share
                                    </span>
                                  </div>
                                  <div className="trend-indicator">
                                    {getTrendIcon(comp.location.recentTrend)}
                                    {comp.location.recentTrend === 'up' ? 'Growing' :
                                     comp.location.recentTrend === 'down' ? 'Declining' : 'Stable'}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}

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
            {showCompetitors && (
              (selectedLocation ? [currentLocations.find(l => l.id === selectedLocation)?.name || ''] : currentLocations.map(l => l.name))
                .flatMap(areaName => getAreaCompetitors(areaName))
                .filter(Boolean)
                .filter((c: any) => selectedCompetitor === 'all' || c.name === selectedCompetitor)
            ).map((competitor: any, idx: number) => {
              const areaName = competitor.location.areaName
              const yourLocation = currentLocations.find(l => l.name === areaName)
              const yourScore = yourLocation ? getPositionRanking(yourLocation, selectedKeyword) : 20
              const gap = getCompetitiveGap(yourScore, competitor.location.score)
              const markerSize = competitorComparisonMode ? (competitor.location.marketShare / 5) : 8
              // Use DB coords for area when available
              const coords = dbLocations.find(d => d.name === areaName) || { lat: yourLocation?.lat || 30.2672, lng: yourLocation?.lng || -97.7431 }

              return (
                <CircleMarker
                  key={`${competitor.name}-${areaName}-${idx}`}
                  center={[coords.lat + 0.01, coords.lng + 0.01]}
                  radius={markerSize}
                  fillColor={competitor.color}
                  color={competitorComparisonMode ? gap.color : "white"}
                  weight={competitorComparisonMode ? 3 : 2}
                  opacity={0.8}
                  fillOpacity={competitorComparisonMode ? 0.7 : 0.6}
                >
                  <Tooltip>
                    <div className="competitor-tooltip-enhanced">
                      <strong>{competitor.name}</strong><br/>
                      <span>#{competitor.location.score} in {areaName}</span><br/>
                      <span style={{ color: gap.color, fontWeight: 'bold' }}>
                        {gap.text}
                      </span><br/>
                      <span className="market-share">
                        {competitor.location.marketShare}% market share
                      </span><br/>
                      <span className="trend">
                        {getTrendIcon(competitor.location.recentTrend)}
                        {competitor.location.recentTrend === 'up' ? 'Growing' :
                         competitor.location.recentTrend === 'down' ? 'Declining' : 'Stable'}
                      </span>
                    </div>
                  </Tooltip>

                  <Popup>
                    <div className="competitor-popup">
                      <h3>{competitor.name} - {areaName}</h3>
                      <div className="competitor-popup-content">
                        <div className="popup-stat">
                          <span className="popup-label">Their Ranking:</span>
                          <span className="popup-value">#{competitor.location.score}</span>
                        </div>
                        <div className="popup-stat">
                          <span className="popup-label">Your Ranking:</span>
                          <span className="popup-value">#{yourScore}</span>
                        </div>
                        <div className="popup-stat">
                          <span className="popup-label">Competitive Gap:</span>
                          <span className="popup-value" style={{ color: gap.color }}>
                            {gap.text}
                          </span>
                        </div>
                        <div className="popup-stat">
                          <span className="popup-label">Market Share:</span>
                          <span className="popup-value">{competitor.location.marketShare}%</span>
                        </div>
                        <div className="popup-stat">
                          <span className="popup-label">Recent Trend:</span>
                          <span className="popup-value">
                            {getTrendIcon(competitor.location.recentTrend)}
                            {competitor.location.recentTrend === 'up' ? 'Growing' :
                             competitor.location.recentTrend === 'down' ? 'Declining' : 'Stable'}
                          </span>
                        </div>

                        <div className="competitive-insights">
                          <h4>💡 Opportunity</h4>
                          {gap.status === 'winning' ? (
                            <p className="insight-text success">
                              You're dominating this area! Focus on maintaining your lead.
                            </p>
                          ) : gap.status === 'close' ? (
                            <p className="insight-text warning">
                              Close competition - small improvements could give you the edge.
                            </p>
                          ) : (
                            <p className="insight-text danger">
                              Significant gap to close. Consider targeted campaigns here.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              )
            })}
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
            {(() => {
              // Prefer smart insights when available for the selected area
              const areaName = selectedLocation ? currentLocations.find(l => l.id === selectedLocation)?.name : currentLocations[0]?.name
              const cand = smartInsights?.opportunities?.[0]
              if (smartInsights && cand && areaName) {
                return (
                  <>
                    <p>
                      In <strong>{areaName}</strong>, "{cand.keyword}" is a high-impact opportunity: leader at #{cand.leaderPosition} vs you at #{cand.ourPosition}. Estimated +{cand.potentialClicks} clicks if you close the gap.
                    </p>
                    <div className="insight-action">
                      <button
                        className="insight-btn"
                        onClick={async () => {
                          try {
                            await fetch('/api/gmb-posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'service', business: areaName }) })
                            await fetch('/api/gmb-posts/schedule', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: `Why we're the best for ${cand.keyword} in ${areaName}`, content: `Looking for ${cand.keyword} in ${areaName}? We deliver top results. Book your free quote today.`, scheduleDate: new Date(Date.now() + 48*3600*1000).toISOString() }) })
                            alert('Action queued: GMB content generated and scheduled')
                          } catch {
                            alert('Failed to queue post')
                          }
                        }}
                      >
                        ✍️ Create & Schedule GMB Post
                      </button>
                    </div>
                  </>
                )
              }
              const withScores = viewLocations.filter(l => Number(l.overallScore) > 0)
              if (withScores.length === 0) {
                return <p>Add or select a service area with data to see opportunities.</p>
              }
              const best = withScores.reduce((a, b) => (a.overallScore <= b.overallScore ? a : b))
              const bestLabel = best.name
              const bestRank = `#${Math.round(best.overallScore || 0)}`
              return (
                <>
                  <p><strong>{bestLabel}</strong> is your strongest area at position {bestRank}. Push for #1 to dominate this market!</p>
                  <div className="insight-action">
                    <button
                      className="insight-btn"
                      onClick={() => router.push('/gmb-automation')}
                    >
                      📱 Boost {bestLabel} GMB
                    </button>
                  </div>
                </>
              )
            })()}
          </div>

          <div className="insight-card warning">
            <div className="insight-header">
              <span className="insight-icon">⚠️</span>
              <h4>Needs Attention</h4>
            </div>
            {(() => {
              const areaName = selectedLocation ? currentLocations.find(l => l.id === selectedLocation)?.name : currentLocations[0]?.name
              const threat = smartInsights?.threats?.[0]
              if (smartInsights && threat && areaName) {
                return (
                  <>
                    <p>
                      In <strong>{areaName}</strong>, you rank #{threat.ourPosition} for "{threat.keyword}" while a competitor leads at #{threat.leaderPosition}. High demand (~{threat.volume.toLocaleString()} monthly searches).
                    </p>
                    <div className="insight-action">
                      <button className="insight-btn" onClick={() => router.push('/seo-tracking')}>
                        🚀 Launch {areaName} Campaign
                      </button>
                    </div>
                  </>
                )
              }
              const withScores = viewLocations.filter(l => Number(l.overallScore) > 0)
              if (withScores.length === 0) {
                return <p>No underperforming areas yet. Add areas or wait for data.</p>
              }
              const worst = withScores.reduce((a, b) => (a.overallScore >= b.overallScore ? a : b))
              const label = worst.name
              const rank = `#${Math.round(worst.overallScore || 0)}`
              const volume = (worst.searchVolume || 0).toLocaleString()
              return (
                <>
                  <p><strong>{label}</strong> at position {rank} needs work. This could be a major market with {volume} monthly searches.</p>
                  <div className="insight-action">
                    <button
                      className="insight-btn"
                      onClick={() => router.push('/seo-tracking')}
                    >
                      🚀 Launch {label} Campaign
                    </button>
                  </div>
                </>
              )
            })()}
          </div>

          <div className="insight-card success">
            <div className="insight-header">
              <span className="insight-icon">✅</span>
              <h4>Success Story</h4>
            </div>
            {(() => {
              const areaName = selectedLocation ? currentLocations.find(l => l.id === selectedLocation)?.name : currentLocations[0]?.name
              const win = smartInsights?.quickWins?.[0]
              if (smartInsights && win && areaName) {
                return (
                  <>
                    <p>
                      Momentum in <strong>{areaName}</strong> — you're #{win.ourPosition} for "{win.keyword}". Small tweaks could beat the leader at #{win.leaderPosition}.
                    </p>
                    <div className="insight-action">
                      <button className="insight-btn" onClick={() => router.push('/analytics')}>
                        📊 Analyze {areaName}
                      </button>
                    </div>
                  </>
                )
              }
              let bestTrendLoc: Location | null = null
              let bestChange = 0
              for (const l of viewLocations) {
                const topPositive = Math.max(0, ...l.trends.map(t => Number(t.change) || 0))
                if (topPositive > bestChange) {
                  bestChange = topPositive
                  bestTrendLoc = l
                }
              }
              if (!bestTrendLoc || bestChange <= 0) {
                return <p>As rankings improve, success highlights will appear here.</p>
              }
              const area = bestTrendLoc.name
              const changeText = `jumped +${bestChange} positions recently`
              return (
                <>
                  <p><strong>{area}</strong> {changeText}! Whatever you are doing there, replicate it elsewhere.</p>
                  <div className="insight-action">
                    <button
                      className="insight-btn"
                      onClick={() => router.push('/analytics')}
                    >
                      📊 Analyze {area}
                    </button>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      </div>

      {smartInsights?.recommendedKeywords?.length ? (
        <div className="insights-recommendations">
          <h4>🔎 Recommended Keywords for {smartInsights.area}</h4>
          <div className="top-list">
            {smartInsights.recommendedKeywords.slice(0, 8).map((k: any) => (
              <div key={k.keyword} className="top-row">
                <div className="kw">{k.keyword}</div>
                <div className="clicks">Vol ~{k.estimatedVolume}</div>
                <div className="ctr">Opp {k.opportunity}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
