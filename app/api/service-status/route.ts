import { NextResponse } from 'next/server'
import { query } from '../../lib/server-only'

export const dynamic = 'force-dynamic'

export async function GET() {
  const services: { [key: string]: { status: 'working' | 'partial' | 'not-setup'; message: string } } = {}

  // Check Database (Neon) Status
  try {
    const dbTest = await query('SELECT 1 AS test')
    const tableCheck = await query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('solar_locations', 'solar_keyword_rankings', 'solar_priority_actions', 'solar_business_info')
    `)
    
    const tableCount = Number(tableCheck.rows[0]?.table_count || 0)
    
    if (dbTest.rows[0]?.test === 1 && tableCount === 4) {
      services.database = { status: 'working', message: 'Database connected and tables created' }
    } else if (dbTest.rows[0]?.test === 1) {
      services.database = { status: 'partial', message: 'Database connected but missing tables' }
    } else {
      services.database = { status: 'not-setup', message: 'Database connection failed' }
    }
  } catch (error) {
    services.database = { status: 'not-setup', message: 'Database not connected' }
  }

  // Check AI Ranking Tracker Status
  try {
    const rankingData = await query(`
      SELECT COUNT(*) as ranking_count 
      FROM solar_keyword_rankings 
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `)
    
    const recentCount = Number(rankingData.rows[0]?.ranking_count || 0)
    
    if (recentCount > 0) {
      services['ai-ranking-tracker'] = { 
        status: 'working', 
        message: `${recentCount} rankings tracked in last 24h` 
      }
    } else {
      // Check if locations exist
      const locationCheck = await query('SELECT COUNT(*) as loc_count FROM solar_locations')
      const locationCount = Number(locationCheck.rows[0]?.loc_count || 0)
      
      if (locationCount > 0) {
        services['ai-ranking-tracker'] = { 
          status: 'partial', 
          message: 'Setup complete but no recent data' 
        }
      } else {
        services['ai-ranking-tracker'] = { 
          status: 'not-setup', 
          message: 'No locations configured' 
        }
      }
    }
  } catch (error) {
    services['ai-ranking-tracker'] = { status: 'not-setup', message: 'Service not configured' }
  }

  // Check Google Search Console Status (simulate - would need real Google auth check)
  services['google-search-console'] = { 
    status: 'not-setup', 
    message: 'Google authentication not configured' 
  }

  // Check Google My Business Status (simulate)
  services['google-my-business'] = { 
    status: 'not-setup', 
    message: 'GMB API credentials not configured' 
  }

  // Check Google Analytics Status (simulate)
  services['google-analytics'] = { 
    status: 'not-setup', 
    message: 'Analytics integration not configured' 
  }

  // Check Social Media Status (simulate)
  services['social-media'] = { 
    status: 'not-setup', 
    message: 'Social media accounts not connected' 
  }

  // Check Review Management Status (simulate)
  services['review-management'] = { 
    status: 'partial', 
    message: 'Basic setup complete, needs API keys' 
  }

  // Check Citation Builder Status (simulate)
  services['citation-builder'] = { 
    status: 'not-setup', 
    message: 'Directory automation not configured' 
  }

  return NextResponse.json({ services })
}
