import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Set temporary environment variables with realistic Astrawatt.com data
    // This simulates what real Google Search Console data might look like
    
    process.env.TEMP_ASTRAWATT_DATA = JSON.stringify({
      avgPosition: 12.3,
      totalClicks: 89,
      totalImpressions: 2840,
      avgCTR: 3.13,
      keywordData: [
        { keyword: 'solar installation austin', position: 8, clicks: 23 },
        { keyword: 'austin solar company', position: 15, clicks: 12 },
        { keyword: 'solar panels austin tx', position: 9, clicks: 18 },
        { keyword: 'residential solar austin', position: 21, clicks: 8 }
      ],
      locationData: [
        { location: 'Austin', clicks: 45, impressions: 1200 },
        { location: 'Round Rock', clicks: 22, impressions: 680 },
        { location: 'Cedar Park', clicks: 15, impressions: 520 },
        { location: 'Pflugerville', clicks: 7, impressions: 440 }
      ]
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Sample data loaded. Refresh metrics to see realistic Astrawatt.com data.' 
    })
  } catch (error) {
    console.error('Error setting temp data:', error)
    return NextResponse.json(
      { error: 'Failed to load sample data' },
      { status: 500 }
    )
  }
}
