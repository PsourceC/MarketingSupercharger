'use client'


import { useState } from 'react'
import { apiFetch } from '../services/api'

export default function TempDataButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoadedData, setHasLoadedData] = useState(false)

  const loadSampleData = async () => {
    setIsLoading(true)
    
    try {
      // Simulate loading real-looking data for Astrawatt.com
      await apiFetch('/temp-data', { method: 'POST' })
      setHasLoadedData(true)
      
      // Trigger a refresh of the metrics
      window.location.reload()
    } catch (error) {
      console.error('Error loading sample data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (hasLoadedData) {
    return (
      <div className="temp-data-container">
        <p className="temp-data-message success">
          ✅ Sample data loaded! While you set up Google OAuth, you can see how the dashboard looks with realistic data.
        </p>
      </div>
    )
  }

  return (
    <div className="temp-data-container">
      <button
        onClick={loadSampleData}
        disabled={isLoading}
        className="temp-data-button"
      >
        {isLoading ? 'Loading Sample Data...' : '📊 Load Sample Data (While Setting Up Google)'}
      </button>
      <p className="temp-data-explanation">
        Click above to see realistic sample data while you configure Google OAuth. 
        This won't affect your real data setup.
      </p>
    </div>
  )
}
