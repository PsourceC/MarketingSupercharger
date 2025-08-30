'use client'

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import './setup-styles.css'

interface SetupGuide {
  id: string
  name: string
  description: string
  category: 'critical' | 'high' | 'medium' | 'low'
  icon: string
  steps: string[]
  requirements: string[]
  timeEstimate: string
  difficulty: 'Easy' | 'Medium' | 'Advanced'
  tips?: string[]
}

interface ServiceStatus {
  status: 'working' | 'partial' | 'not-setup'
  message: string
}

interface ServiceStatuses {
  [key: string]: ServiceStatus
}

export default function SetupPage() {
  const [selectedService, setSelectedService] = useState<string>('database')
  const [serviceStatuses, setServiceStatuses] = useState<ServiceStatuses>({})
  const [statusLoading, setStatusLoading] = useState(true)

  // Handle URL parameters to auto-select service
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const serviceParam = urlParams.get('service')
    if (serviceParam) {
      setSelectedService(serviceParam)
    }
  }, [])

  // Fetch service statuses
  const fetchStatuses = async () => {
    setStatusLoading(true)
    const fetchWithTimeout = async (input: RequestInfo | URL, init: RequestInit = {}, timeoutMs = 8000) => {
      return await new Promise<Response>((resolve) => {
        const timeoutId = setTimeout(() => {
          resolve(new Response(JSON.stringify({ error: 'timeout' }), { status: 599, headers: { 'Content-Type': 'application/json' } }))
        }, timeoutMs)
        fetch(input, init)
          .then((res) => { clearTimeout(timeoutId); resolve(res) })
          .catch((err: any) => {
            clearTimeout(timeoutId)
            resolve(new Response(JSON.stringify({ error: err?.message || 'fetch failed' }), { status: 599, headers: { 'Content-Type': 'application/json' } }))
          })
      })
    }
    try {
      const response = await fetchWithTimeout('/api/service-status', { cache: 'no-cache', headers: { 'Cache-Control': 'no-cache' } }, 8000)
      const data = await response.json()
      setServiceStatuses(data.services || {})
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.warn('Service status fetch issue (non-fatal):', error?.message || error)
      }
    } finally {
      setStatusLoading(false)
    }
  }

  useEffect(() => {
    fetchStatuses()
  }, [])

  const setupGuides: SetupGuide[] = [
    {
      id: 'business-profile',
      name: 'Business Profile',
      description: 'Set your company name, website, and service areas to personalize competitor comparisons',
      category: 'critical',
      icon: '🏢',
      timeEstimate: '2-4 minutes',
      difficulty: 'Easy',
      requirements: [
        'Company name',
        'Website domain (e.g., example.com)',
        'Primary service area (e.g., Austin, TX)'
      ],
      steps: [
        'Enter your business name and website',
        'Specify your primary location (city, state)',
        'Add one or more service areas (comma or newline separated)',
        'Add 3-8 target keywords for tracking',
        'Save profile to enable tailored competitor comparisons'
      ],
      tips: [
        'Use your canonical domain (without http/https)',
        'List the top cities you actively serve',
        'Keywords should be realistic customer searches'
      ]
    },
    {
      id: 'database',
      name: 'Database (Neon)',
      description: 'Set up PostgreSQL database for storing rankings, metrics, and business data',
      category: 'critical',
      icon: '🗄️',
      timeEstimate: '5-10 minutes',
      difficulty: 'Easy',
      requirements: [
        'Valid email address',
        'Neon account (free tier available)',
        'Network access to neon.tech'
      ],
      steps: [
        'Click "Connect" button in the top menu of this dashboard',
        'Find "Neon" in the MCP integrations list',
        'Click "Connect to Neon"',
        'Sign up for Neon account at neon.tech if you don\'t have one',
        'Create a new project in Neon dashboard',
        'Copy your connection string from Neon project settings',
        'Paste the connection string when prompted in Builder.io',
        'Test the connection - you should see "Database Connected" status',
        'Return to Dev Profile to verify connection is working'
      ],
      tips: [
        'Neon offers a generous free tier perfect for getting started',
        'Your connection string contains sensitive credentials - never share it',
        'The database will automatically create necessary tables on first connection'
      ]
    },
    {
      id: 'google-search-console',
      name: 'Google Search Console',
      description: 'Connect to Google Search Console for real search ranking and performance data',
      category: 'critical',
      icon: '🔍',
      timeEstimate: '3-5 minutes',
      difficulty: 'Easy',
      requirements: [
        'Google account',
        'Verified website in Google Search Console',
        'Admin access to your website'
      ],
      steps: [
        'Scroll down to the "Google Search Console Connection" section on dev-profile page',
        'Click the "Connect with Google" button',
        'Sign in with your Google account',
        'Grant permission to access Search Console data',
        'Select your verified website property',
        'Confirm the connection',
        'Wait for initial data sync (may take a few minutes)',
        'Verify connection shows "Connected" status'
      ],
      tips: [
        'Make sure your website is verified in Google Search Console first',
        'You need admin/owner permissions for the website property',
        'Data will start appearing within 15-30 minutes after connection'
      ]
    },
    {
      id: 'ai-ranking-tracker',
      name: 'AI Ranking Tracker (Alternative)',
      description: 'AI-powered ranking tracking that bypasses Google Search Console DNS requirements',
      category: 'critical',
      icon: '🤖',
      timeEstimate: '2-3 minutes',
      difficulty: 'Easy',
      requirements: [
        'Neon database connection',
        'Keywords and locations to track'
      ],
      steps: [
        'Go to /auto-ranking page from the dashboard',
        'Configure your domain, keywords, and target locations',
        'Click "Run Ranking Check" to test the system',
        'Review the automation status and recent data',
        'Use "Run Now" button to manually trigger checks',
        'Schedule regular automated checks if desired'
      ],
      tips: [
        'Perfect alternative when you can\'t access DNS for Google Search Console',
        'Uses AI simulation and can be upgraded to real search APIs',
        'Tracks 6 solar keywords across 5 locations by default',
        'For real data, consider upgrading to SerpApi or Bright Data integration'
      ]
    },
    {
      id: 'brightdata',
      name: 'Bright Data Integration',
      description: 'Real search result scraping for accurate ranking data (replaces AI simulation)',
      category: 'critical',
      icon: '🔍',
      timeEstimate: '2-3 minutes',
      difficulty: 'Easy',
      requirements: [
        'Bright Data account',
        'API key from Bright Data dashboard'
      ],
      steps: [
        'Sign up for Bright Data account at brightdata.com',
        'Navigate to your Bright Data dashboard',
        'Go to API credentials section',
        'Generate a new API key for SERP scraping',
        'Copy the API key',
        'Paste the API key when prompted in Builder.io',
        'Test the connection to verify it works',
        'Configure keywords and locations for tracking'
      ],
      tips: [
        'Bright Data offers credits for new accounts',
        'API key enables real Google search result scraping',
        'Much more accurate than simulated ranking data',
        'Monitor your credit usage to avoid unexpected charges'
      ]
    },
    {
      id: 'google-my-business',
      name: 'Google My Business',
      description: 'Track reviews, ratings, and local business performance',
      category: 'high',
      icon: '🏪',
      timeEstimate: '10-15 minutes',
      difficulty: 'Medium',
      requirements: [
        'Google My Business account',
        'Verified business listing',
        'Business owner/manager access'
      ],
      steps: [
        'Set up Google My Business account at business.google.com',
        'Verify your business listing (by postcard, phone, or instant verification)',
        'Ensure you have manager or owner permissions',
        'In your GMB dashboard, go to Settings > Users',
        'Note your Business ID from the URL (numbers after /b/)',
        'Go to Google Cloud Console (console.cloud.google.com)',
        'Create a new project or select existing one',
        'Enable Google My Business API',
        'Create service account credentials',
        'Download the JSON credentials file',
        'Return to Builder.io setup and upload the credentials',
        'Enter your Business ID when prompted',
        'Test the connection'
      ],
      tips: [
        'Business verification can take 1-2 weeks if done by postcard',
        'You can start setup while verification is pending',
        'API access requires a Google Cloud project (free tier available)',
        'Keep your credentials file secure - it contains sensitive access keys'
      ]
    },
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      description: 'Website traffic and conversion tracking',
      category: 'high',
      icon: '📊',
      timeEstimate: '8-12 minutes',
      difficulty: 'Medium',
      requirements: [
        'Google Analytics account',
        'GA4 property set up',
        'Admin access to GA property'
      ],
      steps: [
        'Log in to Google Analytics (analytics.google.com)',
        'Ensure you have a GA4 property set up for your website',
        'Go to Admin section in GA',
        'Click on "Data API linking"',
        'Create a new Google Cloud project if needed',
        'Enable Google Analytics Reporting API',
        'Create service account in Google Cloud Console',
        'Download service account JSON file',
        'In GA Admin, add the service account email as a viewer',
        'Copy your GA4 Property ID (format: 123456789)',
        'Return to Builder.io and upload credentials',
        'Enter Property ID when prompted',
        'Test data retrieval'
      ],
      tips: [
        'Make sure you\'re using GA4, not Universal Analytics',
        'Service account needs Viewer permissions minimum',
        'Property ID is different from Measurement ID',
        'Data may take 24-48 hours to appear initially'
      ]
    },
    {
      id: 'citation-tracking',
      name: 'Citation Monitoring',
      description: 'Track business listings across directories (Moz Local, BrightLocal)',
      category: 'high',
      icon: '📍',
      timeEstimate: '15-20 minutes',
      difficulty: 'Advanced',
      requirements: [
        'Subscription to Moz Local or BrightLocal',
        'API access enabled',
        'Business listings already submitted'
      ],
      steps: [
        'Choose a citation tracking service (Moz Local or BrightLocal recommended)',
        'Sign up for a paid plan with API access',
        'In your service dashboard, find API settings',
        'Generate API key and secret',
        'Note your account ID or client ID',
        'Ensure your business listings are submitted and tracked',
        'Test API access with their documentation',
        'Return to Builder.io setup',
        'Enter API credentials when prompted',
        'Configure tracking parameters (location, keywords)',
        'Verify data is pulling correctly'
      ],
      tips: [
        'This requires a paid subscription to citation tracking services',
        'Start with free trials to test integration',
        'BrightLocal and Moz both offer reliable APIs',
        'Initial setup may take 1-2 weeks for full citation discovery'
      ]
    },
    {
      id: 'competitor-tracking',
      name: 'Competitor Tracking',
      description: 'Monitor competitor rankings and performance (SEMrush, Ahrefs)',
      category: 'medium',
      icon: '🎯',
      timeEstimate: '10-15 minutes',
      difficulty: 'Advanced',
      requirements: [
        'SEMrush or Ahrefs subscription',
        'API access plan',
        'Competitor domains identified'
      ],
      steps: [
        'Subscribe to SEMrush or Ahrefs with API access',
        'Log in to your account dashboard',
        'Navigate to API settings or developer section',
        'Generate API key',
        'Note your usage limits and credits',
        'Identify 3-5 main competitor domains',
        'Test API access using their documentation',
        'Return to Builder.io setup',
        'Enter API key and configure tracking',
        'Add competitor domains to monitor',
        'Set up keywords to track',
        'Schedule regular data pulls'
      ],
      tips: [
        'SEMrush and Ahrefs are premium tools with significant monthly costs',
        'Start with competitor domains you already know perform well',
        'Focus on local competitors in your service area',
        'API calls are usually limited, so configure wisely'
      ]
    },
    {
      id: 'email-notifications',
      name: 'Email Notifications',
      description: 'Send alerts for ranking changes and performance updates',
      category: 'medium',
      icon: '📧',
      timeEstimate: '5-8 minutes',
      difficulty: 'Easy',
      requirements: [
        'Email address for notifications',
        'SMTP server access (Gmail, Outlook, etc.)',
        'App-specific password if using Gmail'
      ],
      steps: [
        'Decide on notification email address',
        'If using Gmail, enable 2FA and create app-specific password',
        'For other providers, gather SMTP settings',
        'Return to Builder.io notification settings',
        'Enter SMTP server details (smtp.gmail.com for Gmail)',
        'Enter your email and app-specific password',
        'Configure notification triggers (ranking drops, errors, etc.)',
        'Set notification frequency (daily, weekly)',
        'Send test email to verify setup',
        'Customize notification content and format'
      ],
      tips: [
        'Gmail requires app-specific passwords for SMTP access',
        'Test with daily notifications first, then adjust frequency',
        'Set up filters in your email to organize alerts',
        'Consider creating a dedicated email for business notifications'
      ]
    },
    {
      id: 'slack-integration',
      name: 'Slack Integration',
      description: 'Daily performance reports and alerts in Slack',
      category: 'low',
      icon: '💬',
      timeEstimate: '8-10 minutes',
      difficulty: 'Medium',
      requirements: [
        'Slack workspace access',
        'Permission to install apps',
        'Dedicated channel for notifications'
      ],
      steps: [
        'Create a dedicated Slack channel (e.g., #seo-alerts)',
        'Go to your Slack workspace settings',
        'Navigate to Apps & Integrations',
        'Create a new Slack app or incoming webhook',
        'Generate webhook URL',
        'Copy the webhook URL',
        'Return to Builder.io Slack settings',
        'Paste webhook URL',
        'Configure notification types and frequency',
        'Set up message formatting preferences',
        'Send test message to verify setup',
        'Invite relevant team members to the channel'
      ],
      tips: [
        'Create a dedicated channel to avoid cluttering general channels',
        'Test notifications during business hours first',
        'Use Slack threading for detailed reports',
        'Consider different webhooks for alerts vs. reports'
      ]
    }
  ]

  const selectedGuide = setupGuides.find(g => g.id === selectedService) || setupGuides[0]

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
    if (statusLoading) {
      return {
        icon: '⏳',
        color: '#6b7280',
        bgColor: '#f3f4f6',
        text: 'Checking...'
      }
    }

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

  const BusinessProfileSettings = () => {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [name, setName] = useState('')
    const [website, setWebsite] = useState('')
    const [primary, setPrimary] = useState('')
    const [areas, setAreas] = useState('')
    const [keywords, setKeywords] = useState('')

    useEffect(() => {
      const load = async () => {
        try {
          const res = await fetch('/api/business', { cache: 'no-cache' })
          if (res.ok) {
            const data = await res.json()
            const p = data.profile || {}
            if (p.business_name) setName(p.business_name)
            if (p.website_url) setWebsite(p.website_url)
            if (p.primary_location) setPrimary(p.primary_location)
            if (Array.isArray(p.service_areas)) setAreas(p.service_areas.join(', '))
            if (Array.isArray(p.target_keywords)) setKeywords(p.target_keywords.join(', '))
          }
        } catch {}
      }
      load()
    }, [])

    const save = async () => {
      setLoading(true)
      setMessage('')
      try {
        const res = await fetch('/api/business', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_name: name,
            website_url: website,
            primary_location: primary,
            service_areas: areas,
            target_keywords: keywords
          })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to save profile')
        setMessage('Profile saved. Competitor comparisons will reflect your company.')
      } catch (e: any) {
        setMessage(e?.message || 'Error saving profile')
      } finally {
        setLoading(false)
      }
    }

    return (
      <div className="guide-section">
        <h3>🏢 Business Profile</h3>
        <div className="form-grid">
          <label className="form-label">Business Name</label>
          <input className="input-text" value={name} onChange={e => setName(e.target.value)} placeholder="Astrawatt Solar" />

          <label className="form-label">Website (domain or URL)</label>
          <input className="input-text" value={website} onChange={e => setWebsite(e.target.value)} placeholder="example.com" />

          <label className="form-label">Primary Location</label>
          <input className="input-text" value={primary} onChange={e => setPrimary(e.target.value)} placeholder="Austin, TX" />

          <label className="form-label">Service Areas</label>
          <textarea className="input-text" rows={2} value={areas} onChange={e => setAreas(e.target.value)} placeholder="Austin, TX; Round Rock, TX; Cedar Park, TX" />

          <label className="form-label">Target Keywords</label>
          <textarea className="input-text" rows={2} value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="solar installer, solar panels near me" />
        </div>
        <div className="email-actions">
          <button className="btn-secondary" disabled={loading} onClick={save}>💾 Save Profile</button>
        </div>
        {message && <p className="status-message">{message}</p>}
      </div>
    )
  }

  const EmailNotificationSettings = () => {
    const [recipientInput, setRecipientInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
      const load = async () => {
        try {
          const res = await fetch('/api/notifications/settings', { cache: 'no-cache' })
          if (res.ok) {
            const data = await res.json()
            const existing = Array.isArray(data.recipients) ? data.recipients.join(', ') : ''
            setRecipientInput(existing)
          }
        } catch {}
      }
      load()
    }, [])

    const save = async (sendTest?: boolean) => {
      setLoading(true)
      setMessage('')
      try {
        const res = await fetch('/api/notifications/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipients: recipientInput, sendTest: !!sendTest })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to save settings')
        setMessage(sendTest ? 'Saved and test email sent (if SMTP configured).' : 'Recipients saved.')
      } catch (e: any) {
        setMessage(e?.message || 'Error saving settings')
      } finally {
        setLoading(false)
      }
    }

    const sendTestOnly = async () => {
      setLoading(true)
      setMessage('')
      try {
        const res = await fetch('/api/notifications/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: recipientInput.split(/[;,\n\s]+/)[0] || '' })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to send test')
        setMessage('Test email sent (if SMTP configured).')
      } catch (e: any) {
        setMessage(e?.message || 'Error sending test')
      } finally {
        setLoading(false)
      }
    }

    return (
      <div className="guide-section">
        <h3>📧 Notification Recipients</h3>
        <p>Enter one or more emails (comma or space separated). We’ll use SMTP settings from project configuration.</p>
        <div className="email-settings-row">
          <input
            type="text"
            value={recipientInput}
            onChange={e => setRecipientInput(e.target.value)}
            placeholder="name@example.com, team@example.com"
            className="input-text"
          />
          <div className="email-actions">
            <button className="btn-secondary" disabled={loading} onClick={() => save(false)}>
              💾 Save
            </button>
            <button className="btn-secondary" disabled={loading} onClick={() => save(true)}>
              💾 Save & ✉️ Send Test
            </button>
            <button className="btn-secondary" disabled={loading} onClick={sendTestOnly}>
              ✉️ Send Test Only
            </button>
          </div>
        </div>
        {message && <p className="status-message">{message}</p>}
      </div>
    )
  }

  return (
    <div className="setup-page">
      {/* Header */}
      <div className="setup-header">
        <div className="header-left">
          <Link href="/dev-profile" className="back-button">
            ← Back to Dev Profile
          </Link>
          <div className="header-info">
            <h1>🔧 Service Setup Guide</h1>
            <p>Step-by-step instructions to connect all services for your solar business optimization</p>
          </div>
        </div>
      </div>

      <div className="setup-content">
        {/* Service Selector */}
        <div className="service-selector">
          <div className="selector-header">
            <h2>Choose a Service to Set Up</h2>
            <button
              onClick={fetchStatuses}
              disabled={statusLoading}
              className="refresh-button"
              title="Refresh service statuses"
            >
              {statusLoading ? '⏳' : '🔄'} Refresh
            </button>
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
                      {guide.id === 'google-search-console' && serviceStatuses['ai-ranking-tracker']?.status === 'working' && (
                        <span className="priority-badge">WORKAROUND ACTIVE</span>
                      )}
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

        {/* Selected Guide */}
        <div className="setup-guide">
          <div className="guide-header">
            <div className="guide-title">
              <span className="guide-icon">{selectedGuide.icon}</span>
              <div>
                <h2>{selectedGuide.name}</h2>
                <p>{selectedGuide.description}</p>
                {selectedGuide.id === 'google-search-console' && serviceStatuses['ai-ranking-tracker']?.status === 'working' && (
                  <p className="status-message">Active workaround: AI Ranking Tracker is live and supplying ranking data.</p>
                )}
              </div>
            </div>
            <div className="guide-meta">
              <span 
                className="priority-badge large"
                style={{ backgroundColor: getCategoryColor(selectedGuide.category) }}
              >
                {selectedGuide.category.toUpperCase()} PRIORITY
              </span>
              <div className="meta-row">
                <span className="time-estimate">⏱️ {selectedGuide.timeEstimate}</span>
                <span 
                  className="difficulty"
                  style={{ color: getDifficultyColor(selectedGuide.difficulty) }}
                >
                  📊 {selectedGuide.difficulty}
                </span>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="guide-section">
            <h3>📋 Prerequisites</h3>
            <ul className="requirements-list">
              {selectedGuide.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>

          {/* Setup Steps */}
          <div className="guide-section">
            <h3>🚀 Setup Steps</h3>
            <ol className="steps-list">
              {selectedGuide.steps.map((step, index) => (
                <li key={index} className="step-item">
                  <span className="step-number">{index + 1}</span>
                  <span className="step-text">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Tips */}
          {selectedGuide.tips && (
            <div className="guide-section">
              <h3>💡 Pro Tips</h3>
              <ul className="tips-list">
                {selectedGuide.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Email Notification Settings */}
          {selectedGuide.id === 'email-notifications' && (
            <EmailNotificationSettings />
          )}

          {/* Action Buttons */}
          <div className="guide-actions">
            <Link
              href="/dev-profile"
              className="btn-primary"
            >
              Return to Dev Profile
            </Link>
            <button
              className="btn-secondary"
              onClick={() => window.open(selectedGuide.id === 'database' ? 'https://neon.tech' :
                                     selectedGuide.id === 'google-search-console' ? 'https://search.google.com/search-console' :
                                     selectedGuide.id === 'google-my-business' ? 'https://business.google.com' :
                                     selectedGuide.id === 'google-analytics' ? 'https://analytics.google.com' :
                                     '#', '_blank')}
            >
              Open External Service
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
