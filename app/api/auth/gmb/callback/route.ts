import { NextResponse, NextRequest } from 'next/server'
import { getGmbTokensFromCode } from '../../../../lib/gmb-auth'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL('/?auth=error&message=' + encodeURIComponent(error), request.url))
  }
  if (!code) {
    return NextResponse.redirect(new URL('/?auth=error&message=No authorization code received (GMB)', request.url))
  }

  try {
    const tokens = await getGmbTokensFromCode(code)
    process.env.GMB_ACCESS_TOKEN = tokens.access_token || ''
    if (tokens.refresh_token) {
      process.env.GMB_REFRESH_TOKEN = tokens.refresh_token
    }
    return NextResponse.redirect(new URL('/?auth=success&message=Google My Business connected successfully', request.url))
  } catch (e) {
    console.error('GMB auth callback error:', e)
    return NextResponse.redirect(new URL('/?auth=error&message=Failed to authenticate Google My Business', request.url))
  }
}
