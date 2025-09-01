import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const updates = [
      {
        id: `setup-${Date.now()}`,
        timestamp: new Date(),
        type: 'technical',
        location: 'Dashboard Setup',
        message: 'Dashboard converted to use real API calls - connect your data sources to see live updates',
        impact: 'neutral',
        priority: 'high'
      }
    ]

    return NextResponse.json(updates)
  } catch (error) {
    console.error('Error fetching recent updates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent updates' },
      { status: 500 }
    )
  }
}
