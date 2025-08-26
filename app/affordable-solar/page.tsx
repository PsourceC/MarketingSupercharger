'use client'

import { useState } from 'react'
import Link from 'next/link'

interface FinancingOption {
  id: string
  title: string
  description: string
  monthlyPayment: string
  downPayment: string
  termLength: string
  icon: string
  pros: string[]
  bestFor: string
}

interface CostBreakdown {
  systemSize: string
  grossCost: number
  federalTaxCredit: number
  austinEnergyRebate: number
  netCost: number
  monthlyPayment: number
  monthlySavings: number
}

const financingOptions: FinancingOption[] = [
  {
    id: 'solar-loan',
    title: '$0 Down Solar Loan',
    description: 'Own your solar system with no money down. Start saving from day one.',
    monthlyPayment: '$89-$156',
    downPayment: '$0',
    termLength: '12-25 years',
    icon: '💰',
    pros: [
      'No upfront costs',
      'Own your system immediately', 
      'Qualify for all incentives',
      'Fixed monthly payments',
      'Increase home value'
    ],
    bestFor: 'Homeowners who want to own their system without upfront costs'
  },
  {
    id: 'cash-purchase',
    title: 'Cash Purchase',
    description: 'Pay upfront and maximize your savings with the fastest payback period.',
    monthlyPayment: '$0',
    downPayment: 'Full amount',
    termLength: 'Immediate',
    icon: '💵',
    pros: [
      'Highest total savings',
      'No monthly payments',
      'Fastest payback (6-8 years)',
      'All incentives go to you',
      'Simple ownership'
    ],
    bestFor: 'Homeowners with available cash who want maximum savings'
  },
  {
    id: 'solar-lease',
    title: 'Solar Lease/PPA',
    description: 'Start saving immediately with low monthly lease payments.',
    monthlyPayment: '$65-$120',
    downPayment: '$0-$500',
    termLength: '20-25 years',
    icon: '📄',
    pros: [
      'Little to no upfront cost',
      'Immediate savings',
      'Maintenance included',
      'Performance guaranteed',
      'Easy qualification'
    ],
    bestFor: 'Homeowners who want immediate savings with minimal commitment'
  }
]

const costBreakdowns: CostBreakdown[] = [
  {
    systemSize: '6 kW',
    grossCost: 18000,
    federalTaxCredit: 4680,
    austinEnergyRebate: 1800,
    netCost: 11520,
    monthlyPayment: 98,
    monthlySavings: 120
  },
  {
    systemSize: '8 kW',
    grossCost: 24000,
    federalTaxCredit: 6240,
    austinEnergyRebate: 2400,
    netCost: 15360,
    monthlyPayment: 131,
    monthlySavings: 160
  },
  {
    systemSize: '10 kW',
    grossCost: 30000,
    federalTaxCredit: 7800,
    austinEnergyRebate: 3000,
    netCost: 19200,
    monthlyPayment: 164,
    monthlySavings: 200
  }
]

