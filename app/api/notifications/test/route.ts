import { NextResponse } from 'next/server'
import { isEmailConfigured, sendEmail } from '../../../lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const to = body?.to as string | undefined
    if (!isEmailConfigured()) {
      return NextResponse.json({ ok: false, error: 'Email SMTP not configured. Set SMTP_* and ALERT_EMAIL_FROM/USER/PASS/PORT.' }, { status: 400 })
    }
    const res = await sendEmail(
      'Test: Astrawatt Alerts',
      '<h2>Test Notification</h2><p>This is a test alert from your dashboard.</p>',
      undefined,
      to
    )
    return NextResponse.json({ ok: true, result: res })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}
