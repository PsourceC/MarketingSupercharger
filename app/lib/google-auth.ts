import { google } from 'googleapis'

// Google OAuth 2.0 configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'
)

// Scopes needed for Search Console API
const SCOPES = [
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/webmasters'
]

export function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  })
}

export async function getTokensFromCode(code: string) {
  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}

export function setCredentials(tokens: any) {
  oauth2Client.setCredentials(tokens)
  return oauth2Client
}

export async function getSearchConsoleData(siteUrl: string, auth: any) {
  const searchconsole = google.searchconsole({ version: 'v1', auth })
  
  try {
    // Get search analytics data for the last 30 days
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)
    
    const response = await searchconsole.searchanalytics.query({
      siteUrl: siteUrl,
      requestBody: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        dimensions: ['query', 'page'],
        rowLimit: 100,
        startRow: 0
      }
    })

    return response.data
  } catch (error) {
    console.error('Error fetching Search Console data:', error)
    throw error
  }
}

export async function getSiteList(auth: any) {
  const searchconsole = google.searchconsole({ version: 'v1', auth })
  
  try {
    const response = await searchconsole.sites.list()
    return response.data.siteEntry || []
  } catch (error) {
    console.error('Error fetching site list:', error)
    throw error
  }
}

// Helper function to calculate average position from Search Console data
export function calculateMetricsFromSearchConsole(data: any) {
  if (!data.rows || data.rows.length === 0) {
    return {
      avgPosition: 0,
      totalClicks: 0,
      totalImpressions: 0,
      avgCTR: 0
    }
  }

  let totalPosition = 0
  let totalClicks = 0
  let totalImpressions = 0
  let positionCount = 0

  data.rows.forEach((row: any) => {
    if (row.position) {
      totalPosition += row.position
      positionCount++
    }
    totalClicks += row.clicks || 0
    totalImpressions += row.impressions || 0
  })

  const avgPosition = positionCount > 0 ? totalPosition / positionCount : 0
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0

  return {
    avgPosition: Math.round(avgPosition * 10) / 10,
    totalClicks,
    totalImpressions,
    avgCTR: Math.round(avgCTR * 100) / 100
  }
}
