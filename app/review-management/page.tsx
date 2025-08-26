'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Review {
  id: string
  author: string
  rating: number
  text: string
  date: string
  platform: 'Google' | 'Yelp' | 'Facebook'
  responded: boolean
  responseText?: string
  sentiment: 'positive' | 'neutral' | 'negative'
}

interface ReviewTemplate {
  id: string
  rating: number
  template: string
  tone: 'professional' | 'friendly' | 'grateful'
}

const recentReviews: Review[] = [
  {
    id: '1',
    author: 'Sarah Johnson',
    rating: 5,
    text: 'Astrawatt Solar did an amazing job on our Georgetown home! The team was professional, the installation was clean, and our energy bills have dropped significantly. Highly recommend!',
    date: '2025-01-10',
    platform: 'Google',
    responded: false,
    sentiment: 'positive'
  },
  {
    id: '2', 
    author: 'Mike Rodriguez',
    rating: 5,
    text: 'Outstanding service from start to finish. As a veteran myself, I appreciated working with a veteran-owned company. The solar system is performing exactly as promised.',
    date: '2025-01-08',
    platform: 'Google',
    responded: true,
    responseText: 'Thank you for your service and for choosing Astrawatt Solar! We\'re honored to serve fellow veterans and thrilled your system is performing well.',
    sentiment: 'positive'
  },
  {
    id: '3',
    author: 'Jennifer Liu',
    rating: 4,
    text: 'Good experience overall. Installation took a bit longer than expected due to permit delays, but the final result is great. Very happy with the energy savings.',
    date: '2025-01-05',
    platform: 'Google',
    responded: false,
    sentiment: 'positive'
  },
  {
    id: '4',
    author: 'David Thompson',
    rating: 3,
    text: 'Solar panels are working fine, but communication during the project could have been better. Had to follow up several times for updates.',
    date: '2025-01-03',
    platform: 'Google',
    responded: false,
    sentiment: 'neutral'
  }
]

const responseTemplates: ReviewTemplate[] = [
  {
    id: '5star',
    rating: 5,
    template: "Thank you so much for the 5-star review! We're thrilled that you're happy with your solar installation and already seeing savings on your energy bills. It's customers like you that make our work so rewarding. Don't hesitate to reach out if you have any questions about your system!",
    tone: 'grateful'
  },
  {
    id: '4star',
    rating: 4,
    template: "Thank you for taking the time to review us! We appreciate your feedback about the permit delays - this is something we're actively working to improve with the city. We're glad you're happy with the final result and energy savings. Please let us know if there's anything else we can do for you.",
    tone: 'professional'
  },
  {
    id: '3star',
    rating: 3,
    template: "Thank you for your review and feedback. We appreciate you pointing out areas where we can improve our communication. We take this seriously and would love to discuss your experience further. Please contact us directly so we can make things right and ensure your complete satisfaction.",
    tone: 'professional'
  }
]

