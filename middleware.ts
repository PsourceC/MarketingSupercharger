import { NextRequest, NextResponse } from 'next/server'

import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Only apply middleware in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.next()
  }

  // Add CORS headers for better API stability during development
  const response = NextResponse.next()
  
  // Set CORS headers for all API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Cache-Control', 'no-store, max-age=0')
  }

  // Add development-specific headers for better hot reloading and preview embedding
  response.headers.set('Content-Security-Policy', 'frame-ancestors *')
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: response.headers })
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
