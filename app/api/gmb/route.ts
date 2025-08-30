import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export const dynamic = 'force-dynamic'

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GMB_REFRESH_TOKEN
  const accessTokenEnv = process.env.GMB_ACCESS_TOKEN

  if (!clientId || !clientSecret) return null

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, process.env.GMB_REDIRECT_URI)

  if (refreshToken) {
    oauth2Client.setCredentials({ refresh_token: refreshToken })
    try {
      const { credentials } = await oauth2Client.refreshAccessToken()
      const token = credentials.access_token || null
      if (token) process.env.GMB_ACCESS_TOKEN = token
      return token
    } catch (e) {
      console.error('Failed to refresh GMB access token:', e)
      return null
    }
  }

  if (accessTokenEnv) return accessTokenEnv
  return null
}

export async function GET() {
  try {
    const token = await getAccessToken()

    if (!token) {
      const parts: string[] = []
      if (process.env.GMB_STORE_CODE) parts.push('Store Code set')
      if (process.env.GMB_BUSINESS_PROFILE_ID) parts.push('Business Profile ID set')
      if (process.env.GMB_OAUTH_CLIENT_ID) parts.push('OAuth Client ID set')
      if (process.env.GMB_CREDENTIALS_JSON) parts.push('Credentials JSON loaded')

      return NextResponse.json({
        connected: false,
        message: 'Not authorized with Google My Business',
        configuration: parts,
      }, { status: 401 })
    }

    // Fetch accounts
    const accountsRes = await fetch('https://mybusiness.googleapis.com/v4/accounts', {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (!accountsRes.ok) {
      const errText = await accountsRes.text()
      return NextResponse.json({ connected: false, message: 'Failed to list accounts', error: errText }, { status: 502 })
    }

    const accountsData = await accountsRes.json() as { accounts?: Array<{ name: string, accountName?: string }> }
    const accounts = accountsData.accounts || []

    let locations: any[] = []
    if (accounts.length > 0) {
      const firstAccountId = accounts[0].name?.split('/').pop()
      if (firstAccountId) {
        const locRes = await fetch(`https://mybusiness.googleapis.com/v4/accounts/${firstAccountId}/locations`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (locRes.ok) {
          const locData = await locRes.json()
          locations = Array.isArray(locData.locations) ? locData.locations : []
        }
      }
    }

    return NextResponse.json({
      connected: true,
      accountsCount: accounts.length,
      sampleAccount: accounts[0] || null,
      locationsCount: locations.length,
      sampleLocation: locations[0] || null,
      lastChecked: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('GMB endpoint error:', error)
    return NextResponse.json({ connected: false, message: 'Unexpected server error', error: error?.message || String(error) }, { status: 500 })
  }
}
