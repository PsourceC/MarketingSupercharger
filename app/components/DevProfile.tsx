'use client'


import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiFetch } from '../services/api'

export default function DevProfile() {
  const [mounted, setMounted] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState({
    connected: 0,
    total: 9,
    overallStatus: 'pending'
  })

  useEffect(() => {
    setMounted(true)
    checkQuickStatus()
  }, [])

  const checkQuickStatus = async () => {
    try {
      const data = await apiFetch<any>('/service-status', { cache: 'no-cache', headers: { 'Cache-Control': 'no-cache' } }, 1)
      const services = data.services || {}
      const totalCount = Object.keys(services).length || 0
      const connectedCount = Object.values(services).filter((s: any) => s.status === 'working').length

      const percentage = totalCount ? connectedCount / totalCount : 0
      let overallStatus = 'disconnected'
      if (percentage >= 0.8) overallStatus = 'connected'
      else if (percentage >= 0.5 || connectedCount > 0) overallStatus = 'partial'

      setConnectionStatus({ connected: connectedCount, total: totalCount || 0, overallStatus })
      return
    } catch (error) {
      // swallow; will fallback to auth-only
    }

    // Fallback to auth-only check
    try {
      const authData = await apiFetch<any>('/auth/status', { cache: 'no-cache' })
      const connectedCount = authData.connected ? 1 : 0
      const totalCount = 1
      const overallStatus = connectedCount > 0 ? 'partial' : 'disconnected'
      setConnectionStatus({ connected: connectedCount, total: totalCount, overallStatus })
    } catch {}
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return '#10b981'
      case 'partial': return '#f59e0b'
      case 'error': return '#ef4444'
      case 'pending': return '#6b7280'
      default: return '#9ca3af'
    }
  }

  if (!mounted) {
    return (
      <div className="dev-profile">
        <div className="dev-profile-icon" style={{ backgroundColor: '#6b7280' }}>
          <span className="dev-icon">⚙️</span>
        </div>
      </div>
    )
  }

  return (
    <div className="dev-profile">
      <Link href="/dev-profile" className="dev-profile-link">
        <div
          className="dev-profile-icon"
          style={{ backgroundColor: getStatusColor(connectionStatus.overallStatus) }}
          title={`Connections: ${connectionStatus.connected}/${connectionStatus.total} - Click to manage`}
        >
          <span className="dev-icon">⚙️</span>
          <div className="connection-count">{connectionStatus.connected}/{connectionStatus.total}</div>
          <div className="status-ring" style={{ borderColor: getStatusColor(connectionStatus.overallStatus) }}></div>
        </div>
      </Link>
    </div>
  )
}
