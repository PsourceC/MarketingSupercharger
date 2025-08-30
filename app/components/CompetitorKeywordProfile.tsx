"use client"

import { useEffect, useMemo, useState } from 'react'

type TargetKeywords = {
  global: string[]
  areas: Record<string, string[]>
  competitors: Record<string, string[]>
}

type ConfigResponse = {
  businessName: string
  websiteUrl: string
  serviceAreas: string[]
  targetKeywords: TargetKeywords
}

const DEFAULT_AREAS = [
  'Central Austin','Georgetown','Cedar Park','Round Rock','Pflugerville','Leander','Hutto'
]

function uniq(arr: string[]) {
  return Array.from(new Set(arr.map(s => s.trim()).filter(Boolean)))
}

function suggestKeywords(area: string, websiteUrl: string, existing: string[]): string[] {
  const city = area.toLowerCase()
  const base = [
    `solar installation ${city}`,
    `best solar company ${city}`,
    `solar panels ${city}`,
    `solar installer near me ${city}`,
    `affordable solar ${city}`,
    `cheap solar ${city}`,
    `top rated solar installers ${city}`,
  ]
  const productHooks = [
    `tesla powerwall ${city}`,
    `enphase installer ${city}`,
    `rec solar panels ${city}`,
  ]
  const serviceHooks = [
    `solar financing ${city}`,
    `solar rebates ${city}`,
    `net metering ${city}`,
  ]
  const domainHints = websiteUrl.includes('astras') ? ['home battery backup '+city] : []
  return uniq([...existing, ...base, ...productHooks, ...serviceHooks, ...domainHints])
}

