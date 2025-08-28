'use client'

import { useState, useEffect } from 'react'

export default function GoogleAuthButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [authStatus, setAuthStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle')
  const [mounted, setMounted] = useState(false)

  // Handle client-side mounting and URL parameter checking
  useEffect(() => {
    setMounted(true)

    // Check for auth status from URL params only after mounting
    const urlParams = new URLSearchParams(window.location.search)
    const authResult = urlParams.get('auth')

    if (authResult === 'success') {
      setAuthStatus('connected')
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (authResult === 'error') {
      setAuthStatus('error')
    }
  }, [])

  const handleAuthenticate = async () => {
    setIsLoading(true)
    setAuthStatus('connecting')

    try {
      const response = await fetch('/api/auth/google')
      const data = await response.json()

      if (data.authUrl) {
        // Open in new tab to avoid iframe blocking issues
        const newTab = window.open(data.authUrl, '_blank', 'noopener,noreferrer')

        if (!newTab) {
          // Fallback to same tab if popup blocked
          window.location.href = data.authUrl
        } else {
          // Monitor for when tab closes or user returns
          const checkClosed = setInterval(() => {
            if (newTab.closed) {
              clearInterval(checkClosed)
              // Check for auth success on page
              setTimeout(() => {
                window.location.reload()
              }, 1000)
            }
          }, 1000)
        }
      } else {
        setAuthStatus('error')
        console.error('No auth URL received')
      }
    } catch (error) {
      setAuthStatus('error')
      console.error('Error initiating Google auth:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getButtonText = () => {
    switch (authStatus) {
      case 'connecting':
        return 'Connecting to Google...'
      case 'connected':
        return '✅ Google Search Console Connected'
      case 'error':
        return '❌ Connection Failed - Try Again'
      default:
        return '🔗 Connect Google Search Console'
    }
  }

  const getButtonClass = () => {
    const baseClass = 'google-auth-button'
    switch (authStatus) {
      case 'connected':
        return `${baseClass} connected`
      case 'error':
        return `${baseClass} error`
      case 'connecting':
        return `${baseClass} loading`
      default:
        return baseClass
    }
  }

  // Don't render different content until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="google-auth-container">
        <button className="google-auth-button" disabled>
          🔗 Connect Google Search Console
        </button>
        <p className="auth-setup-message">
          📋 <strong>OAuth may need setup.</strong> If this fails, add the redirect URI to Google Cloud Console or try sample data below.
        </p>
      </div>
    )
  }

  return (
    <div className="google-auth-container">
      <button
        onClick={handleAuthenticate}
        disabled={isLoading || authStatus === 'connected'}
        className={getButtonClass()}
      >
        {getButtonText()}
      </button>

      {authStatus === 'connected' && (
        <p className="auth-success-message">
          🎉 Successfully connected! Your dashboard will now show real Google Search Console data.
        </p>
      )}

      {authStatus === 'error' && (
        <div>
          <p className="auth-error-message">
            ⚠️ OAuth setup needed. Add this redirect URI to Google Cloud Console:
          </p>
          <code className="redirect-uri-code">
            https://da6999115c974d4388527cf50744332c-14cf5492-00a1-4a72-bec8-711809.fly.dev/api/auth/google/callback
          </code>
          <p className="auth-help-text">
            💡 <strong>Quick alternative:</strong> Use sample data below while setting up OAuth!
          </p>
        </div>
      )}

      {authStatus === 'idle' && (
        <p className="auth-setup-message">
          📋 <strong>OAuth may need setup.</strong> If this fails, add the redirect URI to Google Cloud Console or try sample data below.
        </p>
      )}
    </div>
  )
}
