import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    // Fire a background-like task (best-effort) to run live rankings across all service areas
    // We cannot spawn real background jobs here, so trigger the main endpoint without awaiting per-area details
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 60000)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/live-rankings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
        signal: controller.signal,
        cache: 'no-store'
      })
    } catch {}
    clearTimeout(t)

    return NextResponse.json({ started: true, mode: process.env.LIVE_SCRAPER_ENABLED === '1' ? 'live' : 'simulation', timestamp: new Date().toISOString() })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
