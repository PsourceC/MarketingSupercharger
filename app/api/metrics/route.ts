import { NextResponse } from 'next/server'
import { setCredentials, getSearchConsoleData, calculateMetricsFromSearchConsole } from '../../lib/google-auth'

export async function GET() {
  try {
    // Check for temporary sample data first
    const tempData = process.env.TEMP_ASTRAWATT_DATA
    if (tempData) {
      try {
        const sampleData = JSON.parse(tempData)
        const metrics = [
          {
            id: 'search-ranking',
            title: 'Average Search Position',
            value: sampleData.avgPosition.toString(),
            change: 'Sample data - Set up Google OAuth for real data',
            changeType: sampleData.avgPosition <= 10 ? 'positive' : 'neutral',
            icon: '🎯',
            target: '< 5.0 avg position',
            priority: sampleData.avgPosition > 15 ? 'critical' : 'medium',
            explanation: 'Sample average search position for Astrawatt.com keywords',
            whyItMatters: 'Higher rankings (lower numbers) lead to more customer visibility'
          },
          {
            id: 'search-clicks',
            title: 'Search Clicks',
            value: sampleData.totalClicks.toString(),
            change: `${sampleData.totalImpressions} impressions (sample)`,
            changeType: 'positive',
            icon: '👆',
            target: 'Increase click rate',
            priority: 'medium',
            explanation: 'Sample clicks from Google Search for Astrawatt.com',
            whyItMatters: 'Shows potential customer discovery through search'
          },
          {
            id: 'search-ctr',
            title: 'Click-Through Rate',
            value: `${sampleData.avgCTR}%`,
            change: sampleData.avgCTR > 5 ? 'Good performance (sample)' : 'Room for improvement (sample)',
            changeType: sampleData.avgCTR > 5 ? 'positive' : 'neutral',
            icon: '📊',
            target: '> 5% CTR',
            priority: sampleData.avgCTR < 3 ? 'high' : 'medium',
            explanation: 'Sample click-through rate for Astrawatt.com listings',
            whyItMatters: 'Higher CTR indicates your titles and descriptions attract customers'
          }
        ]
        return NextResponse.json(metrics)
      } catch (parseError) {
        console.error('Error parsing temp data:', parseError)
      }
    }

    // Check if we have Google access token
    const accessToken = process.env.GOOGLE_ACCESS_TOKEN
    const siteUrl = process.env.GOOGLE_SITE_URL || 'https://www.astrawatt.com'

    let metrics = []

    if (accessToken) {
      try {
        // Set up Google auth with stored tokens
        const auth = setCredentials({
          access_token: accessToken,
          refresh_token: process.env.GOOGLE_REFRESH_TOKEN
        })

        // Fetch real Search Console data
        const searchConsoleData = await getSearchConsoleData(siteUrl, auth)
        const calculatedMetrics = calculateMetricsFromSearchConsole(searchConsoleData)

        metrics = [
          {
            id: 'search-ranking',
            title: 'Average Search Position',
            value: calculatedMetrics.avgPosition > 0 ? calculatedMetrics.avgPosition.toString() : 'No data',
            change: calculatedMetrics.avgPosition > 0 ? 'Live data from Google' : 'Getting data...',
            changeType: calculatedMetrics.avgPosition > 0 && calculatedMetrics.avgPosition <= 10 ? 'positive' : 'neutral',
            icon: '🎯',
            target: '< 5.0 avg position',
            priority: calculatedMetrics.avgPosition > 10 ? 'critical' : 'medium',
            explanation: 'Real-time average search position from Google Search Console',
            whyItMatters: 'Higher rankings (lower numbers) lead to more customer visibility and clicks'
          },
          {
            id: 'search-clicks',
            title: 'Search Clicks',
            value: calculatedMetrics.totalClicks.toString(),
            change: `${calculatedMetrics.totalImpressions} impressions`,
            changeType: calculatedMetrics.totalClicks > 0 ? 'positive' : 'neutral',
            icon: '👆',
            target: 'Increase click rate',
            priority: 'medium',
            explanation: 'Total clicks from Google Search in the last 30 days',
            whyItMatters: 'Direct measure of how many customers find your business through search'
          },
          {
            id: 'search-ctr',
            title: 'Click-Through Rate',
            value: `${calculatedMetrics.avgCTR}%`,
            change: calculatedMetrics.avgCTR > 5 ? 'Good performance' : 'Room for improvement',
            changeType: calculatedMetrics.avgCTR > 5 ? 'positive' : 'neutral',
            icon: '📊',
            target: '> 5% CTR',
            priority: calculatedMetrics.avgCTR < 3 ? 'high' : 'medium',
            explanation: 'Percentage of people who click when they see your listing',
            whyItMatters: 'Higher CTR indicates your titles and descriptions attract customers'
          }
        ]
      } catch (apiError) {
        console.error('Error fetching Google Search Console data:', apiError)
        // Fallback to connection status metrics
        metrics = getConnectionStatusMetrics('Google Search Console connected, but unable to fetch data. This may be normal for new connections.')
      }
    } else {
      // No access token - show connection needed metrics
      metrics = getConnectionStatusMetrics('Google Search Console API configured. Click "Authenticate with Google" to connect.')
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error in metrics API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics data' },
      { status: 500 }
    )
  }
}

function getConnectionStatusMetrics(message: string) {
  return [
    {
      id: 'search-ranking',
      title: 'Search Ranking',
      value: 'Ready to Connect',
      change: message,
      changeType: 'neutral',
      icon: '🎯',
      target: 'Authenticate with Google',
      priority: 'critical',
      explanation: 'Google Search Console API is configured and ready to authenticate',
      whyItMatters: 'Once connected, you will see real search ranking and performance data'
    },
    {
      id: 'gmb-reviews',
      title: 'Google Reviews',
      value: 'API Ready',
      change: 'Next: Set up Google My Business API',
      changeType: 'neutral',
      icon: '⭐',
      target: 'Connect GMB API',
      priority: 'high',
      explanation: 'Ready to connect Google My Business API for review tracking',
      whyItMatters: 'Real review tracking helps monitor reputation and ranking factors'
    },
    {
      id: 'citations',
      title: 'Directory Listings',
      value: 'Pending Setup',
      change: 'Set up citation monitoring service',
      changeType: 'neutral',
      icon: '🔗',
      target: 'Connect citation API',
      priority: 'medium',
      explanation: 'Connect to citation monitoring service (Moz Local, BrightLocal, etc.)',
      whyItMatters: 'Citation tracking ensures consistent business information across directories'
    }
  ]
}
