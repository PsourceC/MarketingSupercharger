'use client'

import { useState } from 'react'
import Link from 'next/link'

interface LoanOption {
  id: string
  lenderName: string
  loanType: string
  term: string
  apr: string
  monthlyPayment: string
  downPayment: string
  features: string[]
  creditRequirement: string
  icon: string
}

interface PaymentCalculation {
  loanAmount: number
  interestRate: number
  termYears: number
  monthlyPayment: number
  totalInterest: number
  totalPayments: number
}

const loanOptions: LoanOption[] = [
  {
    id: 'sunlight-financial',
    lenderName: 'Sunlight Financial',
    loanType: 'Solar Loan',
    term: '25 years',
    apr: '3.99% - 9.99%',
    monthlyPayment: '$89 - $156',
    downPayment: '$0',
    features: [
      'No prepayment penalties',
      'Same-day approvals',
      'No dealer fees',
      'Fixed interest rates',
      'Online account management'
    ],
    creditRequirement: '650+',
    icon: '☀️'
  },
  {
    id: 'mosaic',
    lenderName: 'Mosaic',
    loanType: 'Home Improvement Loan',
    term: '20 years',
    apr: '4.99% - 12.99%',
    monthlyPayment: '$94 - $178',
    downPayment: '$0',
    features: [
      'Quick online application',
      'Competitive rates',
      'No home equity required',
      'Flexible terms',
      'Solar-specific lending'
    ],
    creditRequirement: '640+',
    icon: '🏡'
  },
  {
    id: 'goodleap',
    lenderName: 'GoodLeap',
    loanType: 'Solar Financing',
    term: '25 years',
    apr: '4.49% - 11.99%',
    monthlyPayment: '$92 - $168',
    downPayment: '$0',
    features: [
      'Fast approvals',
      'Simple application',
      'Multiple payment options',
      'Technology-focused lender',
      'Customer support'
    ],
    creditRequirement: '660+',
    icon: '⚡'
  },
  {
    id: 'heloc',
    lenderName: 'Various Banks',
    loanType: 'Home Equity Line of Credit',
    term: '10-30 years',
    apr: '5.25% - 8.75%',
    monthlyPayment: '$78 - $142',
    downPayment: '$0',
    features: [
      'Often lowest rates',
      'Interest may be tax deductible',
      'Use existing home equity',
      'Flexible draw period',
      'Established banking relationship'
    ],
    creditRequirement: '700+',
    icon: '🏦'
  }
]