export default function ReviewManagement() {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [generatedResponse, setGeneratedResponse] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [reviewFilter, setReviewFilter] = useState<'all' | 'unresponded' | 'negative'>('unresponded')

  const generateResponse = async (review: Review) => {
    setIsGenerating(true)
    setSelectedReview(review)
    
    // Simulate AI response generation
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const template = responseTemplates.find(t => t.rating === review.rating) || responseTemplates[0]
    
    // Customize based on review content
    let customResponse = template.template
    
    if (review.text.toLowerCase().includes('veteran')) {
      customResponse = customResponse.replace('Thank you', 'Thank you for your service and')
    }
    
    if (review.text.toLowerCase().includes('georgetown') || review.text.toLowerCase().includes('cedar park')) {
      customResponse += " We're proud to serve the " + (review.text.toLowerCase().includes('georgetown') ? 'Georgetown' : 'Cedar Park') + " community!"
    }
    
    setGeneratedResponse(customResponse)
    setIsGenerating(false)
  }

  const filteredReviews = recentReviews.filter(review => {
    switch (reviewFilter) {
      case 'unresponded':
        return !review.responded
      case 'negative':
        return review.rating <= 3
      default:
        return true
    }
  })

  const averageRating = recentReviews.reduce((sum, review) => sum + review.rating, 0) / recentReviews.length

  return (
    <div className="review-management">
      <header className="page-header">
        <Link href="/" className="back-button">← Back to Dashboard</Link>
        <h1>⭐ Review Management</h1>
        <p>Monitor, respond to, and leverage customer reviews for better local SEO</p>
      </header>

      <div className="review-stats">
        <div className="stat-card">
          <h3>📊 Current Reviews</h3>
          <div className="big-metric">31</div>
          <div className="metric-change negative">↘ Need 422 more to match top competitor</div>
        </div>
        <div className="stat-card">
          <h3>⭐ Average Rating</h3>
          <div className="big-metric">{averageRating.toFixed(1)}</div>
          <div className="metric-change positive">↗ Excellent rating maintained</div>
        </div>
        <div className="stat-card">
          <h3>💬 Response Rate</h3>
          <div className="big-metric">25%</div>
          <div className="metric-change negative">↘ Industry average: 89%</div>
        </div>
        <div className="stat-card urgent">
          <h3>🚨 Unresponded</h3>
          <div className="big-metric">{recentReviews.filter(r => !r.responded).length}</div>
          <div className="metric-change negative">↘ Need immediate attention</div>
        </div>
      </div>

      <div className="competitor-review-comparison">
        <h2>🥊 Review Comparison vs Competitors</h2>
        <div className="comparison-grid">
          <div className="comparison-card yours">
            <h3>🌞 Astrawatt Solar</h3>
            <div className="comparison-metric">
              <span className="metric-label">Reviews:</span>
              <span className="metric-value poor">31</span>
            </div>
            <div className="comparison-metric">
              <span className="metric-label">Rating:</span>
              <span className="metric-value excellent">5.0</span>
            </div>
            <div className="comparison-metric">
              <span className="metric-label">Response Rate:</span>
              <span className="metric-value poor">25%</span>
            </div>
          </div>
          
          <div className="comparison-card competitor">
            <h3>🏆 512 Solar</h3>
            <div className="comparison-metric">
              <span className="metric-label">Reviews:</span>
              <span className="metric-value excellent">453</span>
            </div>
            <div className="comparison-metric">
              <span className="metric-label">Rating:</span>
              <span className="metric-value excellent">5.0</span>
            </div>
            <div className="comparison-metric">
              <span className="metric-label">Response Rate:</span>
              <span className="metric-value excellent">92%</span>
            </div>
          </div>
          
          <div className="comparison-card competitor">
            <h3>🥈 ATX Solar</h3>
            <div className="comparison-metric">
              <span className="metric-label">Reviews:</span>
              <span className="metric-value good">186</span>
            </div>
            <div className="comparison-metric">
              <span className="metric-label">Rating:</span>
              <span className="metric-value good">4.8</span>
            </div>
            <div className="comparison-metric">
              <span className="metric-label">Response Rate:</span>
              <span className="metric-value good">78%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="review-automation">
        <h2>🤖 Review Response Automation</h2>
        <div className="automation-controls">
          <div className="filter-controls">
            <button 
              className={reviewFilter === 'all' ? 'active' : ''}
              onClick={() => setReviewFilter('all')}
            >
              All Reviews
            </button>
            <button 
              className={reviewFilter === 'unresponded' ? 'active' : ''}
              onClick={() => setReviewFilter('unresponded')}
            >
              🚨 Unresponded ({recentReviews.filter(r => !r.responded).length})
            </button>
            <button 
              className={reviewFilter === 'negative' ? 'active' : ''}
              onClick={() => setReviewFilter('negative')}
            >
              ⚠️ Needs Attention ({recentReviews.filter(r => r.rating <= 3).length})
            </button>
          </div>
        </div>

        <div className="reviews-list">
          {filteredReviews.map(review => (
            <div key={review.id} className={`review-card ${review.sentiment} ${!review.responded ? 'unresponded' : ''}`}>
              <div className="review-header">
                <div className="reviewer-info">
                  <strong>{review.author}</strong>
                  <span className="review-date">{review.date}</span>
                  <span className={`platform-badge ${review.platform.toLowerCase()}`}>
                    {review.platform}
                  </span>
                </div>
                <div className="review-rating">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < review.rating ? 'star filled' : 'star'}>⭐</span>
                  ))}
                </div>
              </div>
              
              <div className="review-text">
                {review.text}
              </div>
              
              {review.responded ? (
                <div className="existing-response">
                  <h4>✅ Your Response:</h4>
                  <p>{review.responseText}</p>
                </div>
              ) : (
                <div className="response-actions">
                  <button 
                    onClick={() => generateResponse(review)}
                    disabled={isGenerating}
                    className="generate-response-btn"
                  >
                    {isGenerating ? '⏳ Generating...' : '🤖 Generate Response'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="review-request-automation">
        <h2>📨 Review Request Automation</h2>
        <div className="request-automation-content">
          <div className="automation-setup">
            <h3>⚙️ Automated Review Requests</h3>
            <p>Set up automated email/SMS campaigns to request reviews from satisfied customers</p>
            
            <div className="automation-settings">
              <div className="setting-item">
                <label>
                  <input type="checkbox" defaultChecked />
                  Send review request 7 days after installation completion
                </label>
              </div>
              <div className="setting-item">
                <label>
                  <input type="checkbox" defaultChecked />
                  Follow up with non-responders after 14 days
                </label>
              </div>
              <div className="setting-item">
                <label>
                  <input type="checkbox" />
                  Send quarterly review requests to existing customers
                </label>
              </div>
            </div>
            
            <div className="email-templates">
              <h4>📧 Email Templates</h4>
              <div className="template-preview">
                <strong>Subject:</strong> How was your solar installation experience?
                <br /><br />
                <strong>Body:</strong> Hi [Customer Name], we hope you're loving your new solar system! 
                Would you mind sharing your experience with a quick review? It helps other Austin families 
                learn about solar benefits. [Review Link]
              </div>
            </div>
          </div>
          
          <div className="request-performance">
            <h3>📊 Request Performance</h3>
            <div className="performance-metrics">
              <div className="performance-metric">
                <span className="label">Requests Sent:</span>
                <span className="value">45 this month</span>
              </div>
              <div className="performance-metric">
                <span className="label">Response Rate:</span>
                <span className="value">31%</span>
              </div>
              <div className="performance-metric">
                <span className="label">Average Rating:</span>
                <span className="value">4.8</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedReview && generatedResponse && (
        <div className="response-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>💬 Generated Response for {selectedReview.author}</h3>
              <button onClick={() => setSelectedReview(null)} className="close-btn">✕</button>
            </div>
            
            <div className="response-editor">
              <div className="original-review">
                <h4>Original Review:</h4>
                <div className="review-display">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < selectedReview.rating ? 'star filled' : 'star'}>⭐</span>
                    ))}
                  </div>
                  <p>{selectedReview.text}</p>
                </div>
              </div>
              
              <div className="generated-response">
                <h4>Generated Response:</h4>
                <textarea 
                  value={generatedResponse}
                  onChange={(e) => setGeneratedResponse(e.target.value)}
                  rows={6}
                />
              </div>
              
              <div className="response-actions">
                <button className="action-btn secondary">📝 Edit Response</button>
                <button className="action-btn primary">✅ Post Response</button>
                <button className="action-btn">📅 Schedule Later</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
