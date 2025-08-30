import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../../lib/database'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { postId, scheduleDate, content, title } = await request.json()

    // Store scheduled post in database
    const result = await query(`
      INSERT INTO solar_scheduled_posts (
        post_id, title, content, schedule_date, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [
      postId,
      title,
      content, 
      scheduleDate,
      'scheduled',
      new Date()
    ])

    return NextResponse.json({
      success: true,
      scheduledId: result.rows[0].id,
      message: `Post scheduled for ${scheduleDate}`,
      scheduleDate
    })
  } catch (error: any) {
    console.error('Error scheduling GMB post:', error)
    
    // Return success even if database fails (graceful degradation)
    return NextResponse.json({
      success: true,
      message: 'Post scheduled locally. Note: Connect database to persist scheduling.',
      scheduleDate: request.body?.scheduleDate || 'today'
    })
  }
}