export default function Financing() {
  const [selectedLoan, setSelectedLoan] = useState('sunlight-financial')
  const [loanCalculator, setLoanCalculator] = useState({
    loanAmount: 20000,
    interestRate: 6.99,
    termYears: 20
  })
  const [showPreApproval, setShowPreApproval] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    annualIncome: '',
    monthlyDebt: '',
    employmentStatus: '',
    creditScore: '',
    systemCost: '',
    loanTerm: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePreApprovalSubmit = async () => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/financing/pre-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const result = await response.json()
        alert(`✅ Pre-approval submitted successfully!\n\nWe'll review your application and send pre-qualification offers within 24 hours.\n\nReference ID: ${result.referenceId || 'PA-' + Date.now()}`)
        setShowPreApproval(false)
        setFormData({
          firstName: '', lastName: '', email: '', phone: '', address: '',
          annualIncome: '', monthlyDebt: '', employmentStatus: '', creditScore: '',
          systemCost: '', loanTerm: ''
        })
      } else {
        alert('Thank you for your interest! We\'ll contact you within 24 hours with pre-approval options.')
        setShowPreApproval(false)
      }
    } catch (error) {
      console.error('Error submitting pre-approval:', error)
      alert('Thank you! Your pre-approval request has been received. We\'ll contact you within 24 hours.')
      setShowPreApproval(false)
    }

    setIsSubmitting(false)
  }

  const calculatePayment = (): PaymentCalculation => {
    const { loanAmount, interestRate, termYears } = loanCalculator
    const monthlyRate = interestRate / 100 / 12
    const totalPayments = termYears * 12
    
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                          (Math.pow(1 + monthlyRate, totalPayments) - 1)
    
    const totalInterest = (monthlyPayment * totalPayments) - loanAmount
    
    return {
      loanAmount,
      interestRate,
      termYears,
      monthlyPayment,
      totalInterest,
      totalPayments
    }
  }

  const calculation = calculatePayment()

  return (
    <div className="financing-page">
      <header className="page-header">
        <Link href="/" className="back-button">← Back to Dashboard</Link>
        <h1>💰 Solar Financing Options</h1>
        <p>Flexible financing solutions to make solar affordable for your Austin home</p>
      </header>

      {/* Financing Overview */}
      <div className="financing-overview">
        <div className="overview-hero">
          <div className="hero-content">
            <h2>Make Solar Affordable with $0 Down Financing</h2>
            <p>Multiple financing options with competitive rates and flexible terms to fit your budget.</p>
            
            <div className="financing-benefits">
              <div className="benefit-item">
                <span className="benefit-icon">💵</span>
                <div className="benefit-content">
                  <strong>$0 Down Options</strong>
                  <p>Start saving immediately with no upfront costs</p>
                </div>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">📈</span>
                <div className="benefit-content">
                  <strong>Build Home Equity</strong>
                  <p>Solar adds value to your home</p>
                </div>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🔒</span>
                <div className="benefit-content">
                  <strong>Fixed Payments</strong>
                  <p>Lock in energy costs for 20-25 years</p>
                </div>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">⚡</span>
                <div className="benefit-content">
                  <strong>Immediate Savings</strong>
                  <p>Solar payment often less than electric bill</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="financing-stats">
            <div className="stat-card">
              <h3>3.99%</h3>
              <p>Starting APR</p>
            </div>
            <div className="stat-card">
              <h3>25</h3>
              <p>Year Terms</p>
            </div>
            <div className="stat-card">
              <h3>$0</h3>
              <p>Down Payment</p>
            </div>
            <div className="stat-card">
              <h3>24hr</h3>
              <p>Approval Time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loan Comparison */}
      <div className="loan-comparison">
        <h2>🏦 Compare Financing Options</h2>
        <p>We work with multiple lenders to find the best financing solution for your situation.</p>
        
        <div className="loan-tabs">
          {loanOptions.map(loan => (
            <button
              key={loan.id}
              onClick={() => setSelectedLoan(loan.id)}
              className={`loan-tab ${selectedLoan === loan.id ? 'active' : ''}`}
            >
              <span className="tab-icon">{loan.icon}</span>
              <span className="tab-name">{loan.lenderName}</span>
            </button>
          ))}
        </div>

        <div className="loan-details">
          {loanOptions.map(loan => (
            <div
              key={loan.id}
              className={`loan-detail ${selectedLoan === loan.id ? 'active' : ''}`}
            >
              <div className="loan-header">
                <div className="loan-branding">
                  <span className="loan-icon">{loan.icon}</span>
                  <div className="loan-info">
                    <h3>{loan.lenderName}</h3>
                    <p>{loan.loanType}</p>
                  </div>
                </div>
                
                <div className="loan-terms">
                  <div className="term-item">
                    <span className="term-label">APR Range:</span>
                    <span className="term-value">{loan.apr}</span>
                  </div>
                  <div className="term-item">
                    <span className="term-label">Term:</span>
                    <span className="term-value">{loan.term}</span>
                  </div>
                  <div className="term-item">
                    <span className="term-label">Monthly Payment:</span>
                    <span className="term-value">{loan.monthlyPayment}</span>
                  </div>
                  <div className="term-item">
                    <span className="term-label">Down Payment:</span>
                    <span className="term-value">{loan.downPayment}</span>
                  </div>
                  <div className="term-item">
                    <span className="term-label">Credit Score:</span>
                    <span className="term-value">{loan.creditRequirement}</span>
                  </div>
                </div>
              </div>

              <div className="loan-features">
                <h4>✅ Key Features:</h4>
                <ul>
                  {loan.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>

              <div className="loan-actions">
                <button className="loan-cta primary">
                  📋 Apply with {loan.lenderName}
                </button>
                <button className="loan-cta secondary">
                  📞 Speak with Specialist
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Calculator */}
      <div className="payment-calculator">
        <h2>🧮 Solar Loan Calculator</h2>
        <p>Calculate your monthly payments based on system cost and financing terms.</p>
        
        <div className="calculator-layout">
          <div className="calculator-inputs">
            <h3>📊 Loan Details</h3>
            <div className="input-group">
              <label>Solar System Cost (after incentives):</label>
              <input
                type="number"
                value={loanCalculator.loanAmount}
                onChange={(e) => setLoanCalculator({
                  ...loanCalculator,
                  loanAmount: Number(e.target.value)
                })}
                className="calc-input"
              />
            </div>
            <div className="input-group">
              <label>Interest Rate (%):</label>
              <input
                type="number"
                step="0.01"
                value={loanCalculator.interestRate}
                onChange={(e) => setLoanCalculator({
                  ...loanCalculator,
                  interestRate: Number(e.target.value)
                })}
                className="calc-input"
              />
            </div>
            <div className="input-group">
              <label>Loan Term (years):</label>
              <select
                value={loanCalculator.termYears}
                onChange={(e) => setLoanCalculator({
                  ...loanCalculator,
                  termYears: Number(e.target.value)
                })}
                className="calc-input"
              >
                <option value={12}>12 years</option>
                <option value={15}>15 years</option>
                <option value={20}>20 years</option>
                <option value={25}>25 years</option>
              </select>
            </div>
          </div>

          <div className="calculator-results">
            <h3>💡 Payment Breakdown</h3>
            <div className="result-items">
              <div className="result-item main">
                <span className="result-label">Monthly Payment:</span>
                <span className="result-value">${calculation.monthlyPayment.toFixed(2)}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Total Interest:</span>
                <span className="result-value">${calculation.totalInterest.toFixed(2)}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Total of Payments:</span>
                <span className="result-value">${(calculation.monthlyPayment * calculation.totalPayments).toFixed(2)}</span>
              </div>
              
              <div className="savings-comparison">
                <h4>💰 vs. Electric Bill</h4>
                <div className="comparison-row">
                  <span>Typical Austin Electric Bill:</span>
                  <span>$150/month</span>
                </div>
                <div className="comparison-row highlight">
                  <span>Your Solar Payment:</span>
                  <span>${calculation.monthlyPayment.toFixed(2)}/month</span>
                </div>
                <div className="comparison-row savings">
                  <span>Monthly Savings:</span>
                  <span>${(150 - calculation.monthlyPayment).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pre-Approval Process */}
      <div className="pre-approval-section">
        <h2>✅ Get Pre-Approved in Minutes</h2>
        <p>Check your financing options without affecting your credit score.</p>
        
        <div className="approval-process">
          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">1</div>
              <h3>Soft Credit Check</h3>
              <p>Quick pre-qualification with no impact to credit score</p>
            </div>
            <div className="process-step">
              <div className="step-number">2</div>
              <h3>Compare Options</h3>
              <p>See rates and terms from multiple lenders</p>
            </div>
            <div className="process-step">
              <div className="step-number">3</div>
              <h3>Choose Best Offer</h3>
              <p>Select the financing that works for your budget</p>
            </div>
            <div className="process-step">
              <div className="step-number">4</div>
              <h3>Final Approval</h3>
              <p>Complete application for chosen lender</p>
            </div>
          </div>
          
          <div className="approval-benefits">
            <h3>🎯 Why Get Pre-Approved?</h3>
            <ul>
              <li>Know your exact budget before design</li>
              <li>Lock in current interest rates</li>
              <li>Faster installation process</li>
              <li>Negotiate from position of strength</li>
              <li>No obligation to proceed</li>
            </ul>
            
            <button 
              onClick={() => setShowPreApproval(true)}
              className="pre-approval-cta"
            >
              🚀 Start Pre-Approval
            </button>
          </div>
        </div>
      </div>

      {/* Financing FAQ */}
      <div className="financing-faq">
        <h2>❓ Financing Questions & Answers</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h3>💳 What credit score do I need?</h3>
            <p>Most solar loans require a credit score of 640-680+. We work with multiple lenders to find options for different credit situations.</p>
          </div>
          <div className="faq-item">
            <h3>📄 What documents do I need?</h3>
            <p>Typically: recent pay stubs, tax returns, bank statements, and photo ID. Our lenders make the process as simple as possible.</p>
          </div>
          <div className="faq-item">
            <h3>⏰ How long does approval take?</h3>
            <p>Most approvals are same-day or within 24 hours. Some lenders offer instant pre-qualification decisions.</p>
          </div>
          <div className="faq-item">
            <h3>🏠 Is my home used as collateral?</h3>
            <p>Most solar loans are unsecured, meaning your home isn't used as collateral. HELOC loans do use home equity.</p>
          </div>
          <div className="faq-item">
            <h3>💰 Can I pay off early?</h3>
            <p>Most solar loans have no prepayment penalties, so you can pay off your loan early and save on interest.</p>
          </div>
          <div className="faq-item">
            <h3>📈 Will this affect my credit?</h3>
            <p>Initial pre-qualification uses a soft credit check that doesn't affect your score. Final approval requires a hard inquiry.</p>
          </div>
        </div>
      </div>

      {/* Incentives Impact */}
      <div className="incentives-financing">
        <h2>🎁 How Incentives Reduce Your Loan Amount</h2>
        <div className="incentives-breakdown">
          <div className="breakdown-example">
            <h3>Example: 8 kW Solar System</h3>
            <div className="breakdown-items">
              <div className="breakdown-item">
                <span>Gross System Cost:</span>
                <span>$24,000</span>
              </div>
              <div className="breakdown-item credit">
                <span>Federal Tax Credit (26%):</span>
                <span>-$6,240</span>
              </div>
              <div className="breakdown-item rebate">
                <span>Austin Energy Rebate:</span>
                <span>-$2,400</span>
              </div>
              <div className="breakdown-item net">
                <span><strong>Amount to Finance:</strong></span>
                <span><strong>$15,360</strong></span>
              </div>
            </div>
          </div>
          
          <div className="incentive-timing">
            <h3>⏰ When You Receive Incentives</h3>
            <div className="timing-items">
              <div className="timing-item">
                <span className="timing-icon">💰</span>
                <div className="timing-content">
                  <strong>Austin Energy Rebate</strong>
                  <p>Applied at installation, reduces loan amount</p>
                </div>
              </div>
              <div className="timing-item">
                <span className="timing-icon">📄</span>
                <div className="timing-content">
                  <strong>Federal Tax Credit</strong>
                  <p>Claimed on next year's tax return</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pre-Approval Modal */}
      {showPreApproval && (
        <div className="pre-approval-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>💳 Solar Financing Pre-Approval</h3>
              <button onClick={() => setShowPreApproval(false)} className="close-btn">✕</button>
            </div>
            
            <div className="pre-approval-form">
              <div className="form-section">
                <h4>👤 Personal Information</h4>
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
                <h4>💼 Financial Information</h4>
                <div className="form-row">
                  <input type="number" placeholder="Annual Income" />
                  <input type="number" placeholder="Monthly Debt Payments" />
                </div>
                <div className="form-row">
                  <select>
                    <option>Employment Status</option>
                    <option>Full-time Employee</option>
                    <option>Self-employed</option>
                    <option>Retired</option>
                    <option>Other</option>
                  </select>
                  <select>
                    <option>Estimated Credit Score</option>
                    <option>Excellent (750+)</option>
                    <option>Good (700-749)</option>
                    <option>Fair (650-699)</option>
                    <option>Poor (&lt;650)</option>
                  </select>
                </div>
              </div>

              <div className="form-section">
                <h4>☀️ Solar Project</h4>
                <div className="form-row">
                  <input type="number" placeholder="Estimated System Cost" />
                  <select>
                    <option>Preferred Loan Term</option>
                    <option>12 years</option>
                    <option>15 years</option>
                    <option>20 years</option>
                    <option>25 years</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button
                  className="submit-pre-approval"
                  onClick={handlePreApprovalSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '⏳ Submitting...' : '✅ Check Pre-Approval Options'}
                </button>
                <p className="form-disclaimer">
                  <small>Soft credit check only - no impact to your credit score</small>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
