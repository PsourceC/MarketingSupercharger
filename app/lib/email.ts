import nodemailer from 'nodemailer'

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
  return !!(cfg.host && cfg.port && cfg.user && cfg.pass && cfg.from && cfg.to)
}

export async function sendEmail(subject: string, html: string, text?: string) {
  const cfg = getConfig()
  if (!isEmailConfigured()) {
    console.warn('Email not configured; skipping send. Set SMTP_* and ALERT_EMAIL_* env vars.')
    return { sent: false, reason: 'not_configured' }
  }

  const transporter = nodemailer.createTransport({
    host: cfg.host!,
    port: cfg.port!,
    secure: cfg.secure ?? (cfg.port === 465),
    auth: { user: cfg.user!, pass: cfg.pass! },
  })

  const info = await transporter.sendMail({
    from: cfg.from!,
    to: cfg.to!,
    subject,
    text: text || html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    html,
  })
  return { sent: true, messageId: info.messageId }
}
