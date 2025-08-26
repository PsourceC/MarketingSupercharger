'use client'

import { useState } from 'react'
import Link from 'next/link'

interface InstallationStep {
  id: string
  title: string
  description: string
  icon: string
  duration: string
}

interface ServiceArea {
  name: string
  installations: number
  averageSystemSize: string
  averageCost: string
}

const installationProcess: InstallationStep[] = [
  {
    id: 'consultation',
    title: 'Free Consultation',
    description: 'Our solar experts visit your home to assess your roof, energy usage, and design a custom solar system.',
    icon: '🏠',
    duration: '1-2 hours'
  },
  {
    id: 'design',
    title: 'System Design',
    description: 'We create detailed plans showing panel placement, electrical connections, and energy production estimates.',
    icon: '📐',
    duration: '3-5 days'
  },
  {
    id: 'permits',
    title: 'Permits & Approvals',
    description: 'We handle all paperwork including city permits, utility interconnection, and HOA approvals.',
    icon: '📋',
    duration: '2-4 weeks'
  },
  {
    id: 'installation',
    title: 'Professional Installation',
    description: 'Certified installers mount panels, run electrical connections, and install monitoring systems.',
    icon: '🔧',
    duration: '1-3 days'
  },
  {
    id: 'inspection',
    title: 'Inspection & Connection',
    description: 'City inspector approves the work and utility company connects your system to the grid.',
    icon: '✅',
    duration: '1-2 weeks'
  },
  {
    id: 'monitoring',
    title: 'System Monitoring',
    description: 'Start generating clean energy and track your savings with our monitoring app.',
    icon: '📱',
    duration: 'Ongoing'
  }
]

const serviceAreas: ServiceArea[] = [
  {
    name: 'Central Austin',
    installations: 145,
    averageSystemSize: '8.2 kW',
    averageCost: '$24,600'
  },
  {
    name: 'Georgetown',
    installations: 89,
    averageSystemSize: '9.1 kW',
    averageCost: '$27,300'
  },
  {
    name: 'Cedar Park',
    installations: 76,
    averageSystemSize: '8.8 kW',
    averageCost: '$26,400'
  },
  {
    name: 'Round Rock',
    installations: 102,
    averageSystemSize: '8.5 kW',
    averageCost: '$25,500'
  },
  {
    name: 'Pflugerville',
    installations: 67,
    averageSystemSize: '8.9 kW',
    averageCost: '$26,700'
  },
  {
    name: 'Leander',
    installations: 54,
    averageSystemSize: '9.3 kW',
    averageCost: '$27,900'
  }
]

