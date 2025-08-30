import { NextRequest, NextResponse } from 'next/server'
import { getGmbTokensFromCode } from '../../../../lib/gmb-auth'
import { query } from '../../../../lib/server-only'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL('/?auth=error&message=' + encodeURIComponent(error), request.url))
  }
  if (!code) {
    return NextResponse.redirect(new URL('/?auth=error&message=No authorization code received (GMB)', request.url))
  }

  try {
    const tokens = await getGmbTokensFromCode(code)

    // Persist tokens to DB so connection survives restarts
    await query(`CREATE TABLE IF NOT EXISTS gmb_tokens (
      id SERIAL PRIMARY KEY,
      access_token TEXT,
      refresh_token TEXT,
      token_type TEXT,
      expiry_date BIGINT,
      updated_at TIMESTAMP DEFAULT NOW()
    )`)

    await query(
      `INSERT INTO gmb_tokens (access_token, refresh_token, token_type, expiry_date, updated_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [tokens.access_token || null, tokens.refresh_token || null, tokens.token_type || null, tokens.expiry_date || null]
    )

    // Also set in env for immediate use in current runtime
    process.env.GMB_ACCESS_TOKEN = tokens.access_token || ''
    if (tokens.refresh_token) {
      process.env.GMB_REFRESH_TOKEN = tokens.refresh_token
    }

    return NextResponse.redirect(new URL('/?auth=success&message=Google My Business connected successfully', request.url))
  } catch (e) {
    console.error('GMB auth callback error:', e)
    return NextResponse.redirect(new URL('/?auth=error&message=Failed to authenticate Google My Business', request.url))
  }
}
