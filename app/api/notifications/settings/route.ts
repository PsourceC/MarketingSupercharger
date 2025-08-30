import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../../lib/server-only'
import { sendEmail, isEmailConfigured } from '../../../lib/email'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await query(`CREATE TABLE IF NOT EXISTS notification_settings (
      id SERIAL PRIMARY KEY,
      recipients TEXT[],
      updated_at TIMESTAMP DEFAULT NOW()
    )`)

    const res = await query(`SELECT recipients, updated_at FROM notification_settings ORDER BY updated_at DESC LIMIT 1`)
    return NextResponse.json({
      recipients: res.rows?.[0]?.recipients || [],
      updatedAt: res.rows?.[0]?.updated_at || null
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const input = String(body.recipients || '').trim()
    const sendTest = !!body.sendTest

    const recipients = input
      .split(/[;,\n\s]+/)
      .map((s: string) => s.trim())
      .filter((s: string) => /.+@.+\..+/.test(s))

    if (recipients.length === 0) {
      return NextResponse.json({ error: 'No valid email addresses provided' }, { status: 400 })
    }

    await query(`CREATE TABLE IF NOT EXISTS notification_settings (
      id SERIAL PRIMARY KEY,
      recipients TEXT[],
      updated_at TIMESTAMP DEFAULT NOW()
    )`)

    await query(
      `INSERT INTO notification_settings (recipients, updated_at)
       VALUES ($1, NOW())`,
      [recipients]
    )

    let testResult: any = null
    if (sendTest && isEmailConfigured()) {
      testResult = await sendEmail(
        'Test: Astrawatt Alerts',
        '<h2>Test Notification</h2><p>This is a test alert from your dashboard.</p>',
        undefined,
        recipients[0]
      )
    }

    return NextResponse.json({ ok: true, recipients, testResult })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}
