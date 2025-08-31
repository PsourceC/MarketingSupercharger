"use client"

import { useEffect, useMemo, useState } from 'react'
import { suggestCities } from '../lib/city-suggestions'
import { apiFetch } from '../services/api'

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

import CornerTooltip from './CornerTooltip'

export default function CompetitorKeywordProfile() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [businessName, setBusinessName] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [serviceAreas, setServiceAreas] = useState<string[]>([])
  const [areaInput, setAreaInput] = useState('')
  const [areaMatches, setAreaMatches] = useState<string[]>([])
  const [activeArea, setActiveArea] = useState<string>('Central Austin')
  const [target, setTarget] = useState<TargetKeywords>({ global: [], areas: {}, competitors: {} })
  const [suggestions, setSuggestions] = useState<Record<string, { keyword: string; estimatedVolume: number; competitorCount: number; opportunity: number }[]>>({})
  const [discovering, setDiscovering] = useState(false)
  const [applyingLive, setApplyingLive] = useState(false)
  const [liveStatus, setLiveStatus] = useState('')

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const data: ConfigResponse = await apiFetch<ConfigResponse>('/business-config')
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
  const areaCompetitors = useMemo(() => target.competitors[activeArea] || [], [target, activeArea])

  const persistConfig = async (areas: string[], newTarget: TargetKeywords) => {
    try {
      const payload = { businessName, websiteUrl, serviceAreas: areas, targetKeywords: newTarget }
      await apiFetch('/business-config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    } catch {}
  }

  const addArea = (value?: string) => {
    const v = (value ?? areaInput).trim()
    if (!v) return
    if (serviceAreas.includes(v)) { setAreaInput(''); setAreaMatches([]); return }
    const nextAreas = [...serviceAreas, v]
    const nextTarget: TargetKeywords = {
      ...target,
      areas: { ...target.areas, [v]: target.areas[v] || [] },
      competitors: { ...target.competitors, [v]: target.competitors[v] || [] }
    }
    setServiceAreas(nextAreas)
    setTarget(nextTarget)
    setActiveArea(v)
    setAreaInput('')
    setAreaMatches([])
    persistConfig(nextAreas, nextTarget)
  }

  const removeArea = (name: string) => {
    const nextAreas = serviceAreas.filter(a => a !== name)
    const { [name]: _ignoredA, ...restAreas } = target.areas
    const { [name]: _ignoredB, ...restComps } = target.competitors
    const nextTarget: TargetKeywords = { ...target, areas: restAreas, competitors: restComps }
    setServiceAreas(nextAreas)
    setTarget(nextTarget)
    if (activeArea === name) setActiveArea(nextAreas[0] || '')
    persistConfig(nextAreas, nextTarget)
  }

  const updateAreaKeywords = (values: string[]) => {
    setTarget(prev => ({ ...prev, areas: { ...prev.areas, [activeArea]: uniq(values) } }))
  }

  const discover = async () => {
    try {
      setDiscovering(true)
      const data = await apiFetch<any>('/keyword-discovery')
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
      const r = await apiFetch('/business-config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
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
    <div id="competitor-profile" className="profile-config" style={{ position: 'relative' }}>
      <CornerTooltip
        title="Competitor & Keyword Profile"
        ariaLabel="Help: Competitor & Keyword Profile"
        aiContext={{ activeArea, areaKeywordsCount: (target.areas[activeArea] || []).length, competitorsCount: (target.competitors[activeArea] || []).length }}
        content={() => (
          <div>
            <p>Set your service areas, target keywords, and competitor domains. This guides discovery and ranking checks.</p>
            <ul style={{ margin: '6px 0 0 1em' }}>
              <li>Active area: <strong>{activeArea || '—'}</strong></li>
              <li>Keywords in area: <strong>{(target.areas[activeArea] || []).length}</strong></li>
              <li>Competitors in area: <strong>{(target.competitors[activeArea] || []).length}</strong></li>
            </ul>
          </div>
        )}
      />
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
            <input
              value={areaInput}
              onChange={e => {
                const v = e.target.value
                setAreaInput(v)
                setAreaMatches(v.length >= 2 ? suggestCities(v, 8) : [])
              }}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addArea() } }}
              placeholder="Add area (e.g., Austin, TX)"
            />
            <button className="small-btn" onClick={() => addArea()}>＋ Add</button>
            {activeArea && <button className="small-btn danger" onClick={() => removeArea(activeArea)}>✕ Remove Selected</button>}
            {areaMatches.length > 0 && (
              <div className="area-suggest-panel">
                <ul>
                  {areaMatches.map(s => (
                    <li key={s}>
                      <button className="suggestion-item" onClick={() => addArea(s)}>{s}</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="config-card wide">
          <div className="area-header">
            <h4>Target Keywords — {activeArea || 'Select an area'}</h4>
            <div className="area-actions">
              <button className="small-btn" onClick={discover} disabled={discovering}>{discovering ? '⏳ Discovering' : '🤖 Discover'}</button>
              <button className="small-btn" onClick={applyAreaSuggestions} disabled={!areaSuggestions.length}>📥 Apply Suggestions</button>
              <button className="small-btn" onClick={async () => {
                try {
                  let data = await apiFetch<any>('/rankings/by-area').catch(() => ({} as any))
                  let list = data?.areas?.[activeArea] || []
                  if (list.length === 0) {
                    // Bootstrap this area to collect data, then retry
                    await apiFetch('/keywords/bootstrap', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ area: activeArea, limit: 12 }) })
                    data = await apiFetch<any>('/rankings/by-area').catch(() => ({} as any))
                    list = data?.areas?.[activeArea] || []
                    if (list.length === 0) { alert('Still gathering data. Please try again in a moment.'); return }
                  }
                  const kws = list.map((x:any) => x.keyword)
                  updateAreaKeywords(kws)
                  const nextTarget = { ...target, areas: { ...target.areas, [activeArea]: kws } }
                  const payload = { businessName, websiteUrl, serviceAreas, targetKeywords: nextTarget }
                  await apiFetch('/business-config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
                  alert('✅ Applied top live keywords to this area')
                } catch { alert('Failed to load live keywords') }
              }}>🧠 Use Top Keywords (Live)</button>
            </div>
          </div>
          {liveStatus && (<div className="hint">{liveStatus}</div>)}
          <textarea
            rows={4}
            value={areaKeywords.join(', ')}
            onChange={e => updateAreaKeywords(parseList(e.target.value))}
            placeholder="solar installation Austin, TX, best solar company Austin, TX"
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

        <div className="config-card wide">
          <div className="area-header">
            <h4>Competitors — {activeArea || 'Select an area'}</h4>
          </div>
          <textarea
            rows={3}
            value={areaCompetitors.join(', ')}
            onChange={e => setTarget(prev => ({ ...prev, competitors: { ...prev.competitors, [activeArea]: parseList(e.target.value) } }))}
            placeholder="competitor1.com, competitor2.com, competitor3.com"
          />
          <div className="hint">Comma-separated domains. These will always be included in analysis.</div>
        </div>
      </div>

      <div className="config-footer">
        <button className="save-btn" onClick={save} disabled={loading}>💾 Save Profile</button>
      </div>
    </div>
  )
}
