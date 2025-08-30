import { NextResponse } from 'next/server'
import { query } from '../../lib/database'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Test basic database connectivity
    const result = await query('SELECT NOW() as current_time, version() as db_version')
    
    // Test if our solar tables exist
    const tableCheck = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'solar_%'
      ORDER BY table_name
    `)
    
    const tables = tableCheck.rows.map(row => row.table_name)
    
    return NextResponse.json({
      status: 'connected',
      database: {
        time: result.rows[0].current_time,
        version: result.rows[0].db_version,
        connection: 'successful'
      },
      tables: {
        count: tables.length,
        list: tables,
        required: [
          'solar_locations', 'solar_keyword_rankings', 'solar_priority_actions',
          'solar_business_info', 'solar_citations', 'solar_competitors', 
          'solar_competitor_rankings', 'solar_financing_requests',
          'solar_scheduled_posts', 'solar_published_posts'
        ]
      }
    })
  } catch (error: any) {
    console.error('Database connection test failed:', error)
    return NextResponse.json({
      status: 'failed',
      error: error.message,
      database: {
        connection: 'failed',
        configured: !!process.env.DATABASE_URL
      }
    }, { status: 500 })
  }
}
