'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import './service-status-styles.css'

interface ServiceItem { status: 'working' | 'partial' | 'not-setup'; message: string }
interface ServicesMap { [key: string]: ServiceItem }

export default function ServiceStatusPage() {
  const [services, setServices] = useState<ServicesMap>({})
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/service-status', { cache: 'no-cache' })
        const json = await res.json()
        setServices(json.services || {})
      } catch {
        setServices({})
      } finally {
        setLoading(false)
        setLastUpdated(new Date().toLocaleString())
      }
    }
    load()
  }, [])

  const getBadgeClass = (status: ServiceItem['status']) => {
    if (status === 'working') return 'status-badge ok'
    if (status === 'partial') return 'status-badge warn'
    return 'status-badge fail'
  }

  const liveSources = Object.entries(services)
    .filter(([key, v]) => ['google-search-console','ai-ranking-tracker','competitor-tracking','citation-monitoring','google-my-business','email-notifications'].includes(key) && v.status === 'working')
    .map(([key]) => key)

  const partialSources = Object.entries(services)
    .filter(([key, v]) => ['google-search-console','ai-ranking-tracker','competitor-tracking','citation-monitoring','google-my-business','email-notifications'].includes(key) && v.status === 'partial')
    .map(([key]) => key)

  return (
    <div className="system-status-page">
      <header className="status-header">
        <div className="header-row">
          <Link href="/" className="back-link">← Back to Dashboard</Link>
          <h1 className="status-title">📡 System Status & Live Data</h1>
        </div>
        <p className="status-subtitle">Single view of every data source powering your dashboard</p>
        <div className="updated-row">
          <span className="updated-indicator">🔄</span>
          <span className="updated-text">Updated: {lastUpdated || '--:--:--'}</span>
        </div>
      </header>

      <section className="live-data-section">
        <h2 className="section-title">🔴 Live Data Sources</h2>
        {loading ? (
          <div className="loading-note">Loading status…</div>
        ) : (
          <>
            {liveSources.length === 0 && partialSources.length === 0 ? (
              <div className="empty-note">No live sources connected yet.</div>
            ) : null}
            {liveSources.length > 0 && (
              <ul className="source-list">
                {liveSources.map((s) => (
                  <li key={s} className="source-item">
                    <span className="source-dot live"></span>
                    <span className="source-name">{labelFor(s)}</span>
                    <span className="source-state">LIVE</span>
                  </li>
                ))}
              </ul>
            )}
            {partialSources.length > 0 && (
              <div className="partial-block">
                <div className="partial-title">Partially configured</div>
                <ul className="source-list">
                  {partialSources.map((s) => (
                    <li key={s} className="source-item">
                      <span className="source-dot partial"></span>
                      <span className="source-name">{labelFor(s)}</span>
                      <span className="source-state">Setup required</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </section>

      <section className="all-services-section">
        <h2 className="section-title">🧩 Full Service Checklist</h2>
        {loading ? (
          <div className="loading-note">Loading services…</div>
        ) : (
          <div className="services-grid">
            {Object.entries(services).map(([key, value]) => (
              <div key={key} className="service-card">
                <div className="service-card-header">
                  <div className={getBadgeClass(value.status)}>{value.status === 'working' ? 'Working' : value.status === 'partial' ? 'Partial' : 'Not Set Up'}</div>
                  <h3 className="service-name">{labelFor(key)}</h3>
                </div>
                <p className="service-message">{value.message}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="status-footer">
        <div className="footer-actions">
          <Link href="/setup" className="link-button">Finish Setup</Link>
          <Link href="/brightdata-status" className="link-button secondary">Bright Data Status</Link>
          <Link href="/db-check" className="link-button secondary">Database Check</Link>
        </div>
      </footer>
    </div>
  )
}

function labelFor(key: string) {
  switch (key) {
    case 'database': return 'Database (Neon)'
    case 'brightdata': return 'Bright Data (SERP)'
    case 'ai-ranking-tracker': return 'AI Ranking Tracker'
    case 'google-search-console': return 'Google Search Console'
    case 'google-my-business': return 'Google My Business'
    case 'google-analytics': return 'Google Analytics'
    case 'social-media': return 'Social Media Integrations'
    case 'email-notifications': return 'Email Notifications'
    case 'review-management': return 'Review Management'
    case 'citation-monitoring': return 'Citation Monitoring'
    case 'competitor-tracking': return 'Competitor Tracking'
    case 'citation-builder': return 'Citation Builder'
    default: return key
  }
}
