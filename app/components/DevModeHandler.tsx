'use client'


import { useEffect } from 'react'

export default function DevModeHandler() {
  useEffect(() => {
    // Only run in development mode for generic dev/HMR noise
    if (process.env.NODE_ENV !== 'development') return

    // Handle hot reloading errors
    const handleError = (event: ErrorEvent) => {
      if (
        event.error?.message?.includes('Failed to fetch') ||
        event.error?.message?.includes('RSC payload') ||
        event.error?.stack?.includes('FullStory') ||
        event.error?.stack?.includes('edge.fullstory.com')
      ) {
        event.preventDefault()
        console.warn('Suppressed development/third-party error:', event.error?.message || String(event.error))
        return false
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason?.message?.includes('Failed to fetch') ||
        event.reason?.message?.includes('RSC payload') ||
        event.reason?.stack?.includes('FullStory')
      ) {
        event.preventDefault()
        console.warn('Suppressed development promise rejection:', event.reason?.message || String(event.reason))
      }
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    const originalConsoleError = console.error
    console.error = (...args) => {
      const message = args.join(' ')
      if (
        message.includes('Failed to fetch RSC payload') ||
        message.includes('FullStory') ||
        message.includes('edge.fullstory.com') ||
        message.includes('Falling back to browser navigation')
      ) {
        console.warn('[Filtered]', ...args)
        return
      }
      originalConsoleError(...args)
    }

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      console.error = originalConsoleError
    }
  }, [])

  // Always-on suppression for known third-party network errors (e.g., FullStory) in all environments
  useEffect(() => {
    const handleThirdPartyError = (event: ErrorEvent) => {
      const msg = event.error?.message || ''
      const stack = event.error?.stack || ''
      const filename = (event as any).filename || ''
      if (
        msg.includes('Failed to fetch') && (stack.includes('edge.fullstory.com') || filename.includes('fullstory')) ||
        stack.includes('edge.fullstory.com')
      ) {
        event.preventDefault()
        console.warn('[Suppressed third-party fetch error]', msg)
        return false
      }
    }

    const handleThirdPartyRejection = (event: PromiseRejectionEvent) => {
      const reason: any = event.reason
      const msg = reason?.message || String(reason || '')
      const stack = reason?.stack || ''
      if (
        msg.includes('Failed to fetch') && stack.includes('edge.fullstory.com')
      ) {
        event.preventDefault()
        console.warn('[Suppressed third-party fetch rejection]', msg)
      }
    }

    window.addEventListener('error', handleThirdPartyError)
    window.addEventListener('unhandledrejection', handleThirdPartyRejection)

    return () => {
      window.removeEventListener('error', handleThirdPartyError)
      window.removeEventListener('unhandledrejection', handleThirdPartyRejection)
    }
  }, [])

  // Handle Next.js fast refresh issues
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    const handleRouteChangeError = (err: Error) => {
      if (err.message.includes('Failed to fetch')) {
        console.warn('Router fetch error suppressed:', err.message)
        return false
      }
    }
    ;(window as any).__NEXT_ROUTE_ERROR_HANDLER__ = handleRouteChangeError
    return () => {
      delete (window as any).__NEXT_ROUTE_ERROR_HANDLER__
    }
  }, [])

  return null // This component doesn't render anything
}
