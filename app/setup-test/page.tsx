'use client'

import { useState } from 'react'
import Link from 'next/link'
import '../setup/setup-styles.css'

interface SetupGuide {
  id: string
  name: string
  description: string
  category: 'critical' | 'high' | 'medium' | 'low'
  icon: string
  timeEstimate: string
  difficulty: 'Easy' | 'Medium' | 'Advanced'
}

interface ServiceStatus {
  status: 'working' | 'partial' | 'not-setup'
  message: string
}

export default function SetupTestPage() {
  const [selectedService, setSelectedService] = useState<string>('database')

  // Mock service statuses for demonstration
  const serviceStatuses: { [key: string]: ServiceStatus } = {
    'database': { status: 'working', message: 'Database connected and tables created' },
    'ai-ranking-tracker': { status: 'working', message: '30 rankings tracked in last 24h' },
    'google-search-console': { status: 'not-setup', message: 'Google authentication not configured' },
    'google-my-business': { status: 'partial', message: 'GMB setup started but API keys missing' },
    'google-analytics': { status: 'not-setup', message: 'Analytics integration not configured' },
    'social-media': { status: 'partial', message: 'Facebook connected, Instagram pending' },
    'review-management': { status: 'working', message: 'Monitoring 3 review platforms' },
    'citation-builder': { status: 'not-setup', message: 'Directory automation not configured' }
  }

  const setupGuides: SetupGuide[] = [
    {
      id: 'database',
      name: 'Database (Neon)',
      description: 'Set up PostgreSQL database for storing rankings, metrics, and business data',
      category: 'critical',
      icon: '🗄️',
      timeEstimate: '5-10 minutes',
      difficulty: 'Easy'
    },
    {
      id: 'google-search-console',
      name: 'Google Search Console',
      description: 'Connect to Google Search Console for real search ranking and performance data',
      category: 'critical',
      icon: '🔍',
      timeEstimate: '3-5 minutes',
      difficulty: 'Easy'
    },
    {
      id: 'ai-ranking-tracker',
      name: 'AI Ranking Tracker (Alternative)',
      description: 'AI-powered ranking tracking that bypasses Google Search Console DNS requirements',
      category: 'critical',
      icon: '🤖',
      timeEstimate: '2-3 minutes',
      difficulty: 'Easy'
    },
    {
      id: 'google-my-business',
      name: 'Google My Business',
      description: 'Track reviews, ratings, and local business performance',
      category: 'high',
      icon: '🏪',
      timeEstimate: '10-15 minutes',
      difficulty: 'Medium'
    },
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      description: 'Website traffic and conversion tracking',
      category: 'high',
      icon: '📊',
      timeEstimate: '5-8 minutes',
      difficulty: 'Easy'
    },
    {
      id: 'social-media',
      name: 'Social Media Integration',
      description: 'Connect Facebook, Instagram, and other social platforms',
      category: 'medium',
      icon: '📱',
      timeEstimate: '15-20 minutes',
      difficulty: 'Medium'
    },
    {
      id: 'review-management',
      name: 'Review Management',
      description: 'Monitor and respond to reviews across all platforms',
      category: 'high',
      icon: '⭐',
      timeEstimate: '8-12 minutes',
      difficulty: 'Medium'
    },
    {
      id: 'citation-builder',
      name: 'Citation Builder',
      description: 'Automate business directory listings and citations',
      category: 'medium',
      icon: '🔗',
      timeEstimate: '20-30 minutes',
      difficulty: 'Advanced'
    }
  ]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'critical': return '#ef4444'
      case 'high': return '#f59e0b'
      case 'medium': return '#3b82f6'
      case 'low': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#10b981'
      case 'Medium': return '#f59e0b'
      case 'Advanced': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getStatusIndicator = (serviceId: string) => {
    const status = serviceStatuses[serviceId]
    if (!status) {
      return {
        icon: '❓',
        color: '#6b7280',
        bgColor: '#f3f4f6',
        text: 'Unknown'
      }
    }

    switch (status.status) {
      case 'working':
        return {
          icon: '👍',
          color: '#ffffff',
          bgColor: '#10b981',
          text: 'Working'
        }
      case 'partial':
        return {
          icon: '➖',
          color: '#ffffff',
          bgColor: '#f59e0b',
          text: 'Partial'
        }
      case 'not-setup':
        return {
          icon: '👎',
          color: '#ffffff',
          bgColor: '#ef4444',
          text: 'Not Setup'
        }
      default:
        return {
          icon: '❓',
          color: '#6b7280',
          bgColor: '#f3f4f6',
          text: 'Unknown'
        }
    }
  }

  const selectedGuide = setupGuides.find(g => g.id === selectedService) || setupGuides[0]

  return (
    <div className="setup-page">
      {/* Header */}
      <div className="setup-header">
        <div className="header-left">
          <Link href="/setup" className="back-button">
            ← Back to Real Setup
          </Link>
          <div className="header-info">
            <h1>🧪 Status Indicators Demo</h1>
            <p>Demo of service status indicators with mock data (Red/Yellow/Green system)</p>
          </div>
        </div>
      </div>

      <div className="setup-content">
        {/* Service Selector */}
        <div className="service-selector">
          <div className="selector-header">
            <h2>Choose a Service to Set Up</h2>
            <div className="status-legend">
              <span className="legend-item">
                <span className="status-indicator" style={{ backgroundColor: '#ef4444', color: '#ffffff' }}>
                  👎 Not Setup
                </span>
              </span>
              <span className="legend-item">
                <span className="status-indicator" style={{ backgroundColor: '#f59e0b', color: '#ffffff' }}>
                  ➖ Partial
                </span>
              </span>
              <span className="legend-item">
                <span className="status-indicator" style={{ backgroundColor: '#10b981', color: '#ffffff' }}>
                  👍 Working
                </span>
              </span>
            </div>
          </div>
          <div className="service-grid">
            {setupGuides.map(guide => (
              <button
                key={guide.id}
                className={`service-card ${selectedService === guide.id ? 'selected' : ''}`}
                onClick={() => setSelectedService(guide.id)}
              >
                <div className="service-header">
                  <span className="service-icon">{guide.icon}</span>
                  <div className="service-info">
                    <h3>{guide.name}</h3>
                    <div className="badges-row">
                      <span 
                        className="priority-badge"
                        style={{ backgroundColor: getCategoryColor(guide.category) }}
                      >
                        {guide.category.toUpperCase()}
                      </span>
                      <span 
                        className="status-indicator"
                        style={{ 
                          backgroundColor: getStatusIndicator(guide.id).bgColor,
                          color: getStatusIndicator(guide.id).color
                        }}
                        title={serviceStatuses[guide.id]?.message || 'Status unknown'}
                      >
                        {getStatusIndicator(guide.id).icon} {getStatusIndicator(guide.id).text}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="service-description">{guide.description}</p>
                {serviceStatuses[guide.id] && (
                  <p className="status-message">{serviceStatuses[guide.id].message}</p>
                )}
                <div className="service-meta">
                  <span className="time-estimate">⏱️ {guide.timeEstimate}</span>
                  <span 
                    className="difficulty"
                    style={{ color: getDifficultyColor(guide.difficulty) }}
                  >
                    📊 {guide.difficulty}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Guide Info */}
        <div className="setup-guide">
          <div className="guide-header">
            <div className="guide-title">
              <span className="guide-icon">{selectedGuide.icon}</span>
              <div>
                <h2>{selectedGuide.name}</h2>
                <p>{selectedGuide.description}</p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <span 
                    className="priority-badge large"
                    style={{ backgroundColor: getCategoryColor(selectedGuide.category) }}
                  >
                    {selectedGuide.category.toUpperCase()} PRIORITY
                  </span>
                  <span 
                    className="status-indicator"
                    style={{ 
                      backgroundColor: getStatusIndicator(selectedGuide.id).bgColor,
                      color: getStatusIndicator(selectedGuide.id).color,
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.8rem'
                    }}
                  >
                    {getStatusIndicator(selectedGuide.id).icon} {getStatusIndicator(selectedGuide.id).text}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="status-demo-info">
            <h3>🎯 Status Indicator System</h3>
            <div className="status-explanations">
              <div className="status-explanation">
                <span className="status-indicator" style={{ backgroundColor: '#ef4444', color: '#ffffff' }}>
                  👎 Red - Not Setup
                </span>
                <p>Service is not configured or connected. Setup required.</p>
              </div>
              <div className="status-explanation">
                <span className="status-indicator" style={{ backgroundColor: '#f59e0b', color: '#ffffff' }}>
                  ➖ Yellow - Partial
                </span>
                <p>Service is partially configured but needs additional setup or has issues.</p>
              </div>
              <div className="status-explanation">
                <span className="status-indicator" style={{ backgroundColor: '#10b981', color: '#ffffff' }}>
                  👍 Green - Working
                </span>
                <p>Service is fully configured and working as expected.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
