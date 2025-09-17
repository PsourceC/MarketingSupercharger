"use client"

import { useEffect, useState } from 'react'
import '../setup/setup-styles.css'

export default function BusinessProfileForm() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')
  const [website, setWebsite] = useState('')
  const [primary, setPrimary] = useState('')
  const [areas, setAreas] = useState('')
  const [keywords, setKeywords] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/business', { cache: 'no-cache' })
        if (res.ok) {
          const data = await res.json()
          const p = data.profile || {}
          if (p.business_name) setName(p.business_name)
          if (p.website_url) setWebsite(p.website_url)
          if (p.primary_location) setPrimary(p.primary_location)
          if (Array.isArray(p.service_areas)) setAreas(p.service_areas.join(', '))
          if (Array.isArray(p.target_keywords)) setKeywords(p.target_keywords.join(', '))
        }
      } catch {}
    }
    load()
  }, [])

  const save = async () => {
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: name,
          website_url: website,
          primary_location: primary,
          service_areas: areas,
          target_keywords: keywords
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save profile')
      try {
        await fetch('/api/competitor-discovery', { method: 'POST' })
        setMessage('Profile saved. Re-discovering competitors now…')
      } catch {
        setMessage('Profile saved. You can refresh competitors from the map panel.')
      }
    } catch (e: any) {
      setMessage(e?.message || 'Error saving profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="guide-section">
      <h3>🏢 Business Profile</h3>
      <div className="form-grid">
        <label className="form-label">Business Name</label>
        <input className="input-text" value={name} onChange={e => setName(e.target.value)} placeholder="Astrawatt Solar" />

        <label className="form-label">Website (domain or URL)</label>
        <input className="input-text" value={website} onChange={e => setWebsite(e.target.value)} placeholder="example.com" />

        <label className="form-label">Primary Location</label>
        <input className="input-text" value={primary} onChange={e => setPrimary(e.target.value)} placeholder="Austin, TX" />

        <label className="form-label">Service Areas</label>
        <textarea className="input-text" rows={2} value={areas} onChange={e => setAreas(e.target.value)} placeholder="Austin, TX; Round Rock, TX; Cedar Park, TX" />

        <label className="form-label">Target Keywords</label>
        <textarea className="input-text" rows={2} value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="solar installer, solar panels near me" />
      </div>
      <div className="email-actions">
        <button className="btn-secondary" disabled={loading} onClick={save}>💾 Save Profile</button>
      </div>
      {message && <p className="status-message">{message}</p>}
    </div>
  )
}
