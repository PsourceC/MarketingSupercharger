import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  beforeSend(event) {
    const msg = (event.exception as any)?.values?.[0]?.value || ''
    if (typeof msg === 'string' && msg.includes('edge.fullstory.com')) {
      return null
    }
    return event
  },
})
