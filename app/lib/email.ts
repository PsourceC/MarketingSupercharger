import nodemailer from 'nodemailer'

import { query } from './database'

export interface EmailConfig {
  host?: string
  port?: number
  secure?: boolean
  user?: string
  pass?: string
  from?: string
  to?: string
}

function getConfig(): EmailConfig {
  return {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : undefined,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.ALERT_EMAIL_FROM || process.env.SMTP_USER,
    to: process.env.ALERT_EMAIL_TO,
  }
}

export function isEmailConfigured() {
  const cfg = getConfig()
  // Only require SMTP creds here; recipient may be stored in DB
  return !!(cfg.host && cfg.port && cfg.user && cfg.pass && cfg.from)
}

async function resolveStoredRecipient(): Promise<string | null> {
  try {
    const res = await query(
      `CREATE TABLE IF NOT EXISTS notification_settings (
         id SERIAL PRIMARY KEY,
         recipients TEXT[],
         updated_at TIMESTAMP DEFAULT NOW()
       );`
    )
    const rows = await query(
      `SELECT recipients FROM notification_settings ORDER BY updated_at DESC LIMIT 1`
    )
    const arr = rows.rows?.[0]?.recipients as string[] | undefined
    if (arr && arr.length > 0) return arr[0]
  } catch (e) {
    // ignore
  }
  return null
}

export async function sendEmail(subject: string, html: string, text?: string, toOverride?: string) {
  const cfg = getConfig()
  if (!isEmailConfigured()) {
    console.warn('Email SMTP not configured; skipping send. Set SMTP_* and ALERT_EMAIL_FROM/USER.')
    return { sent: false, reason: 'not_configured' }
  }

  const to = toOverride || cfg.to || await resolveStoredRecipient()
  if (!to) {
    console.warn('No recipient configured; set ALERT_EMAIL_TO or save recipients in settings.')
    return { sent: false, reason: 'no_recipient' }
  }

  const transporter = nodemailer.createTransport({
    host: cfg.host!,
    port: cfg.port!,
    secure: cfg.secure ?? (cfg.port === 465),
    auth: { user: cfg.user!, pass: cfg.pass! },
  })

  const info = await transporter.sendMail({
    from: cfg.from!,
    to,
    subject,
    text: text || html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    html,
  })
  return { sent: true, messageId: info.messageId }
}
