import { NextResponse } from 'next/server'
import { query } from '../../../../lib/server-only'
import { google } from 'googleapis'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    await query(`CREATE TABLE IF NOT EXISTS gmb_tokens (
      id SERIAL PRIMARY KEY,
      access_token TEXT,
      refresh_token TEXT,
      token_type TEXT,
      expiry_date BIGINT,
      updated_at TIMESTAMP DEFAULT NOW()
    )`)

    const latest = await query(`SELECT refresh_token FROM gmb_tokens ORDER BY updated_at DESC LIMIT 1`)
    const dbRefresh: string | null = latest.rows?.[0]?.refresh_token || null
    const envRefresh: string | undefined = process.env.GMB_REFRESH_TOKEN

    const refreshToken = dbRefresh || envRefresh
    if (!refreshToken) {
      return NextResponse.json({ ok: false, error: 'No refresh token found. Please reconnect via OAuth.' }, { status: 400 })
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GMB_REDIRECT_URI || 'http://localhost:3000/api/auth/gmb/callback'
    )

    oauth2Client.setCredentials({ refresh_token: refreshToken })

    // Refresh access token
    const { credentials } = await oauth2Client.refreshAccessToken()

    await query(
      `INSERT INTO gmb_tokens (access_token, refresh_token, token_type, expiry_date, updated_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [credentials.access_token || null, credentials.refresh_token || refreshToken, credentials.token_type || null, credentials.expiry_date || null]
    )

    // Update env for this runtime as well
    if (credentials.access_token) process.env.GMB_ACCESS_TOKEN = credentials.access_token
    if (credentials.refresh_token) process.env.GMB_REFRESH_TOKEN = credentials.refresh_token

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}
