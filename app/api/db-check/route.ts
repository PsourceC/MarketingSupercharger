import { NextResponse } from 'next/server'
import { query } from '../../lib/server-only'

export const dynamic = 'force-dynamic'

export async function GET() {
  const results: { name: string; ok: boolean; details?: any; error?: string }[] = []

  try {
    const ping = await query('SELECT 1 AS ok')
    results.push({ name: 'Basic connection', ok: ping.rows[0]?.ok === 1 })
  } catch (e: any) {
    results.push({ name: 'Basic connection', ok: false, error: e?.message })
  }

  try {
    const info = await query('SELECT current_database() AS db, current_user AS user')
    results.push({ name: 'Session info', ok: true, details: info.rows[0] })
  } catch (e: any) {
    results.push({ name: 'Session info', ok: false, error: e?.message })
  }

  const expectedTables = [
    'solar_keyword_rankings',
    'solar_locations',
    'solar_priority_actions',
    'solar_business_info',
  ]

  try {
    const tables = await query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
    const names = new Set(tables.rows.map((r: any) => r.table_name))
    for (const t of expectedTables) {
      results.push({ name: `Table exists: ${t}`, ok: names.has(t) })
    }
  } catch (e: any) {
    results.push({ name: 'List tables', ok: false, error: e?.message })
  }

  for (const t of expectedTables) {
    try {
      const count = await query(`SELECT COUNT(1) AS c FROM ${t}`)
      results.push({ name: `Row count: ${t}`, ok: true, details: { count: Number(count.rows[0]?.c || 0) } })
    } catch (e: any) {
      results.push({ name: `Row count: ${t}`, ok: false, error: e?.message })
    }
  }

  const ok = results.every((r) => r.ok)
  return NextResponse.json({ ok, results })
}
