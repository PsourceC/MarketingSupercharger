import { NextResponse } from 'next/server'
import { query } from '../../../../lib/server-only'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await query(`CREATE TABLE IF NOT EXISTS gmb_tokens (
      id SERIAL PRIMARY KEY,
      access_token TEXT,
      refresh_token TEXT,
      token_type TEXT,
      expiry_date BIGINT,
      updated_at TIMESTAMP DEFAULT NOW()
    )`)

    const res = await query(`SELECT access_token, refresh_token, token_type, expiry_date, updated_at FROM gmb_tokens ORDER BY updated_at DESC LIMIT 1`)
    const row = res.rows?.[0]

    const envAccess = !!process.env.GMB_ACCESS_TOKEN
    const envRefresh = !!process.env.GMB_REFRESH_TOKEN

    const connected = !!(row?.access_token || row?.refresh_token || envAccess || envRefresh)

    return NextResponse.json({
      connected,
      source: row ? 'database' : (envAccess || envRefresh ? 'env' : 'none'),
      token: {
        hasAccess: !!row?.access_token || envAccess,
        hasRefresh: !!row?.refresh_token || envRefresh,
        expiryDate: row?.expiry_date || null,
        updatedAt: row?.updated_at || null,
      }
    })
  } catch (e: any) {
    return NextResponse.json({ connected: false, error: e?.message || String(e) }, { status: 500 })
  }
}
