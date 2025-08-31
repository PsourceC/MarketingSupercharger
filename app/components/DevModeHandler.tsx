'use client'


import { useEffect } from 'react'

export default function DevModeHandler() {
  useEffect(() => {
    // Only run in development mode
    if (process.env.NODE_ENV !== 'development') return

    // Do not override window.fetch; suppress only noisy third‑party errors below

    // Handle hot reloading errors
    const handleError = (event: ErrorEvent) => {
      if (
        event.error?.message?.includes('Failed to fetch') ||
        event.error?.message?.includes('RSC payload') ||
        event.error?.stack?.includes('FullStory') ||
        event.error?.stack?.includes('edge.fullstory.com')
      ) {
        // Prevent these errors from breaking the app
        event.preventDefault()
        console.warn('Suppressed development/third-party error:', event.error.message)
        return false
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason?.message?.includes('Failed to fetch') ||
        event.reason?.message?.includes('RSC payload') ||
        event.reason?.stack?.includes('FullStory')
      ) {
        // Prevent these promise rejections from causing issues
        event.preventDefault()
        console.warn('Suppressed development promise rejection:', event.reason.message)
      }
    }

    // Add error listeners
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    // Improve hot reloading stability
    const originalConsoleError = console.error
    console.error = (...args) => {
      const message = args.join(' ')
      
      // Filter out known development noise
      if (
        message.includes('Failed to fetch RSC payload') ||
        message.includes('FullStory') ||
        message.includes('edge.fullstory.com') ||
        message.includes('Falling back to browser navigation')
      ) {
        // Log as warning instead of error
        console.warn('[Filtered]', ...args)
        return
      }

      // Log real errors normally
      originalConsoleError(...args)
    }

    // Cleanup function
    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      console.error = originalConsoleError
    }
  }, [])

  // Handle Next.js fast refresh issues
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    // Listen for Next.js router events
    const handleRouteChangeError = (err: Error) => {
      if (err.message.includes('Failed to fetch')) {
        console.warn('Router fetch error suppressed:', err.message)
        // Don't propagate the error
        return false
      }
    }

    // Add to window for Next.js router to use
    ;(window as any).__NEXT_ROUTE_ERROR_HANDLER__ = handleRouteChangeError

    return () => {
      delete (window as any).__NEXT_ROUTE_ERROR_HANDLER__
    }
  }, [])

  return null // This component doesn't render anything
}
