import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../lib/server-only'
import CitationMonitorService from '../../lib/citation-monitor'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get business info from database
    const businessInfoResult = await query(`
      SELECT business_name, phone, address, website 
      FROM solar_business_info 
      ORDER BY created_at DESC 
      LIMIT 1
    `)

    if (businessInfoResult.rows.length === 0) {
      return NextResponse.json({ 
        error: 'Business information not configured. Please complete setup first.' 
      }, { status: 400 })
    }

    const businessInfo = businessInfoResult.rows[0]
    const citationMonitor = new CitationMonitorService({
      name: businessInfo.business_name,
      phone: businessInfo.phone,
      address: businessInfo.address,
      website: businessInfo.website
    })

    // Check if we have recent citation data (within last 24 hours)
    const recentDataResult = await query(`
      SELECT * FROM solar_citations 
      WHERE last_checked > NOW() - INTERVAL '24 hours'
      ORDER BY last_checked DESC
    `)

    if (recentDataResult.rows.length > 0) {
      // Return cached data
      const citations = recentDataResult.rows.map(row => ({
        directory: row.directory_name,
        url: row.citation_url || '',
        businessName: row.found_business_name || '',
        phone: row.found_phone || '',
        address: row.found_address || '',
        website: row.found_website || '',
        status: row.status,
        lastChecked: new Date(row.last_checked),
        consistency: row.consistency_score,
        issues: row.issues ? JSON.parse(row.issues) : []
      }))

      const summary = await citationMonitor.generateCitationSummary(citations)
      const recommendations = await citationMonitor.getFixRecommendations(citations)

      return NextResponse.json({
        citations,
        summary,
        recommendations,
        fromCache: true
      })
    }

    // Perform fresh citation check
    const citations = await citationMonitor.checkAllCitations()
    
    // Store results in database
    for (const citation of citations) {
      await query(`
        INSERT INTO solar_citations (
          directory_name, citation_url, found_business_name, found_phone, 
          found_address, found_website, status, consistency_score, 
          issues, last_checked
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (directory_name) 
        DO UPDATE SET
          citation_url = EXCLUDED.citation_url,
          found_business_name = EXCLUDED.found_business_name,
          found_phone = EXCLUDED.found_phone,
          found_address = EXCLUDED.found_address,
          found_website = EXCLUDED.found_website,
          status = EXCLUDED.status,
          consistency_score = EXCLUDED.consistency_score,
          issues = EXCLUDED.issues,
          last_checked = EXCLUDED.last_checked
      `, [
        citation.directory,
        citation.url,
        citation.businessName,
        citation.phone,
        citation.address,
        citation.website,
        citation.status,
        citation.consistency,
        JSON.stringify(citation.issues),
        citation.lastChecked
      ])
    }

    const summary = await citationMonitor.generateCitationSummary(citations)
    const recommendations = await citationMonitor.getFixRecommendations(citations)

    return NextResponse.json({
      citations,
      summary,
      recommendations,
      fromCache: false
    })

  } catch (error: any) {
    console.error('Citation monitoring error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch citation data',
      details: error.message 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (action === 'refresh') {
      // Force refresh citation data
      await query('DELETE FROM solar_citations')
      
      return NextResponse.json({ 
        message: 'Citation cache cleared. Next request will fetch fresh data.' 
      })
    }

    return NextResponse.json({ 
      error: 'Invalid action' 
    }, { status: 400 })

  } catch (error: any) {
    console.error('Citation action error:', error)
    return NextResponse.json({ 
      error: 'Failed to perform citation action',
      details: error.message 
    }, { status: 500 })
  }
}
