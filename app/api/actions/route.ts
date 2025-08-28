import { NextResponse } from 'next/server'
import { getPriorityActions, addPriorityAction } from '../../lib/database'

export async function GET() {
  try {
    // Get real priority actions from Neon database
    const actions = await getPriorityActions()

    if (actions && actions.length > 0) {
      return NextResponse.json(actions)
    }

    // If no actions in database, add some initial ones for Astrawatt
    const initialActions = [
      {
        title: 'Connect Google Search Console OAuth',
        description: 'Complete Google OAuth setup to get real ranking and click data for astrawatt.com',
        impact: 'Real-time ranking monitoring and customer discovery insights',
        effort: 'Medium',
        timeline: 'Today',
        priority: 'critical',
        category: 'Technical',
        automatable: false
      },
      {
        title: 'Optimize Austin Market Rankings',
        description: 'Focus SEO efforts on Austin metro area where search volume is highest (12,400 monthly searches)',
        impact: 'Capture more customers in primary service area',
        effort: 'High',
        timeline: 'This month',
        priority: 'high',
        category: 'SEO',
        automatable: false
      },
      {
        title: 'Set Up Review Monitoring',
        description: 'Connect Google My Business and other review platforms to track reputation',
        impact: 'Monitor and respond to customer feedback automatically',
        effort: 'Medium',
        timeline: 'This week',
        priority: 'high',
        category: 'Reviews',
        automatable: true
      }
    ]

    // Add initial actions to database
    for (const action of initialActions) {
      await addPriorityAction(action)
    }

    // Return the newly created actions
    const newActions = await getPriorityActions()
    return NextResponse.json(newActions)

  } catch (error) {
    console.error('Error fetching priority actions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch priority actions' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const action = await request.json()
    const actionId = await addPriorityAction(action)

    return NextResponse.json({
      success: true,
      id: actionId,
      message: 'Priority action added successfully'
    })
  } catch (error) {
    console.error('Error adding priority action:', error)
    return NextResponse.json(
      { error: 'Failed to add priority action' },
      { status: 500 }
    )
  }
}
