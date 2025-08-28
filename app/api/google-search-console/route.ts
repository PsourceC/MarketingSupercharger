import { NextResponse } from 'next/server'
import { setCredentials, getSearchConsoleData, calculateMetricsFromSearchConsole } from '../../lib/google-auth'

export async function GET() {
  try {
    // Check if we have OAuth tokens
    const accessToken = process.env.GOOGLE_ACCESS_TOKEN
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

    if (!accessToken && !refreshToken) {
      return NextResponse.json(
        { error: 'Not authenticated with Google Search Console' },
        { status: 401 }
      )
    }

    // Set up OAuth client with stored tokens
    const auth = setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    })

    // Fetch data for astrawatt.com (adjust site URL as needed)
    const siteUrl = 'https://astrawatt.com' // Update this to match your actual site URL
    
    try {
      const searchConsoleData = await getSearchConsoleData(siteUrl, auth)
      
      // Calculate metrics from the real data
      const metrics = calculateMetricsFromSearchConsole(searchConsoleData)
      
      return NextResponse.json({
        success: true,
        siteUrl,
        data: searchConsoleData,
        metrics: {
          avgPosition: metrics.avgPosition,
          totalClicks: metrics.totalClicks,
          totalImpressions: metrics.totalImpressions,
          avgCTR: metrics.avgCTR
        },
        dataSource: 'Google Search Console API',
        lastUpdated: new Date().toISOString()
      })
    } catch (searchError) {
      console.error('Error fetching Search Console data:', searchError)
      
      // If there's an API error, return helpful information
      return NextResponse.json({
        error: 'Failed to fetch Search Console data',
        details: searchError.message,
        suggestion: 'Make sure astrawatt.com is added and verified in your Google Search Console account',
        siteUrl
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in Google Search Console API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
