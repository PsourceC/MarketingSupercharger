import { NextResponse } from 'next/server'
import { isEmailConfigured, sendEmail } from '../../../lib/email'

export async function POST() {
  try {
    if (!isEmailConfigured()) {
      return NextResponse.json({ ok: false, error: 'Email not configured. Set SMTP_* and ALERT_EMAIL_* env vars.' }, { status: 400 })
    }
    const res = await sendEmail(
      'Test: Astrawatt Alerts',
      '<h2>Test Notification</h2><p>This is a test alert from your dashboard.</p>'
    )
    return NextResponse.json({ ok: true, result: res })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}
