import { NextResponse } from 'next/server'
import { getGmbAuthUrl } from '../../../lib/gmb-auth'

export async function GET() {
  try {
    const authUrl = getGmbAuthUrl()
    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error('Error generating GMB auth URL:', error)
    return NextResponse.json({ error: 'Failed to generate GMB authentication URL' }, { status: 500 })
  }
}
