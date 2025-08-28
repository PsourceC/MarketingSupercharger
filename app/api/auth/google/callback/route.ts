import { NextRequest, NextResponse } from 'next/server'
import { getTokensFromCode } from '../../../../lib/google-auth'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL('/?auth=error&message=' + encodeURIComponent(error), request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?auth=error&message=No authorization code received', request.url))
  }

  try {
    const tokens = await getTokensFromCode(code)
    
    // In a production app, you'd store these tokens securely (database, encrypted cookies, etc.)
    // For now, we'll redirect with success and the tokens would be stored server-side
    
    // Store tokens in environment variables for this session (temporary solution)
    process.env.GOOGLE_ACCESS_TOKEN = tokens.access_token || ''
    if (tokens.refresh_token) {
      process.env.GOOGLE_REFRESH_TOKEN = tokens.refresh_token
    }
    
    return NextResponse.redirect(new URL('/?auth=success&message=Google Search Console connected successfully', request.url))
  } catch (error) {
    console.error('Error exchanging code for tokens:', error)
    return NextResponse.redirect(new URL('/?auth=error&message=Failed to authenticate with Google', request.url))
  }
}