export default function CompetitorKeywordProfile() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [businessName, setBusinessName] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [serviceAreas, setServiceAreas] = useState<string[]>([])
  const [areaInput, setAreaInput] = useState('')
  const [activeArea, setActiveArea] = useState<string>('Central Austin')
  const [target, setTarget] = useState<TargetKeywords>({ global: [], areas: {}, competitors: {} })
  const [suggestions, setSuggestions] = useState<Record<string, { keyword: string; estimatedVolume: number; competitorCount: number; opportunity: number }[]>>({})
  const [discovering, setDiscovering] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const r = await fetch('/api/business-config')
        if (!r.ok) throw new Error('Failed to load config')
        const data: ConfigResponse = await r.json()
        setBusinessName(data.businessName || '')
        setWebsiteUrl(data.websiteUrl || '')
        const areas = (data.serviceAreas && data.serviceAreas.length ? data.serviceAreas : DEFAULT_AREAS)
        setServiceAreas(areas)
        setActiveArea(areas[0] || DEFAULT_AREAS[0])
        setTarget({
          global: data.targetKeywords?.global || [],
          areas: data.targetKeywords?.areas || {},
          competitors: data.targetKeywords?.competitors || {}
        })
      } catch (e: any) {
        setError(e.message)
        setServiceAreas(DEFAULT_AREAS)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const areaKeywords = useMemo(() => target.areas[activeArea] || [], [target, activeArea])
  const areaSuggestions = useMemo(() => suggestions[activeArea] || [], [suggestions, activeArea])

  const addArea = () => {
    const v = areaInput.trim()
    if (!v) return
    if (serviceAreas.includes(v)) return
    setServiceAreas(prev => [...prev, v])
    setTarget(prev => ({ ...prev, areas: { ...prev.areas, [v]: [] }, competitors: { ...prev.competitors, [v]: [] } }))
    setAreaInput('')
  }

  const removeArea = (name: string) => {
    setServiceAreas(prev => prev.filter(a => a !== name))
    setTarget(prev => {
      const { [name]: _, ...restAreas } = prev.areas
      const { [name]: __, ...restComps } = prev.competitors
      return { ...prev, areas: restAreas, competitors: restComps }
    })
    if (activeArea === name) setActiveArea(serviceAreas.find(a => a !== name) || '')
  }

  const updateAreaKeywords = (values: string[]) => {
    setTarget(prev => ({ ...prev, areas: { ...prev.areas, [activeArea]: uniq(values) } }))
  }

  const discover = async () => {
    try {
      setDiscovering(true)
      const r = await fetch('/api/keyword-discovery')
      if (!r.ok) throw new Error('Discovery failed')
      const data = await r.json()
      setSuggestions(data.areas || {})
    } catch (e: any) {
      setError(e.message)
    } finally {
      setDiscovering(false)
    }
  }

  const applyAreaSuggestions = () => {
    if (!areaSuggestions.length) return
    updateAreaKeywords(areaSuggestions.map(s => s.keyword))
  }

  const save = async () => {
    setLoading(true)
    setError(null)
    try {
      const payload = {
        businessName,
        websiteUrl,
        serviceAreas: serviceAreas,
        targetKeywords: target,
      }
      const r = await fetch('/api/business-config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!r.ok) throw new Error('Failed to save')
      // Nudge data-driven features
      window.dispatchEvent(new CustomEvent('dataRefresh'))
      alert('✅ Profile saved. Competitor discovery will use these targets.')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const parseList = (text: string) => uniq(text.split(',').map(s => s.trim()).filter(Boolean))

  return (
    <div className="profile-config">
      <div className="section-header">
        <div className="header-content">
          <h2>🧭 Competitor & Keyword Profile</h2>
          <p>Define competitors and target keywords by area to guide tracking and impact</p>
        </div>
      </div>

      {error && <div className="config-error">⚠️ {error}</div>}

      <div className="config-grid">
        <div className="config-card">
          <h4>Business</h4>
          <div className="form-row">
            <label>Name</label>
            <input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Astrawatt Solar" />
          </div>
          <div className="form-row">
            <label>Website</label>
            <input value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://www.example.com" />
          </div>
          <div className="form-row">
            <label>Global Keywords</label>
            <textarea
              rows={3}
              value={target.global.join(', ')}
              onChange={e => setTarget(prev => ({ ...prev, global: parseList(e.target.value) }))}
              placeholder="solar installation, solar panels, solar financing"
            />
            <div className="hint">Comma-separated. Applied to all areas.</div>
          </div>
        </div>

        <div className="config-card">
          <h4>Service Areas</h4>
          <div className="chips">
            {serviceAreas.map(a => (
              <button key={a} className={`chip ${a===activeArea?'active':''}`} onClick={() => setActiveArea(a)}>{a}</button>
            ))}
          </div>
          <div className="add-area-row">
            <input value={areaInput} onChange={e => setAreaInput(e.target.value)} placeholder="Add area (e.g., South Austin)" />
            <button className="small-btn" onClick={addArea}>＋ Add</button>
            {activeArea && <button className="small-btn danger" onClick={() => removeArea(activeArea)}>✕ Remove Selected</button>}
          </div>
        </div>

        <div className="config-card wide">
          <div className="area-header">
            <h4>Target Keywords — {activeArea || 'Select an area'}</h4>
            <div className="area-actions">
              <button className="small-btn" onClick={discover} disabled={discovering}>{discovering ? '⏳ Discovering' : '🤖 Discover'}</button>
              <button className="small-btn" onClick={applyAreaSuggestions} disabled={!areaSuggestions.length}>📥 Apply Suggestions</button>
            </div>
          </div>
          <textarea
            rows={4}
            value={areaKeywords.join(', ')}
            onChange={e => updateAreaKeywords(parseList(e.target.value))}
            placeholder="solar installation central austin, best solar company central austin"
          />
          <div className="hint">Comma-separated. Auto-discovery finds high-impact, area-specific terms.</div>
          {areaSuggestions.length > 0 && (
            <div className="suggestion-list">
              <h5>Suggested ({areaSuggestions.length})</h5>
              <ul>
                {areaSuggestions.map(s => (
                  <li key={s.keyword}>
                    <span className="kw">{s.keyword}</span>
                    <span className="meta">Vol {s.estimatedVolume.toLocaleString()} • Opp {s.opportunity}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="config-footer">
        <button className="save-btn" onClick={save} disabled={loading}>💾 Save Profile</button>
      </div>
    </div>
  )
}