export default function SolarInstallation() {
  const [selectedStep, setSelectedStep] = useState<string>('consultation')
  const [showQuote, setShowQuote] = useState(false)

  return (
    <div className="solar-installation">
      <header className="page-header">
        <Link href="/" className="back-button">← Back to Dashboard</Link>
        <h1>☀️ Solar Panel Installation in Austin</h1>
        <p>Professional solar installation services across Central Texas</p>
      </header>

      {/* Hero Section */}
      <div className="installation-hero">
        <div className="hero-content">
          <div className="hero-text">
            <h2>Power Your Austin Home with Solar</h2>
            <p>Join over 500+ Austin families who've made the switch to clean, affordable solar energy with Astrawatt Solar.</p>
            <ul className="benefits-list">
              <li>✅ Save 80-95% on your electric bill</li>
              <li>✅ 26% Federal tax credit + Austin Energy rebates</li>
              <li>✅ 25-year performance warranty</li>
              <li>✅ Veteran & firefighter owned company</li>
            </ul>
            <div className="hero-cta">
              <button 
                onClick={() => setShowQuote(true)}
                className="primary-cta"
              >
                📞 Get Free Quote
              </button>
              <button className="secondary-cta">
                📅 Schedule Consultation
              </button>
            </div>
          </div>
          <div className="hero-stats">
            <div className="stat-card">
              <h3>533</h3>
              <p>Austin Homes Powered</p>
            </div>
            <div className="stat-card">
              <h3>$2.3M</h3>
              <p>Customer Savings</p>
            </div>
            <div className="stat-card">
              <h3>8.5 kW</h3>
              <p>Average System Size</p>
            </div>
          </div>
        </div>
      </div>

      {/* Installation Process */}
      <div className="installation-process">
        <h2>🛠️ Our Installation Process</h2>
        <p className="process-intro">From consultation to connection, we handle everything so you can start saving with solar.</p>
        
        <div className="process-timeline">
          <div className="timeline-nav">
            {installationProcess.map(step => (
              <button
                key={step.id}
                onClick={() => setSelectedStep(step.id)}
                className={`timeline-step ${selectedStep === step.id ? 'active' : ''}`}
              >
                <span className="step-icon">{step.icon}</span>
                <span className="step-title">{step.title}</span>
                <span className="step-duration">{step.duration}</span>
              </button>
            ))}
          </div>
          
          <div className="timeline-content">
            {installationProcess.map(step => (
              <div
                key={step.id}
                className={`timeline-detail ${selectedStep === step.id ? 'active' : ''}`}
              >
                <div className="detail-icon">{step.icon}</div>
                <div className="detail-content">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                  <div className="detail-duration">
                    <span className="duration-label">Timeline:</span>
                    <span className="duration-value">{step.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service Areas */}
      <div className="service-areas">
        <h2>🗺️ Austin Metro Installation Data</h2>
        <p>We've installed solar systems across Central Texas. Here's how your area compares:</p>
        
        <div className="areas-grid">
          {serviceAreas.map((area, index) => (
            <div key={index} className="area-card">
              <h3>{area.name}</h3>
              <div className="area-stats">
                <div className="area-stat">
                  <span className="stat-label">Installations:</span>
                  <span className="stat-value">{area.installations}</span>
                </div>
                <div className="area-stat">
                  <span className="stat-label">Avg System:</span>
                  <span className="stat-value">{area.averageSystemSize}</span>
                </div>
                <div className="area-stat">
                  <span className="stat-label">Avg Investment:</span>
                  <span className="stat-value">{area.averageCost}</span>
                </div>
              </div>
              <div className="area-note">
                <small>*After federal tax credit</small>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="why-choose">
        <h2>🏆 Why Austin Families Choose Astrawatt Solar</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🇺🇸</div>
            <h3>Veteran & Firefighter Owned</h3>
            <p>Military precision and safety standards in every installation.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏅</div>
            <h3>Enphase Platinum Certified</h3>
            <p>Top-tier certification for microinverter installations.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3>Local Austin Team</h3>
            <p>We understand Texas weather and local building codes.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>REC Solar Panels</h3>
            <p>Premium panels with 25-year performance warranty.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Full Service Support</h3>
            <p>From permits to monitoring, we handle everything.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Financing Options</h3>
            <p>$0 down solar loans and lease options available.</p>
          </div>
        </div>
      </div>

      {/* Cost Calculator Preview */}
      <div className="cost-preview">
        <h2>💡 Estimate Your Solar Savings</h2>
        <div className="calculator-preview">
          <div className="calc-inputs">
            <div className="input-group">
              <label>Monthly Electric Bill:</label>
              <input type="number" placeholder="$150" className="calc-input" />
            </div>
            <div className="input-group">
              <label>Home Square Footage:</label>
              <input type="number" placeholder="2000" className="calc-input" />
            </div>
            <div className="input-group">
              <label>Roof Direction:</label>
              <select className="calc-input">
                <option>South-facing</option>
                <option>East-facing</option>
                <option>West-facing</option>
                <option>Mixed</option>
              </select>
            </div>
          </div>
          <div className="calc-results">
            <h3>Quick Estimate:</h3>
            <div className="estimate-item">
              <span>Recommended System Size:</span>
              <span className="estimate-value">8.2 kW</span>
            </div>
            <div className="estimate-item">
              <span>Annual Savings:</span>
              <span className="estimate-value">$1,680</span>
            </div>
            <div className="estimate-item">
              <span>25-Year Savings:</span>
              <span className="estimate-value">$42,000</span>
            </div>
            <button 
              onClick={() => setShowQuote(true)}
              className="calc-cta"
            >
              📊 Get Detailed Quote
            </button>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="installation-contact">
        <h2>🚀 Ready to Start Your Solar Journey?</h2>
        <p>Get a custom solar proposal designed specifically for your Austin home.</p>
        <div className="contact-options">
          <div className="contact-card">
            <h3>📞 Call Now</h3>
            <p>(512) 555-SOLAR</p>
            <p className="contact-note">Speak with a solar expert</p>
          </div>
          <div className="contact-card">
            <h3>📧 Email Quote</h3>
            <p>quotes@astrawattsolar.com</p>
            <p className="contact-note">Get proposal in 24 hours</p>
          </div>
          <div className="contact-card">
            <h3>📅 Schedule Visit</h3>
            <p>Book free consultation</p>
            <p className="contact-note">We come to you</p>
          </div>
        </div>
      </div>

      {/* Quote Modal */}
      {showQuote && (
        <div className="quote-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>📋 Get Your Free Solar Quote</h3>
              <button onClick={() => setShowQuote(false)} className="close-btn">✕</button>
            </div>
            <div className="quote-form">
              <div className="form-section">
                <h4>Contact Information</h4>
                <div className="form-row">
                  <input type="text" placeholder="First Name" />
                  <input type="text" placeholder="Last Name" />
                </div>
                <div className="form-row">
                  <input type="email" placeholder="Email Address" />
                  <input type="tel" placeholder="Phone Number" />
                </div>
                <input type="text" placeholder="Home Address" />
              </div>
              
              <div className="form-section">
                <h4>Energy Usage</h4>
                <div className="form-row">
                  <input type="number" placeholder="Monthly Electric Bill ($)" />
                  <input type="number" placeholder="Home Square Footage" />
                </div>
                <select>
                  <option>What's your roof type?</option>
                  <option>Asphalt Shingle</option>
                  <option>Metal</option>
                  <option>Tile</option>
                  <option>Flat</option>
                </select>
              </div>
              
              <div className="form-actions">
                <button className="submit-quote">
                  🚀 Get My Solar Quote
                </button>
                <p className="privacy-note">
                  <small>Your information is secure. We'll contact you within 24 hours.</small>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
