'use client'

import { useState, useEffect } from 'react'

export default function ClientTimestamp() {
  const [mounted, setMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date().toLocaleString())
    
    // Update every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleString())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  if (!mounted) {
    return (
      <div className="last-updated">
        <span className="update-indicator">🔄</span>
        Updated: Loading... • Fresh data every 15 minutes
      </div>
    )
  }

  return (
    <div className="last-updated">
      <span className="update-indicator">🔄</span>
      Updated: {currentTime} • Fresh data every 15 minutes
    </div>
  )
}
