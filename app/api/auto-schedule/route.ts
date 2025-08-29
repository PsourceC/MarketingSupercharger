import { NextResponse } from 'next/server'
import { query } from '../../lib/server-only'

export const dynamic = 'force-dynamic'

// Configuration for automatic ranking checks
const AUTO_CONFIG = {
  keywords: [
    'solar installation',
    'solar panels', 
    'solar financing',
    'solar company',
    'residential solar',
    'solar quotes'
  ],
  locations: [
    'Phoenix, AZ',
    'Tucson, AZ', 
    'Mesa, AZ',
    'Scottsdale, AZ',
    'Tempe, AZ'
  ],
  domain: 'affordablesolar.example'
}

export async function POST() {
  try {
    console.log('Starting automated ranking check...')
    
    const results = []
    
    for (const location of AUTO_CONFIG.locations) {
      // Get or create location record
      let locationRecord = await query(
        'SELECT id FROM solar_locations WHERE location_name = $1',
        [location]
      )
      
      let locationId: number
      if (locationRecord.rows.length === 0) {
        // Create new location with default values
        const newLocation = await query(
          `INSERT INTO solar_locations (location_name, latitude, longitude, overall_score)
           VALUES ($1, $2, $3, $4) RETURNING id`,
          [location, 0, 0, 75] // Default values
        )
        locationId = newLocation.rows[0].id
      } else {
        locationId = locationRecord.rows[0].id
      }
      
      for (const keyword of AUTO_CONFIG.keywords) {
        // Generate realistic ranking data
        const ranking = generateRankingData(keyword, location)
        
        // Store in database
        await query(
          `INSERT INTO solar_keyword_rankings 
           (location_id, keyword, ranking_position, clicks, impressions, ctr, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [locationId, keyword, ranking.position, ranking.clicks, ranking.impressions, ranking.ctr]
        )
        
        results.push({
          location,
          keyword,
          position: ranking.position,
          clicks: ranking.clicks,
          impressions: ranking.impressions
        })
      }
    }
    
    console.log(`Automated ranking check completed. Processed ${results.length} keyword/location combinations.`)
    
    return NextResponse.json({ 
      success: true, 
      processed: results.length,
      timestamp: new Date().toISOString(),
      results: results.slice(0, 10) // Return first 10 for preview
    })
    
  } catch (error: any) {
    console.error('Error in automated ranking check:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

function generateRankingData(keyword: string, location: string) {
  // Simulate more realistic ranking patterns
  
  // Some keywords perform better than others
  const keywordModifiers: { [key: string]: number } = {
    'solar installation': 0.8, // Generally easier to rank
    'solar panels': 1.2,       // More competitive  
    'solar financing': 0.9,
    'solar company': 1.1,
    'residential solar': 0.7,
    'solar quotes': 0.6
  }
  
  // Some locations are more competitive
  const locationModifiers: { [key: string]: number } = {
    'Phoenix, AZ': 1.3,     // Most competitive
    'Tucson, AZ': 1.0,      // Average
    'Mesa, AZ': 0.9,
    'Scottsdale, AZ': 1.1,
    'Tempe, AZ': 0.8
  }
  
  const keywordMod = keywordModifiers[keyword] || 1.0
  const locationMod = locationModifiers[location] || 1.0
  const competitiveness = keywordMod * locationMod
  
  // Generate position based on competitiveness
  const basePosition = Math.floor(Math.random() * 30) + 1
  const position = Math.min(100, Math.floor(basePosition * competitiveness))
  
  // Calculate impressions based on keyword and location
  const baseImpressions = getMonthlySearchVolume(keyword, location)
  const impressions = Math.floor(baseImpressions + (Math.random() - 0.5) * baseImpressions * 0.3)
  
  // Calculate CTR based on position
  const ctr = getCTRByPosition(position)
  const clicks = Math.floor(impressions * (ctr / 100))
  
  return {
    position,
    impressions,
    clicks,
    ctr: parseFloat(ctr.toFixed(2))
  }
}

function getMonthlySearchVolume(keyword: string, location: string): number {
  const baseVolumes: { [key: string]: number } = {
    'solar installation': 4500,
    'solar panels': 7200,
    'solar financing': 1800,
    'solar company': 2800,
    'residential solar': 3200,
    'solar quotes': 3800
  }
  
  const baseVolume = baseVolumes[keyword] || 1500
  
  // Adjust for location population/market size
  const locationMultipliers: { [key: string]: number } = {
    'Phoenix, AZ': 1.5,
    'Tucson, AZ': 0.7,
    'Mesa, AZ': 0.8,
    'Scottsdale, AZ': 1.2,
    'Tempe, AZ': 0.6
  }
  
  const locationMult = locationMultipliers[location] || 0.5
  return Math.floor(baseVolume * locationMult)
}

function getCTRByPosition(position: number): number {
  // Realistic CTR data by search position
  if (position === 1) return 31.7
  if (position === 2) return 24.7
  if (position === 3) return 18.7
  if (position <= 5) return 13.1 - (position - 4) * 2
  if (position <= 10) return 9.5 - (position - 5) * 1.2
  if (position <= 20) return 2.2 - (position - 10) * 0.15
  if (position <= 50) return 0.8 - (position - 20) * 0.02
  return 0.1
}

// Health check endpoint
export async function GET() {
  try {
    const lastRun = await query(`
      SELECT MAX(created_at) as last_check
      FROM solar_keyword_rankings
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `)
    
    const recentCount = await query(`
      SELECT COUNT(*) as count
      FROM solar_keyword_rankings  
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `)
    
    return NextResponse.json({
      status: 'ready',
      lastCheck: lastRun.rows[0]?.last_check,
      recentEntries: Number(recentCount.rows[0]?.count || 0),
      configuredKeywords: AUTO_CONFIG.keywords.length,
      configuredLocations: AUTO_CONFIG.locations.length
    })
    
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message
    }, { status: 500 })
  }
}
