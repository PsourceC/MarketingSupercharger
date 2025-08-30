import { NextResponse } from 'next/server'

import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if we have stored OAuth tokens
    const hasAccessToken = !!process.env.GOOGLE_ACCESS_TOKEN
    const hasRefreshToken = !!process.env.GOOGLE_REFRESH_TOKEN
    
    const isConnected = hasAccessToken || hasRefreshToken
    
    return NextResponse.json({
      connected: isConnected,
      hasAccessToken,
      hasRefreshToken,
      status: isConnected ? 'connected' : 'disconnected'
    })
  } catch (error) {
    console.error('Error checking auth status:', error)
    return NextResponse.json(
      { connected: false, error: 'Failed to check authentication status' },
      { status: 500 }
    )
  }
}
