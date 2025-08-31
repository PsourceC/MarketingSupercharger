'use client'


import { useEffect, useState } from 'react'

interface HealthStatus {
  status: 'healthy' | 'warning' | 'error'
  database: boolean
  apis: boolean
  hotReload: boolean
  lastCheck: Date
  errors: string[]
}

export default function HealthCheck() {
  const [health, setHealth] = useState<HealthStatus>({
    status: 'warning',
    database: false,
    apis: false,
    hotReload: false,
    lastCheck: new Date(),
    errors: []
  })

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return

    const runHealthCheck = async () => {
      const errors: string[] = []
      let dbStatus = false
      let apiStatus = false

      try {
        // Check database connection
        const dbResponse = await fetch('/api/test-connection')
        if (dbResponse.ok) {
          const dbData = await dbResponse.json()
          dbStatus = dbData.status === 'connected'
        } else {
          errors.push('Database connection failed')
        }
      } catch (error) {
        errors.push('Database API unreachable')
      }

      try {
        // Check API endpoints
        const apiResponse = await fetch('/api/metrics')
        apiStatus = apiResponse.ok
        if (!apiStatus) {
          errors.push('Metrics API failed')
        }
      } catch (error) {
        errors.push('Metrics API unreachable')
      }

      // Check hot reload (assume it's working if we can run this code)
      const hotReloadStatus = true

      const overallStatus: HealthStatus['status'] = 
        dbStatus && apiStatus ? 'healthy' :
        dbStatus || apiStatus ? 'warning' : 'error'

      setHealth({
        status: overallStatus,
        database: dbStatus,
        apis: apiStatus,
        hotReload: hotReloadStatus,
        lastCheck: new Date(),
        errors
      })
    }

    // Run initial check
    runHealthCheck()

    // Run periodic checks less frequently to reduce load
    const interval = setInterval(runHealthCheck, 120000) // Every 2 minutes

    return () => clearInterval(interval)
  }, [])

  // Listen for errors to update health status
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (
        event.error?.message?.includes('Failed to fetch') ||
        event.error?.message?.includes('RSC payload')
      ) {
        setHealth(prev => ({
          ...prev,
          status: 'warning',
          errors: [...prev.errors.slice(-2), 'Network fetch issues detected']
        }))
      }
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (process.env.NODE_ENV !== 'development') return null

  const getStatusColor = () => {
    switch (health.status) {
      case 'healthy': return '#10b981'
      case 'warning': return '#f59e0b'
      case 'error': return '#ef4444'
    }
  }

  const getStatusIcon = () => {
    switch (health.status) {
      case 'healthy': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
    }
  }

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '12px',
        zIndex: 9999,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        minWidth: isVisible ? '200px' : 'auto'
      }}
      onClick={() => setIsVisible(!isVisible)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: getStatusColor() }}>
          {getStatusIcon()}
        </span>
        <span>System Status</span>
        {!isVisible && (
          <span style={{ color: getStatusColor() }}>
            {health.status.toUpperCase()}
          </span>
        )}
      </div>
      
      {isVisible && (
        <div style={{ marginTop: '8px', fontSize: '11px' }}>
          <div style={{ marginBottom: '4px' }}>
            Database: {health.database ? '✅' : '❌'}
          </div>
          <div style={{ marginBottom: '4px' }}>
            APIs: {health.apis ? '✅' : '❌'}
          </div>
          <div style={{ marginBottom: '4px' }}>
            Hot Reload: {health.hotReload ? '✅' : '❌'}
          </div>
          <div style={{ marginBottom: '4px', opacity: 0.7 }}>
            Last Check: {health.lastCheck.toLocaleTimeString()}
          </div>
          {health.errors.length > 0 && (
            <div style={{ marginTop: '8px', color: '#f59e0b' }}>
              <div>Recent Issues:</div>
              {health.errors.slice(-3).map((error, i) => (
                <div key={i} style={{ fontSize: '10px', opacity: 0.8 }}>
                  • {error}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
