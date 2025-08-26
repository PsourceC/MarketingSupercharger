'use client'

import { useState } from 'react'

interface HelpItem {
  id: string
  title: string
  description: string
  category: 'metrics' | 'map' | 'automation' | 'general'
  icon: string
}

interface HelpTip {
  id: string
  content: string
  position: 'top' | 'bottom' | 'left' | 'right'
}

const helpItems: HelpItem[] = [
  {
    id: 'avg-position',
    title: 'Average Position',
    description: 'This shows where your business appears in Google search results on average. Lower numbers are better (position 1 is the top result). For solar companies, being in the top 5 (positions 1-5) is crucial for getting customers.',
    category: 'metrics',
    icon: '🎯'
  },
  {
    id: 'visibility-score',
    title: 'Visibility Score',
    description: 'This measures how often your business appears in search results when people look for solar services in Austin. 34% means you\'re visible for about 1 in 3 relevant searches. Higher is better!',
    category: 'metrics',
    icon: '👁️'
  },
  {
    id: 'gmb-reviews',
    title: 'Google Reviews',
    description: 'Customer reviews on your Google Business Profile. More reviews = more trust from potential customers. You need at least 50-100 reviews to compete effectively in the solar market.',
    category: 'metrics',
    icon: '⭐'
  },
  {
    id: 'citations',
    title: 'Business Citations',
    description: 'These are mentions of your business name, address, and phone number on other websites (like Yelp, Yellow Pages, etc.). More citations help Google trust your business is real and local.',
    category: 'metrics',
    icon: '🔗'
  },
  {
    id: 'geo-grid',
    title: 'Location Performance Map',
    description: 'This map shows how well your business ranks in different Austin-area cities. Green dots = excellent rankings, red dots = needs improvement. Click on any location to see detailed performance data.',
    category: 'map',
    icon: '🗺️'
  },
  {
    id: 'keyword-filter',
    title: 'Keyword Targeting',
    description: 'These are the search terms customers use to find solar companies. Focus on keywords with high search volume but lower competition for the best results.',
    category: 'map',
    icon: '🔍'
  },
  {
    id: 'automation-status',
    title: 'Automation Tools',
    description: 'These tools work automatically to improve your online presence. Red = needs attention, Yellow = working but could be better, Green = performing well.',
    category: 'automation',
    icon: '🤖'
  }
]

export default function HelpSystem() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('general')
  const [showQuickTour, setShowQuickTour] = useState(false)

  const categories = [
    { id: 'general', name: 'Overview', icon: '📋' },
    { id: 'metrics', name: 'Performance Metrics', icon: '📊' },
    { id: 'map', name: 'Location Map', icon: '🗺️' },
    { id: 'automation', name: 'Automation Tools', icon: '🤖' }
  ]

  const filteredItems = helpItems.filter(item => item.category === activeCategory)

  return (
    <>
      {/* Help Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="help-trigger"
        title="Get help understanding your dashboard"
      >
        💡 Need Help?
      </button>

      {/* Quick Tour Button */}
      <button 
        onClick={() => setShowQuickTour(true)}
        className="quick-tour-btn"
        title="Take a quick tour of the dashboard"
      >
        🎯 Quick Tour
      </button>

      {/* Help Panel */}
      {isOpen && (
        <div className="help-overlay">
          <div className="help-panel">
            <div className="help-header">
              <h2>📚 Dashboard Guide</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="close-help"
              >
                ✕
              </button>
            </div>

            <div className="help-content">
              <div className="help-intro">
                <h3>Welcome to Your Marketing Dashboard!</h3>
                <p>This dashboard shows how well your solar business is performing online and helps you attract more customers. Here's what everything means:</p>
              </div>

              <div className="category-tabs">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
                  >
                    {category.icon} {category.name}
                  </button>
                ))}
              </div>

              <div className="help-items">
                {activeCategory === 'general' ? (
                  <div className="general-help">
                    <div className="help-item">
                      <h4>🎯 What This Dashboard Does</h4>
                      <p>This dashboard tracks how easily customers can find your solar business online and helps you compete with other solar companies in Austin.</p>
                    </div>
                    <div className="help-item">
                      <h4>📈 Key Goals</h4>
                      <ul>
                        <li><strong>Rank higher in Google searches</strong> - When someone searches "solar panels Austin", you want to appear first</li>
                        <li><strong>Get more customer reviews</strong> - More reviews = more trust = more customers</li>
                        <li><strong>Appear in local directories</strong> - Get listed on Yelp, Angie's List, etc.</li>
                        <li><strong>Stay active on Google Business</strong> - Regular posts keep you visible</li>
                      </ul>
                    </div>
                    <div className="help-item">
                      <h4>🚨 Priority Actions</h4>
                      <p>Focus on the red items first - these have the biggest impact on getting new customers. Yellow items are important but less urgent.</p>
                    </div>
                    <div className="help-item">
                      <h4>📱 Daily Updates</h4>
                      <p>This dashboard updates every day with fresh data from Google so you always know how you're performing compared to competitors.</p>
                    </div>
                  </div>
                ) : (
                  filteredItems.map(item => (
                    <div key={item.id} className="help-item">
                      <h4>{item.icon} {item.title}</h4>
                      <p>{item.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="help-footer">
              <button 
                onClick={() => setShowQuickTour(true)}
                className="tour-btn"
              >
                🎯 Take Interactive Tour
              </button>
              <div className="help-tip">
                💡 <strong>Tip:</strong> Hover over any number or chart for instant explanations!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Tour Overlay */}
      {showQuickTour && (
        <div className="tour-overlay">
          <div className="tour-content">
            <h3>🎯 Quick Dashboard Tour</h3>
            <div className="tour-steps">
              <div className="tour-step">
                <h4>Step 1: Check Your Performance</h4>
                <p>Look at the left sidebar for your key numbers. Red = needs work, Green = doing well.</p>
              </div>
              <div className="tour-step">
                <h4>Step 2: Study the Map</h4>
                <p>The map in the center shows how you rank in different Austin areas. Click any dot for details.</p>
              </div>
              <div className="tour-step">
                <h4>Step 3: Fix Critical Issues</h4>
                <p>Scroll down to see automation tools. Red tools need immediate attention to get more customers.</p>
              </div>
              <div className="tour-step">
                <h4>Step 4: Monitor Daily</h4>
                <p>Check the right sidebar for real-time updates and quick actions you can take.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowQuickTour(false)}
              className="close-tour"
            >
              Got it! ✓
            </button>
          </div>
        </div>
      )}
    </>
  )
}
