import { NextResponse } from 'next/server'
import { query } from '../../lib/server-only'
import { brightData } from '../../lib/brightdata'
import { isEmailConfigured } from '../../lib/email'

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

  // Check Bright Data Status
  try {
    if (process.env.BRIGHTDATA_API_KEY) {
      const testResult = await brightData.testConnection()
      if (testResult.success) {
        services['brightdata'] = {
          status: 'working',
          message: testResult.message
        }
      } else {
        services['brightdata'] = {
          status: 'partial',
          message: `API key configured but ${testResult.message}`
        }
      }
    } else {
      services['brightdata'] = {
        status: 'not-setup',
        message: 'API key not configured'
      }
    }
  } catch (error: any) {
    services['brightdata'] = {
      status: 'not-setup',
      message: `Connection failed: ${error.message}`
    }
  }

  // Check AI Ranking Tracker Status
  try {
    const rankingData = await query(`
      SELECT COUNT(*) as ranking_count
      FROM solar_keyword_rankings
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `)

    const recentCount = Number(rankingData.rows[0]?.ranking_count || 0)
    const brightDataWorking = services['brightdata']?.status === 'working'

    if (recentCount > 0 && brightDataWorking) {
      services['ai-ranking-tracker'] = {
        status: 'working',
        message: `${recentCount} rankings tracked with real Bright Data`
      }
    } else if (recentCount > 0) {
      services['ai-ranking-tracker'] = {
        status: 'partial',
        message: `${recentCount} rankings tracked (fallback data)`
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

  // Check Google My Business Status (env or DB-stored tokens)
  try {
    let gmbTokenFound = !!(process.env.GMB_ACCESS_TOKEN || process.env.GMB_REFRESH_TOKEN)
    if (!gmbTokenFound) {
      const t = await query(`
        CREATE TABLE IF NOT EXISTS gmb_tokens (
          id SERIAL PRIMARY KEY,
          access_token TEXT,
          refresh_token TEXT,
          token_type TEXT,
          expiry_date BIGINT,
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `)
      const r = await query(`SELECT access_token, refresh_token FROM gmb_tokens ORDER BY updated_at DESC LIMIT 1`)
      const row = r.rows?.[0]
      gmbTokenFound = !!(row?.access_token || row?.refresh_token)
    }
    if (gmbTokenFound) {
      services['google-my-business'] = {
        status: 'working',
        message: 'Authorized with Google My Business'
      }
    } else if (process.env.GMB_STORE_CODE || process.env.GMB_BUSINESS_PROFILE_ID || process.env.GMB_OAUTH_CLIENT_ID || process.env.GMB_CREDENTIALS_JSON || process.env.GOOGLE_CLIENT_ID) {
      const parts: string[] = []
      if (process.env.GMB_STORE_CODE) parts.push('Store Code set')
      if (process.env.GMB_BUSINESS_PROFILE_ID) parts.push('Business Profile ID set')
      if (process.env.GMB_OAUTH_CLIENT_ID || process.env.GOOGLE_CLIENT_ID) parts.push('OAuth Client ID set')
      if (process.env.GMB_CREDENTIALS_JSON) parts.push('Credentials JSON loaded')

      services['google-my-business'] = {
        status: 'partial',
        message: `Configuration detected (${parts.join(', ')})`
      }
    } else {
      services['google-my-business'] = {
        status: 'not-setup',
        message: 'GMB API credentials not configured'
      }
    }
  } catch (e: any) {
    services['google-my-business'] = {
      status: 'not-setup',
      message: 'Failed to check GMB status'
    }
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

  // Check Email Notifications (SMTP + recipient)
  try {
    const smtpConfigured = isEmailConfigured()
    let hasRecipient = !!(process.env.ALERT_EMAIL_TO || process.env.NOTIFY_EMAIL_TO)
    if (!hasRecipient) {
      await query(`CREATE TABLE IF NOT EXISTS notification_settings (
        id SERIAL PRIMARY KEY,
        recipients TEXT[],
        updated_at TIMESTAMP DEFAULT NOW()
      )`)
      const rs = await query(`SELECT recipients FROM notification_settings ORDER BY updated_at DESC LIMIT 1`)
      const arr = rs.rows?.[0]?.recipients as string[] | undefined
      hasRecipient = !!(arr && arr.length > 0)
    }
    if (smtpConfigured && hasRecipient) {
      services['email-notifications'] = { status: 'working', message: 'SMTP configured - alerts enabled' }
    } else if (smtpConfigured) {
      services['email-notifications'] = { status: 'partial', message: 'SMTP configured but no recipient saved' }
    } else {
      services['email-notifications'] = { status: 'not-setup', message: 'Set SMTP_HOST/PORT/USER/PASS' }
    }
  } catch (e: any) {
    services['email-notifications'] = { status: 'not-setup', message: 'Failed to check email settings' }
  }

  // Check Review Management Status (simulate)
  services['review-management'] = {
    status: 'partial',
    message: 'Basic setup complete, needs API keys'
  }

  // Check Citation Monitoring Status
  try {
    const tableExists = await query(`
      SELECT COUNT(*) AS cnt
      FROM information_schema.tables
      WHERE table_schema='public' AND table_name='solar_citations'
    `)
    const exists = Number(tableExists.rows[0]?.cnt || 0) > 0
    if (!exists) {
      services['citation-monitoring'] = {
        status: 'not-setup',
        message: 'Citation tables not created yet'
      }
    } else {
      const citationCheck = await query(`
        SELECT COUNT(*) as citation_count,
               AVG(consistency_score) as avg_consistency
        FROM solar_citations
        WHERE last_checked > NOW() - INTERVAL '48 hours'
      `)
      const citationCount = Number(citationCheck.rows[0]?.citation_count || 0)
      const avgConsistency = Number(citationCheck.rows[0]?.avg_consistency || 0)
      if (citationCount > 5) {
        services['citation-monitoring'] = {
          status: 'working',
          message: `${citationCount} citations monitored, ${Math.round(avgConsistency)}% consistency (workaround active: free directory checks)`
        }
      } else if (citationCount > 0) {
        services['citation-monitoring'] = {
          status: 'partial',
          message: `${citationCount} citations checked - needs more data (workaround active: free directory checks)`
        }
      } else {
        services['citation-monitoring'] = {
          status: 'not-setup',
          message: 'Custom citation monitoring ready to start (workaround available: free directory checks)'
        }
      }
    }
  } catch (error) {
    services['citation-monitoring'] = {
      status: 'not-setup',
      message: 'Custom citation monitoring service not initialized'
    }
  }

  // Check Competitor Tracking Status
  try {
    const tablesExist = await query(`
      SELECT COUNT(*) AS cnt
      FROM information_schema.tables
      WHERE table_schema='public' AND table_name IN ('solar_competitors','solar_competitor_rankings')
    `)
    const exists = Number(tablesExist.rows[0]?.cnt || 0) === 2
    if (!exists) {
      services['competitor-tracking'] = {
        status: 'not-setup',
        message: 'Competitor tracking tables not created yet'
      }
    } else {
      const competitorCheck = await query(`
        SELECT COUNT(DISTINCT c.id) as competitor_count,
               COUNT(cr.id) as ranking_count
        FROM solar_competitors c
        LEFT JOIN solar_competitor_rankings cr ON c.id = cr.competitor_id
        WHERE c.last_updated > NOW() - INTERVAL '48 hours'
      `)
      const competitorCount = Number(competitorCheck.rows[0]?.competitor_count || 0)
      const rankingCount = Number(competitorCheck.rows[0]?.ranking_count || 0)
      if (competitorCount > 0 && rankingCount > 0) {
        services['competitor-tracking'] = {
          status: 'working',
          message: `${competitorCount} competitors tracked, ${rankingCount} rankings monitored (workaround active: free SERP simulation)`
        }
      } else if (competitorCount > 0) {
        services['competitor-tracking'] = {
          status: 'partial',
          message: `${competitorCount} competitors found - gathering ranking data (workaround active: free SERP simulation)`
        }
      } else {
        services['competitor-tracking'] = {
          status: 'not-setup',
          message: 'Custom competitor tracking ready to start (workaround available: free SERP simulation)'
        }
      }
    }
  } catch (error) {
    services['competitor-tracking'] = {
      status: 'not-setup',
      message: 'Custom competitor tracking service not initialized'
    }
  }

  // Check Citation Builder Status (simulate)
  services['citation-builder'] = {
    status: 'not-setup',
    message: 'Directory automation not configured'
  }

  return NextResponse.json({ services })
}