export default function AffordableSolar() {
  const [selectedOption, setSelectedOption] = useState('solar-loan')
  const [selectedSystemSize, setSelectedSystemSize] = useState('8 kW')
  const [showCalculator, setShowCalculator] = useState(false)

  const selectedBreakdown = costBreakdowns.find(b => b.systemSize === selectedSystemSize) || costBreakdowns[1]

  return (
    <div className="affordable-solar">
      <header className="page-header">
        <Link href="/" className="back-button">← Back to Dashboard</Link>
        <h1>💰 Affordable Solar Solutions for Austin</h1>
        <p>Multiple financing options to make solar accessible for every budget</p>
      </header>

      {/* Hero Section */}
      <div className="affordability-hero">
        <div className="hero-content">
          <div className="hero-main">
            <h2>Solar is More Affordable Than Ever</h2>
            <p className="hero-subtitle">With $0 down options and immediate savings, going solar has never been easier for Austin families.</p>
            
            <div className="affordability-stats">
              <div className="stat-highlight">
                <span className="stat-number">$0</span>
                <span className="stat-label">Down Payment Options</span>
              </div>
              <div className="stat-highlight">
                <span className="stat-number">26%</span>
                <span className="stat-label">Federal Tax Credit</span>
              </div>
              <div className="stat-highlight">
                <span className="stat-number">$2,500</span>
                <span className="stat-label">Austin Energy Rebate</span>
              </div>
            </div>

            <div className="hero-comparison">
              <h3>💡 Your Current Situation vs Solar</h3>
              <div className="comparison-cards">
                <div className="comparison-card current">
                  <h4>❌ Your Electric Bill</h4>
                  <div className="comparison-amount">$150/month</div>
                  <ul>
                    <li>Rates keep increasing</li>
                    <li>No equity building</li>
                    <li>Peak hour charges</li>
                    <li>25-year cost: $45,000+</li>
                  </ul>
                </div>
                <div className="comparison-arrow">→</div>
                <div className="comparison-card solar">
                  <h4>✅ With Solar</h4>
                  <div className="comparison-amount">$89/month</div>
                  <ul>
                    <li>Fixed payment (loan)</li>
                    <li>Build home equity</li>
                    <li>Own your power</li>
                    <li>25-year cost: $26,700</li>
                  </ul>
                </div>
              </div>
              <div className="savings-highlight">
                <strong>💰 Total Savings: $18,300 over 25 years</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financing Options */}
      <div className="financing-options">
        <h2>💳 Financing Options That Work for You</h2>
        <p>Choose the financing option that best fits your budget and goals.</p>
        
        <div className="options-selector">
          {financingOptions.map(option => (
            <button
              key={option.id}
              onClick={() => setSelectedOption(option.id)}
              className={`option-tab ${selectedOption === option.id ? 'active' : ''}`}
            >
              <span className="option-icon">{option.icon}</span>
              <span className="option-title">{option.title}</span>
            </button>
          ))}
        </div>

        <div className="option-details">
          {financingOptions.map(option => (
            <div
              key={option.id}
              className={`option-detail ${selectedOption === option.id ? 'active' : ''}`}
            >
              <div className="detail-header">
                <div className="detail-icon">{option.icon}</div>
                <div className="detail-summary">
                  <h3>{option.title}</h3>
                  <p>{option.description}</p>
                </div>
                <div className="detail-costs">
                  <div className="cost-item">
                    <span className="cost-label">Monthly Payment:</span>
                    <span className="cost-value">{option.monthlyPayment}</span>
                  </div>
                  <div className="cost-item">
                    <span className="cost-label">Down Payment:</span>
                    <span className="cost-value">{option.downPayment}</span>
                  </div>
                  <div className="cost-item">
                    <span className="cost-label">Term:</span>
                    <span className="cost-value">{option.termLength}</span>
                  </div>
                </div>
              </div>
              
              <div className="detail-content">
                <div className="detail-pros">
                  <h4>✅ Benefits:</h4>
                  <ul>
                    {option.pros.map((pro, index) => (
                      <li key={index}>{pro}</li>
                    ))}
                  </ul>
                </div>
                <div className="detail-best-for">
                  <h4>🎯 Best For:</h4>
                  <p>{option.bestFor}</p>
                </div>
              </div>
              
              <div className="detail-actions">
                <button className="option-cta primary">
                  📞 Get Quote for {option.title}
                </button>
                <button className="option-cta secondary">
                  📊 See Full Breakdown
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Calculator */}
      <div className="cost-calculator">
        <h2>📊 Solar Cost Calculator</h2>
        <p>See exactly how much you'll save with solar for your home size and energy usage.</p>
        
        <div className="calculator-controls">
          <div className="size-selector">
            <label>System Size:</label>
            <div className="size-buttons">
              {costBreakdowns.map(breakdown => (
                <button
                  key={breakdown.systemSize}
                  onClick={() => setSelectedSystemSize(breakdown.systemSize)}
                  className={`size-btn ${selectedSystemSize === breakdown.systemSize ? 'active' : ''}`}
                >
                  {breakdown.systemSize}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="cost-breakdown">
          <div className="breakdown-section">
            <h3>💰 Cost Breakdown ({selectedSystemSize} System)</h3>
            <div className="breakdown-items">
              <div className="breakdown-item total">
                <span>System Cost (before incentives):</span>
                <span>${selectedBreakdown.grossCost.toLocaleString()}</span>
              </div>
              <div className="breakdown-item credit">
                <span>Federal Tax Credit (26%):</span>
                <span>-${selectedBreakdown.federalTaxCredit.toLocaleString()}</span>
              </div>
              <div className="breakdown-item rebate">
                <span>Austin Energy Rebate:</span>
                <span>-${selectedBreakdown.austinEnergyRebate.toLocaleString()}</span>
              </div>
              <div className="breakdown-item net">
                <span><strong>Your Net Cost:</strong></span>
                <span><strong>${selectedBreakdown.netCost.toLocaleString()}</strong></span>
              </div>
            </div>
          </div>

          <div className="monthly-comparison">
            <h3>📅 Monthly Savings</h3>
            <div className="monthly-items">
              <div className="monthly-item">
                <span>Solar Loan Payment:</span>
                <span>${selectedBreakdown.monthlyPayment}</span>
              </div>
              <div className="monthly-item">
                <span>Electric Bill Savings:</span>
                <span>-${selectedBreakdown.monthlySavings}</span>
              </div>
              <div className="monthly-item savings">
                <span><strong>Net Monthly Savings:</strong></span>
                <span><strong>${selectedBreakdown.monthlySavings - selectedBreakdown.monthlyPayment}</strong></span>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setShowCalculator(true)}
          className="detailed-calculator-btn"
        >
          🧮 Use Detailed Calculator
        </button>
      </div>

      {/* Incentives & Rebates */}
      <div className="incentives-section">
        <h2>🎁 Available Incentives in Austin</h2>
        <p>Take advantage of federal, state, and local incentives to maximize your savings.</p>
        
        <div className="incentives-grid">
          <div className="incentive-card federal">
            <div className="incentive-header">
              <span className="incentive-icon">🇺🇸</span>
              <h3>Federal Tax Credit</h3>
              <span className="incentive-value">26%</span>
            </div>
            <div className="incentive-details">
              <p>Tax credit worth 26% of your total system cost.</p>
              <ul>
                <li>Available through 2023</li>
                <li>Reduces to 22% in 2023</li>
                <li>Can carry over to next year</li>
                <li>Average value: $6,000-$8,000</li>
              </ul>
            </div>
          </div>

          <div className="incentive-card local">
            <div className="incentive-header">
              <span className="incentive-icon">⚡</span>
              <h3>Austin Energy Rebate</h3>
              <span className="incentive-value">$2,500</span>
            </div>
            <div className="incentive-details">
              <p>Cash rebate from Austin Energy for solar installations.</p>
              <ul>
                <li>Up to $2,500 per system</li>
                <li>Available to Austin Energy customers</li>
                <li>First-come, first-served</li>
                <li>Funds limited each year</li>
              </ul>
            </div>
          </div>

          <div className="incentive-card property">
            <div className="incentive-header">
              <span className="incentive-icon">🏠</span>
              <h3>Property Tax Exemption</h3>
              <span className="incentive-value">100%</span>
            </div>
            <div className="incentive-details">
              <p>Solar systems don't increase your property tax assessment.</p>
              <ul>
                <li>No additional property taxes</li>
                <li>Solar adds value to home</li>
                <li>Automatic in Texas</li>
                <li>Lifetime benefit</li>
              </ul>
            </div>
          </div>

          <div className="incentive-card net-metering">
            <div className="incentive-header">
              <span className="incentive-icon">↔️</span>
              <h3>Net Metering</h3>
              <span className="incentive-value">1:1</span>
            </div>
            <div className="incentive-details">
              <p>Sell excess power back to the grid at retail rates.</p>
              <ul>
                <li>Credit for excess production</li>
                <li>Use credits when you need them</li>
                <li>No expiration on credits</li>
                <li>Available in Austin Energy territory</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Affordability FAQ */}
      <div className="affordability-faq">
        <h2>❓ Common Questions About Solar Affordability</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h3>💳 What credit score do I need for solar financing?</h3>
            <p>Most solar loans require a credit score of 650+, but we work with multiple lenders who offer options for different credit situations.</p>
          </div>
          <div className="faq-item">
            <h3>⏰ How long until solar pays for itself?</h3>
            <p>With current incentives and Austin Energy rates, most solar systems pay for themselves in 6-8 years through energy savings.</p>
          </div>
          <div className="faq-item">
            <h3>📈 What if electricity rates go up?</h3>
            <p>That's great news for solar owners! Higher electricity rates mean bigger savings. Your solar production locks in your energy costs.</p>
          </div>
          <div className="faq-item">
            <h3>🏠 Does solar increase my home value?</h3>
            <p>Studies show solar increases home value by about 4%, or roughly $15,000 for the average Austin home.</p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="affordability-contact">
        <h2>💬 Ready to Make Solar Affordable?</h2>
        <p>Let's find the financing option that works best for your budget and goals.</p>
        <div className="contact-actions">
          <button className="contact-btn primary">
            📞 Call for Custom Quote
          </button>
          <button className="contact-btn secondary">
            💰 Check Loan Pre-Approval
          </button>
          <button className="contact-btn tertiary">
            📧 Email Payment Options
          </button>
        </div>
        <div className="contact-note">
          <p><small>💡 Free consultation with no obligation. We'll help you understand all your options.</small></p>
        </div>
      </div>

      {/* Detailed Calculator Modal */}
      {showCalculator && (
        <div className="calculator-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>🧮 Detailed Solar Calculator</h3>
              <button onClick={() => setShowCalculator(false)} className="close-btn">✕</button>
            </div>
            <div className="calculator-form">
              <div className="calc-section">
                <h4>📊 Energy Usage</h4>
                <div className="form-row">
                  <label>Monthly Electric Bill ($):</label>
                  <input type="number" placeholder="150" />
                </div>
                <div className="form-row">
                  <label>Annual kWh Usage:</label>
                  <input type="number" placeholder="12000" />
                </div>
              </div>
              
              <div className="calc-section">
                <h4>🏠 Home Details</h4>
                <div className="form-row">
                  <label>Home Square Footage:</label>
                  <input type="number" placeholder="2000" />
                </div>
                <div className="form-row">
                  <label>Roof Direction:</label>
                  <select>
                    <option>South</option>
                    <option>Southeast</option>
                    <option>Southwest</option>
                    <option>East</option>
                    <option>West</option>
                  </select>
                </div>
              </div>

              <div className="calc-results">
                <h4>📈 Your Solar Results</h4>
                <div className="result-grid">
                  <div className="result-item">
                    <span>Recommended System:</span>
                    <span>8.2 kW</span>
                  </div>
                  <div className="result-item">
                    <span>Annual Production:</span>
                    <span>12,500 kWh</span>
                  </div>
                  <div className="result-item">
                    <span>Net System Cost:</span>
                    <span>$15,360</span>
                  </div>
                  <div className="result-item highlight">
                    <span>Monthly Savings:</span>
                    <span>$29/month</span>
                  </div>
                </div>
              </div>
              
              <button className="calc-cta">
                📞 Get Detailed Proposal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
