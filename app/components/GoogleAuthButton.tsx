'use client'

import { useState } from 'react'

export default function GoogleAuthButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [authStatus, setAuthStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle')

  const handleAuthenticate = async () => {
    setIsLoading(true)
    setAuthStatus('connecting')
    
    try {
      const response = await fetch('/api/auth/google')
      const data = await response.json()
      
      if (data.authUrl) {
        // Redirect to Google OAuth
        window.location.href = data.authUrl
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

  // Check for auth status from URL params
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    const authResult = urlParams.get('auth')
    
    if (authResult === 'success' && authStatus !== 'connected') {
      setAuthStatus('connected')
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (authResult === 'error' && authStatus !== 'error') {
      setAuthStatus('error')
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
        <p className="auth-error-message">
          ⚠️ Authentication failed. Please make sure your Google Search Console API is properly configured.
        </p>
      )}
    </div>
  )
}
