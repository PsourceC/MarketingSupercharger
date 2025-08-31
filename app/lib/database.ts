import { Pool } from 'pg'

// Create a connection pool for better performance
const connectionString = process.env.DATABASE_URL
let ssl: any = false
try {
  if (connectionString) {
    const url = new URL(connectionString)
    const host = url.hostname
    const sslMode = url.searchParams.get('sslmode')
    if (sslMode === 'require' || host.endsWith('neon.tech')) {
      ssl = { rejectUnauthorized: false }
    } else if (process.env.NODE_ENV === 'production') {
      ssl = { rejectUnauthorized: false }
    }
  } else if (process.env.NODE_ENV === 'production') {
    ssl = { rejectUnauthorized: false }
  }
} catch {
  if (process.env.NODE_ENV === 'production') {
    ssl = { rejectUnauthorized: false }
  }
}

const pool = new Pool({
  connectionString,
  ssl,
  max: 5, // Reduced from 10 to prevent connection exhaustion
  idleTimeoutMillis: 30000, // Reduced idle timeout
  connectionTimeoutMillis: 15000, // Increased connection timeout
  acquireTimeoutMillis: 30000, // Increased acquire timeout
  allowExitOnIdle: true,
})

// Helper function to execute queries with retry logic
export async function query(text: string, params?: any[], retries = 2) {
  let lastError: any

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const start = Date.now()
      const res = await pool.query(text, params)
      const duration = Date.now() - start
      console.log('Executed query', { text: text.substring(0, 100) + '...', duration, rows: res.rowCount })
      return res
    } catch (error: any) {
      lastError = error
      console.error(`Database query error (attempt ${attempt + 1}/${retries + 1}):`, error.message)

      // If it's a connection issue and we have retries left, wait and try again
      if (attempt < retries && (
        error.code === 'ECONNRESET' ||
        error.code === 'ENOTFOUND' ||
        error.message.includes('Connection terminated') ||
        error.message.includes('timeout')
      )) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))) // Exponential backoff
        continue
      }

      // If it's not a connection issue or we're out of retries, throw immediately
      break
    }
  }

  throw lastError
}

// Get current metrics from database
export async function getCurrentMetrics() {
  try {
    // Get average ranking across all keywords
    const avgRankingQuery = `
      SELECT AVG(ranking_position) as avg_position,
             SUM(clicks) as total_clicks,
             SUM(impressions) as total_impressions,
             AVG(ctr) as avg_ctr
      FROM solar_keyword_rankings 
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `
    
    const result = await query(avgRankingQuery)
    return result.rows[0]
  } catch (error) {
    console.error('Error fetching current metrics:', error)
    return {
      avg_position: 0,
      total_clicks: 0,
      total_impressions: 0,
      avg_ctr: 0
    }
  }
}

// Get location performance data
export async function getLocationPerformance() {
  try {
    const locationQuery = `
      SELECT 
        l.id,
        l.location_name as name,
        l.latitude as lat,
        l.longitude as lng,
        l.overall_score,
        l.population,
        l.search_volume,
        l.last_updated,
        COALESCE(AVG(kr.ranking_position), 0) as avg_ranking,
        COALESCE(SUM(kr.clicks), 0) as total_clicks,
        COALESCE(SUM(kr.impressions), 0) as total_impressions
      FROM solar_locations l
      LEFT JOIN solar_keyword_rankings kr ON l.id = kr.location_id
      GROUP BY l.id, l.location_name, l.latitude, l.longitude, l.overall_score, l.population, l.search_volume, l.last_updated
      ORDER BY l.overall_score DESC
    `
    
    const result = await query(locationQuery)
    
    // Transform data to match expected format
    return result.rows.map(row => {
      const avg = Number(row.avg_ranking || 0)
      const score = Number(row.overall_score || 0)
      const effective = score > 0 ? score : (avg > 0 ? Math.round(avg) : 0)
      return {
        id: row.id.toString(),
        name: row.name,
        lat: parseFloat(row.lat),
        lng: parseFloat(row.lng),
        overallScore: effective,
        keywordScores: {},
        population: parseInt(row.population || '0'),
        searchVolume: parseInt(row.search_volume || '0'),
        lastUpdated: row.last_updated?.toISOString() || new Date().toISOString(),
        trends: [
          {
            keyword: 'solar installation',
            change: Math.round((Math.random() - 0.5) * 10),
            changeText: `${avg > 0 ? 'Position ' + Math.round(avg) : 'No data'}`
          }
        ]
      }
    })
  } catch (error) {
    console.error('Error fetching location performance:', error)
    return []
  }
}

// Get priority actions from database
export async function getPriorityActions() {
  try {
    const actionsQuery = `
      SELECT 
        id,
        title,
        description,
        impact,
        effort,
        timeline,
        priority,
        category,
        completion_percentage,
        is_automatable as automatable,
        created_at
      FROM solar_priority_actions
      ORDER BY 
        CASE priority
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END,
        created_at DESC
    `
    
    const result = await query(actionsQuery)
    
    return result.rows.map(row => ({
      id: row.id.toString(),
      priority: row.priority,
      title: row.title,
      description: row.description,
      impact: row.impact,
      effort: row.effort,
      timeline: row.timeline,
      automatable: row.automatable,
      category: row.category,
      completionPercentage: row.completion_percentage,
      nextSteps: [] // Can be expanded with additional table
    }))
  } catch (error) {
    console.error('Error fetching priority actions:', error)
    return []
  }
}

// Add a new priority action
export async function addPriorityAction(action: any) {
  try {
    const insertQuery = `
      INSERT INTO solar_priority_actions 
      (title, description, impact, effort, timeline, priority, category, is_automatable)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `
    
    const result = await query(insertQuery, [
      action.title,
      action.description,
      action.impact,
      action.effort,
      action.timeline,
      action.priority,
      action.category,
      action.automatable
    ])
    
    return result.rows[0].id
  } catch (error) {
    console.error('Error adding priority action:', error)
    throw error
  }
}

// Store new ranking data
export async function storeRankingData(locationId: number, keyword: string, ranking: number, clicks?: number, impressions?: number) {
  try {
    const insertQuery = `
      INSERT INTO solar_keyword_rankings 
      (location_id, keyword, ranking_position, clicks, impressions, ctr)
      VALUES ($1, $2, $3, $4, $5, $6)
    `
    
    const ctr = impressions && impressions > 0 ? (clicks || 0) / impressions * 100 : 0
    
    await query(insertQuery, [
      locationId,
      keyword,
      ranking,
      clicks || 0,
      impressions || 0,
      ctr
    ])
  } catch (error) {
    console.error('Error storing ranking data:', error)
    throw error
  }
}

// Get business information
export async function getBusinessInfo() {
  try {
    const businessQuery = `
      SELECT business_name, website, service_areas, target_keywords
      FROM solar_business_info
      ORDER BY created_at DESC
      LIMIT 1
    `
    
    const result = await query(businessQuery)
    return result.rows[0] || {}
  } catch (error) {
    console.error('Error fetching business info:', error)
    return {}
  }
}

export default { query, getCurrentMetrics, getLocationPerformance, getPriorityActions, addPriorityAction, storeRankingData, getBusinessInfo }
