import { NextResponse } from 'next/server'

import { NextResponse } from 'next/server'
import { query } from '../../lib/server-only'
import { isEmailConfigured, sendEmail } from '../../lib/email'

// Orchestrate safe, rate-limited refreshes for data sources
export async function POST() {
  try {
    const results: Record<string, any> = {}

    // Determine last refresh times from DB
    const [{ rows: citRows }, { rows: compRows }] = await Promise.all([
      query("SELECT MAX(last_checked) AS last FROM solar_citations"),
      query("SELECT MAX(last_updated) AS last FROM solar_competitors"),
    ])

    const now = Date.now()
    const lastCit = citRows?.[0]?.last ? new Date(citRows[0].last).getTime() : 0
    const lastComp = compRows?.[0]?.last ? new Date(compRows[0].last).getTime() : 0

    // Policies: citations <= 1/day, competitors <= 6 hours
    const shouldRefreshCitations = now - lastCit > 24 * 60 * 60 * 1000
    const shouldRefreshCompetitors = now - lastComp > 6 * 60 * 60 * 1000

    // Helper to call internal APIs safely
    const call = async (url: string, init?: RequestInit) => {
      const res = await fetch(url, { cache: 'no-store', ...init })
      const text = await res.text()
      try {
        return { ok: res.ok, status: res.status, data: JSON.parse(text) }
      } catch {
        return { ok: res.ok, status: res.status, data: text }
      }
    }

    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    // Refresh Citations (free workaround checks)
    if (shouldRefreshCitations) {
      await call(`${base}/api/citations`, { method: 'POST', body: JSON.stringify({ action: 'refresh' }) })
      const cit = await call(`${base}/api/citations`)
      results.citations = cit
      // Be polite between services
      await new Promise(r => setTimeout(r, 800))
    } else {
      results.citations = { skipped: true, reason: 'recent-data', last: lastCit }
    }

    // Refresh Competitors (free SERP simulation)
    if (shouldRefreshCompetitors) {
      await call(`${base}/api/competitor-tracking`, { method: 'POST', body: JSON.stringify({ action: 'refresh' }) })
      const comp = await call(`${base}/api/competitor-tracking`)
      results.competitors = comp
    } else {
      results.competitors = { skipped: true, reason: 'recent-data', last: lastComp }
    }

    // Compute ranking performance deltas (24h vs prior 24h)
    const metrics = await query(`
      WITH last24 AS (
        SELECT AVG(ranking_position) AS avg_pos
        FROM solar_keyword_rankings
        WHERE created_at > NOW() - INTERVAL '24 hours'
      ), prev24 AS (
        SELECT AVG(ranking_position) AS avg_pos
        FROM solar_keyword_rankings
        WHERE created_at > NOW() - INTERVAL '48 hours'
          AND created_at <= NOW() - INTERVAL '24 hours'
      )
      SELECT (SELECT avg_pos FROM last24) AS last_avg,
             (SELECT avg_pos FROM prev24) AS prev_avg,
             (SELECT COUNT(*) FROM solar_keyword_rankings WHERE created_at > NOW() - INTERVAL '24 hours') AS last_count
    `)

    const lastAvg = Number(metrics.rows[0]?.last_avg || 0)
    const prevAvg = Number(metrics.rows[0]?.prev_avg || 0)
    const lastCount = Number(metrics.rows[0]?.last_count || 0)
    const delta = prevAvg && lastAvg ? (lastAvg - prevAvg) : 0

    // Send alert if meaningful change and email configured
    let emailResult: any = { sent: false }
    if (isEmailConfigured() && lastCount > 0 && Math.abs(delta) >= 1) {
      const direction = delta < 0 ? 'improved' : 'dropped'
      const subject = `Ranking ${direction}: Δ ${delta.toFixed(1)} (avg pos)`
      const html = `
        <h2>Ranking ${direction}</h2>
        <p>Average Position (last 24h): <b>${lastAvg.toFixed(1)}</b><br/>
        Previous 24h: <b>${prevAvg ? prevAvg.toFixed(1) : 'n/a'}</b><br/>
        Change: <b>${delta > 0 ? '+' : ''}${delta.toFixed(1)}</b></p>
        <p>Rankings analyzed: ${lastCount}</p>
        <p>Policies: citations daily, competitors 6-hourly (free workarounds active).</p>
      `
      emailResult = await sendEmail(subject, html)
    }

    return NextResponse.json({
      success: true,
      results,
      alerts: { rankingDelta: delta, email: emailResult },
      policies: {
        citations: '24h cadence (free directory checks)',
        competitors: '6h cadence (free SERP simulation)'
      },
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Error during data refresh:', error)
    return NextResponse.json(
      { error: 'Failed to refresh data', details: error?.message || String(error) },
      { status: 500 }
    )
  }
}
