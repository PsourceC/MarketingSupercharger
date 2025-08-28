import { NextResponse } from 'next/server'
import { getLocationPerformance } from '../../lib/database'

export async function GET() {
  try {
    // Get real location data from Neon database
    const locations = await getLocationPerformance()

    if (locations && locations.length > 0) {
      return NextResponse.json(locations)
    }

    // Fallback if no data in database yet
    const fallbackLocations = [
      {
        id: 'database-connected',
        name: 'Database Connected - Add Real Data',
        lat: 30.2672,
        lng: -97.7431,
        overallScore: 0,
        keywordScores: {},
        population: 0,
        searchVolume: 0,
        lastUpdated: 'Database ready for data',
        trends: [
          {
            keyword: 'Database ready',
            change: 0,
            changeText: 'Neon database connected. Add ranking data via Google Search Console or ranking APIs'
          }
        ]
      }
    ]

    return NextResponse.json(fallbackLocations)
  } catch (error) {
    console.error('Error fetching location data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch location data' },
      { status: 500 }
    )
  }
}
