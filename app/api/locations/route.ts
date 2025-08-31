import { NextResponse } from 'next/server'
import { NextResponse } from 'next/server'
import { getLocationPerformance, query } from '../../lib/database'
import { getCityCoords } from '../../lib/geo'

export async function GET() {
  try {
    // Get real location data from Neon database
    const locations = await getLocationPerformance()

    // Pull configured service areas
    const cfg = await query(`
      SELECT service_areas
      FROM solar_business_info
      ORDER BY created_at DESC
      LIMIT 1
    `)
    const serviceAreas: string[] = Array.isArray(cfg.rows?.[0]?.service_areas) ? cfg.rows[0].service_areas : []

    // Merge DB locations with configured service areas (add missing with coords)
    const byName = new Map<string, any>(locations.map((l: any) => [String(l.name), l]))
    const merged: any[] = [...locations]

    for (const area of serviceAreas) {
      if (!byName.has(area)) {
        const coords = getCityCoords(area)
        if (coords) {
          merged.push({
            id: 'generated-' + area.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            name: area,
            lat: coords.lat,
            lng: coords.lng,
            overallScore: 0,
            keywordScores: {},
            population: 0,
            searchVolume: 0,
            lastUpdated: 'Untracked area',
            trends: []
          })
        }
      }
    }

    if (merged.length > 0) {
      return NextResponse.json(merged)
    }

    // Fallback if still no data
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
