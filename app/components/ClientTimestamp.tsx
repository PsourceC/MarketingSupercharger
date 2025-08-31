'use client'

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

  return (
    <div className="last-updated">
      <span className="update-indicator">🔄</span>
      Updated: {mounted ? currentTime : '--:--:--'} • Fresh data every 15 minutes
    </div>
  )
}
