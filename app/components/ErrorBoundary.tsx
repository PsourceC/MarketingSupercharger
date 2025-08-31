'use client'

import React from 'react'
import * as Sentry from '@sentry/nextjs'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging but don't break the app
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Filter out known third-party script errors
    if (
      error.message.includes('Failed to fetch') ||
      error.message.includes('FullStory') ||
      error.message.includes('RSC payload') ||
      error.stack?.includes('edge.fullstory.com')
    ) {
      // These are likely third-party script issues, handle gracefully
      console.warn('Third-party script error detected, recovering...', error.message)
      
      // Reset error state after a short delay
      setTimeout(() => {
        this.setState({ hasError: false, error: undefined })
      }, 100)
      
      return
    }
    try {
      Sentry.captureException(error, { tags: { component: 'ErrorBoundary' }, extra: { errorInfo } })
    } catch {}
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Don't show error UI for known third-party issues
      if (
        this.state.error.message.includes('Failed to fetch') ||
        this.state.error.message.includes('FullStory') ||
        this.state.error.stack?.includes('edge.fullstory.com')
      ) {
        return this.props.children // Render normally
      }

      // Show custom fallback UI for other errors
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetErrorBoundary={this.resetErrorBoundary} />
      }

      // Default fallback UI
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>Error details</summary>
            {this.state.error.toString()}
          </details>
          <button onClick={this.resetErrorBoundary}>Try again</button>
        </div>
      )
    }

    return this.props.children
  }
}

// Custom hook to handle fetch errors gracefully
export function useSafeApi() {
  const safeFetch = async (url: string, options?: RequestInit) => {
    try {
      const response = await fetch(url, {
        ...options,
        // Add retry logic and better error handling
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return response
    } catch (error: any) {
      // Handle specific fetch errors gracefully
      if (error.message.includes('Failed to fetch')) {
        console.warn('Network fetch failed, retrying...', url)
        
        // Retry once after a short delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        try {
          const retryResponse = await fetch(url, options)
          if (retryResponse.ok) {
            return retryResponse
          }
        } catch (retryError) {
          console.error('Retry also failed:', retryError)
        }
      }
      
      throw error
    }
  }

  return { safeFetch }
}

export default ErrorBoundary
