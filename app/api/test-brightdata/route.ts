import { NextResponse } from 'next/server'
import { brightData } from '../../lib/brightdata'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('Testing Bright Data connection...')
    
    // Test connection first
    const connectionTest = await brightData.testConnection()
    
    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        error: `Connection test failed: ${connectionTest.message}`,
        hasApiKey: !!process.env.BRIGHTDATA_API_KEY
      })
    }

    // Test a real search for solar keywords
    const testDomain = 'solarpowerworld.com' // A known solar industry site
    const testKeyword = 'solar installation'
    const testLocation = 'Phoenix, AZ'

    console.log(`Testing ranking check for "${testKeyword}" in "${testLocation}" for domain "${testDomain}"`)
    
    const rankingResult = await brightData.findDomainRanking(testKeyword, testDomain, testLocation)
    
    return NextResponse.json({
      success: true,
      connectionTest: connectionTest.message,
      testSearch: {
        keyword: testKeyword,
        location: testLocation,
        domain: testDomain,
        position: rankingResult.position,
        url: rankingResult.url,
        title: rankingResult.title,
        estimatedTraffic: rankingResult.estimatedTraffic
      },
      config: {
        hasApiKey: !!process.env.BRIGHTDATA_API_KEY,
        apiKeyLength: process.env.BRIGHTDATA_API_KEY?.length || 0
      }
    })
    
  } catch (error: any) {
    console.error('Bright Data test error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      config: {
        hasApiKey: !!process.env.BRIGHTDATA_API_KEY,
        apiKeyLength: process.env.BRIGHTDATA_API_KEY?.length || 0
      }
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { keyword, domain, location } = await request.json()
    
    if (!keyword || !domain) {
      return NextResponse.json({
        success: false,
        error: 'keyword and domain are required'
      }, { status: 400 })
    }

    console.log(`Custom test: ${keyword} for ${domain} in ${location || 'default location'}`)
    
    const rankingResult = await brightData.findDomainRanking(keyword, domain, location)
    
    return NextResponse.json({
      success: true,
      result: {
        keyword,
        domain,
        location: location || 'default',
        position: rankingResult.position,
        url: rankingResult.url,
        title: rankingResult.title,
        estimatedTraffic: rankingResult.estimatedTraffic
      }
    })
    
  } catch (error: any) {
    console.error('Custom Bright Data test error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
