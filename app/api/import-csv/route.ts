import { NextRequest, NextResponse } from 'next/server'
import { query, storeRankingData } from '../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const { csvData } = await request.json()
    
    if (!csvData || typeof csvData !== 'string') {
      return NextResponse.json(
        { error: 'Invalid CSV data provided' },
        { status: 400 }
      )
    }

    // Parse CSV data
    const lines = csvData.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase())
    
    // Validate headers
    const requiredHeaders = ['keyword', 'location', 'position']
    const hasRequiredHeaders = requiredHeaders.every(header => 
      headers.includes(header)
    )
    
    if (!hasRequiredHeaders) {
      return NextResponse.json(
        { error: 'CSV must include columns: keyword, location, position' },
        { status: 400 }
      )
    }
    
    let importedCount = 0
    const errors = []

    // Process each data row
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim())
        
        if (values.length < headers.length) continue
        
        // Create data object
        const rowData: { [key: string]: string } = {}
        headers.forEach((header, index) => {
          rowData[header] = values[index] || ''
        })
        
        // Validate required fields
        if (!rowData.keyword || !rowData.location || !rowData.position) {
          errors.push(`Row ${i + 1}: Missing required fields`)
          continue
        }
        
        // Find or get location ID
        const locationResult = await query(
          'SELECT id FROM solar_locations WHERE location_name ILIKE $1',
          [rowData.location]
        )
        
        let locationId
        if (locationResult.rows.length > 0) {
          locationId = locationResult.rows[0].id
        } else {
          // Create new location if doesn't exist
          const newLocationResult = await query(
            'INSERT INTO solar_locations (location_name, latitude, longitude, overall_score, population, search_volume) VALUES ($1, 0, 0, 0, 0, 0) RETURNING id',
            [rowData.location]
          )
          locationId = newLocationResult.rows[0].id
        }
        
        // Parse numeric values
        const position = parseInt(rowData.position) || 0
        const clicks = parseInt(rowData.clicks || '0') || 0
        const impressions = parseInt(rowData.impressions || '0') || 0
        
        // Store ranking data
        await storeRankingData(
          locationId,
          rowData.keyword,
          position,
          clicks,
          impressions
        )
        
        importedCount++
        
      } catch (rowError) {
        console.error(`Error processing row ${i + 1}:`, rowError)
        errors.push(`Row ${i + 1}: ${rowError}`)
      }
    }
    
    // Update metrics after import
    await updateMetricsFromRankings()
    
    return NextResponse.json({
      success: true,
      imported: importedCount,
      errors: errors,
      message: `Successfully imported ${importedCount} ranking records`
    })
    
  } catch (error) {
    console.error('CSV import error:', error)
    return NextResponse.json(
      { error: 'Failed to import CSV data' },
      { status: 500 }
    )
  }
}

// Helper function to update aggregated metrics
async function updateMetricsFromRankings() {
  try {
    // Update solar_metrics table with calculated values
    const metricsQuery = `
      INSERT INTO solar_metrics (metric_type, metric_name, metric_value, change_value, change_type, priority)
      SELECT 
        'ranking' as metric_type,
        'average_position' as metric_name,
        ROUND(AVG(ranking_position)::numeric, 1)::text as metric_value,
        'Updated from CSV import' as change_value,
        CASE 
          WHEN AVG(ranking_position) <= 10 THEN 'positive'
          WHEN AVG(ranking_position) <= 20 THEN 'neutral'
          ELSE 'negative'
        END as change_type,
        CASE
          WHEN AVG(ranking_position) > 20 THEN 'critical'
          WHEN AVG(ranking_position) > 10 THEN 'high'
          ELSE 'medium'
        END as priority
      FROM solar_keyword_rankings
      WHERE created_at >= CURRENT_DATE
      ON CONFLICT (metric_type, metric_name) 
      DO UPDATE SET 
        metric_value = EXCLUDED.metric_value,
        change_value = EXCLUDED.change_value,
        change_type = EXCLUDED.change_type,
        priority = EXCLUDED.priority,
        updated_at = CURRENT_TIMESTAMP
    `
    
    await query(metricsQuery)
    
  } catch (error) {
    console.error('Error updating metrics from rankings:', error)
  }
}
