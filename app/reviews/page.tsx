'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Review {
  id: string
  customerName: string
  location: string
  rating: number
  title: string
  content: string
  date: string
  systemSize: string
  verified: boolean
  photos?: string[]
}

interface ReviewStats {
  totalReviews: number
  averageRating: number
  ratingDistribution: { [key: number]: number }
  monthlyGrowth: number
}

const reviews: Review[] = [
  {
    id: '1',
    customerName: 'Sarah & Mike Johnson',
    location: 'Cedar Park, TX',
    rating: 5,
    title: 'Outstanding service from start to finish!',
    content: 'Astrawatt Solar exceeded our expectations. The team was professional, on time, and explained everything clearly. Our system has been producing more energy than projected. Highly recommend!',
    date: '2024-01-10',
    systemSize: '8.2 kW',
    verified: true,
    photos: ['installation1.jpg', 'panels_roof.jpg']
  },
  {
    id: '2',
    customerName: 'Robert Chen',
    location: 'Round Rock, TX',
    rating: 5,
    title: 'Great investment for our family',
    content: 'We\'ve cut our electric bill by 90% since installation. The veterans who run this company really know their stuff. Installation was clean and professional.',
    date: '2024-01-08',
    systemSize: '10.1 kW',
    verified: true
  },
  {
    id: '3',
    customerName: 'Jennifer Martinez',
    location: 'Georgetown, TX',
    rating: 5,
    title: 'Professional and knowledgeable team',
    content: 'From the initial consultation to final inspection, everything was handled professionally. They took care of all permits and paperwork. System is performing exactly as promised.',
    date: '2024-01-05',
    systemSize: '7.5 kW',
    verified: true
  },
  {
    id: '4',
    customerName: 'David & Lisa Thompson',
    location: 'Pflugerville, TX',
    rating: 5,
    title: 'Couldn\'t be happier with our solar!',
    content: 'Best decision we\'ve made for our home. The app shows we\'re saving $180/month. Installation crew was respectful and cleaned up perfectly. Thank you Astrawatt!',
    date: '2024-01-03',
    systemSize: '9.3 kW',
    verified: true
  },
  {
    id: '5',
    customerName: 'Amanda Williams',
    location: 'Leander, TX',
    rating: 5,
    title: 'Veteran-owned company you can trust',
    content: 'As a military family, we appreciated working with fellow veterans. They understand attention to detail and customer service. System looks great and works perfectly.',
    date: '2023-12-28',
    systemSize: '6.8 kW',
    verified: true
  },
  {
    id: '6',
    customerName: 'Carlos Rodriguez',
    location: 'Austin, TX',
    rating: 4,
    title: 'Good experience overall',
    content: 'Installation went smoothly and team was professional. Minor delay due to permit approval but Astrawatt kept us informed throughout. Happy with the results.',
    date: '2023-12-20',
    systemSize: '8.9 kW',
    verified: true
  }
]

const reviewStats: ReviewStats = {
  totalReviews: 31,
  averageRating: 4.8,
  ratingDistribution: {
    5: 28,
    4: 2,
    3: 1,
    2: 0,
    1: 0
  },
  monthlyGrowth: 12
}

export default function Reviews() {
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState('newest')
  const [showReviewForm, setShowReviewForm] = useState(false)

  const filteredReviews = reviews.filter(review => 
    filterRating ? review.rating === filterRating : true
  ).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime()
    if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime()
    if (sortBy === 'highest') return b.rating - a.rating
    if (sortBy === 'lowest') return a.rating - b.rating
    return 0
  })

  const renderStars = (rating: number, size: 'small' | 'medium' | 'large' = 'medium') => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className={`star filled ${size}`}>⭐</span>)
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className={`star half ${size}`}>⭐</span>)
    }
    
    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className={`star empty ${size}`}>☆</span>)
    }
    
    return stars
  }

  return (
    <div className="reviews-page">
      <header className="page-header">
        <Link href="/" className="back-button">← Back to Dashboard</Link>
        <h1>⭐ Customer Reviews & Testimonials</h1>
        <p>Real feedback from Austin families who've gone solar with Astrawatt</p>
      </header>

      {/* Reviews Overview */}
      <div className="reviews-overview">
        <div className="overview-card main-stats">
          <div className="rating-summary">
            <div className="big-rating">
              <span className="rating-number">{reviewStats.averageRating}</span>
              <div className="rating-stars">
                {renderStars(reviewStats.averageRating, 'large')}
              </div>
              <div className="rating-count">
                Based on {reviewStats.totalReviews} reviews
              </div>
            </div>
          </div>
          
          <div className="rating-breakdown">
            <h3>Rating Distribution</h3>
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="rating-bar">
                <span className="rating-label">{rating} ⭐</span>
                <div className="bar-container">
                  <div 
                    className="bar-fill" 
                    style={{ 
                      width: `${(reviewStats.ratingDistribution[rating] / reviewStats.totalReviews) * 100}%` 
                    }}
                  ></div>
                </div>
                <span className="rating-count">{reviewStats.ratingDistribution[rating]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="overview-card highlights">
          <h3>📊 Review Highlights</h3>
          <div className="highlight-stats">
            <div className="highlight-item">
              <span className="highlight-number">98%</span>
              <span className="highlight-label">Recommend Us</span>
            </div>
            <div className="highlight-item">
              <span className="highlight-number">4.9</span>
              <span className="highlight-label">Installation Rating</span>
            </div>
            <div className="highlight-item">
              <span className="highlight-number">4.8</span>
              <span className="highlight-label">Customer Service</span>
            </div>
            <div className="highlight-item">
              <span className="highlight-number">+{reviewStats.monthlyGrowth}</span>
              <span className="highlight-label">Reviews This Month</span>
            </div>
          </div>
        </div>

        <div className="overview-card trust-badges">
          <h3>🏆 Trust & Verification</h3>
          <div className="badges-grid">
            <div className="badge">
              <span className="badge-icon">✅</span>
              <div className="badge-info">
                <strong>Verified Reviews</strong>
                <p>All reviews from actual customers</p>
              </div>
            </div>
            <div className="badge">
              <span className="badge-icon">🇺🇸</span>
              <div className="badge-info">
                <strong>Veteran Owned</strong>
                <p>Military precision & integrity</p>
              </div>
            </div>
            <div className="badge">
              <span className="badge-icon">🏅</span>
              <div className="badge-info">
                <strong>Certified Installers</strong>
                <p>Enphase Platinum certified</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="reviews-controls">
        <div className="filter-section">
          <h4>Filter by Rating:</h4>
          <div className="rating-filters">
            <button 
              onClick={() => setFilterRating(null)}
              className={`filter-btn ${filterRating === null ? 'active' : ''}`}
            >
              All Reviews
            </button>
            {[5, 4, 3, 2, 1].map(rating => (
              <button
                key={rating}
                onClick={() => setFilterRating(rating)}
                className={`filter-btn ${filterRating === rating ? 'active' : ''}`}
              >
                {rating} ⭐ ({reviewStats.ratingDistribution[rating]})
              </button>
            ))}
          </div>
        </div>

        <div className="sort-section">
          <h4>Sort by:</h4>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="reviews-list">
        <div className="list-header">
          <h2>📝 Customer Reviews ({filteredReviews.length})</h2>
          <button 
            onClick={() => setShowReviewForm(true)}
            className="write-review-btn"
          >
            ✍️ Write a Review
          </button>
        </div>

        <div className="reviews-grid">
          {filteredReviews.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="customer-info">
                  <h3>{review.customerName}</h3>
                  <div className="customer-details">
                    <span className="location">📍 {review.location}</span>
                    <span className="system-size">⚡ {review.systemSize}</span>
                    {review.verified && (
                      <span className="verified-badge">✅ Verified</span>
                    )}
                  </div>
                </div>
                <div className="review-meta">
                  <div className="review-rating">
                    {renderStars(review.rating, 'medium')}
                  </div>
                  <div className="review-date">
                    {new Date(review.date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="review-content">
                <h4>{review.title}</h4>
                <p>{review.content}</p>
              </div>

              {review.photos && (
                <div className="review-photos">
                  {review.photos.map((photo, index) => (
                    <div key={index} className="photo-placeholder">
                      📸 {photo}
                    </div>
                  ))}
                </div>
              )}

              <div className="review-actions">
                <button className="action-btn helpful">
                  👍 Helpful (12)
                </button>
                <button className="action-btn reply">
                  💬 Company Reply
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonial Showcase */}
      <div className="testimonial-showcase">
        <h2>💬 What Our Customers Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card featured">
            <div className="testimonial-content">
              <p>"The entire process was seamless. From consultation to installation to turning on the system, Astrawatt handled everything professionally. Our electric bill went from $220/month to $15/month!"</p>
            </div>
            <div className="testimonial-author">
              <strong>Maria Rodriguez</strong>
              <span>Central Austin • 9.1 kW System</span>
              <div className="testimonial-rating">
                {renderStars(5, 'small')}
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"As veterans ourselves, we appreciated working with a veteran-owned company. They understand quality and attention to detail."</p>
            </div>
            <div className="testimonial-author">
              <strong>John & Susan Wright</strong>
              <span>Georgetown • 7.8 kW System</span>
              <div className="testimonial-rating">
                {renderStars(5, 'small')}
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"System has been producing 15% more than projected. Couldn't be happier with our decision to go solar with Astrawatt."</p>
            </div>
            <div className="testimonial-author">
              <strong>David Kim</strong>
              <span>Round Rock • 8.5 kW System</span>
              <div className="testimonial-rating">
                {renderStars(5, 'small')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ from Reviews */}
      <div className="review-faq">
        <h2>❓ Common Questions from Reviews</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h3>📅 How long does installation take?</h3>
            <p>Most installations are completed in 1-2 days, depending on system size and roof complexity.</p>
          </div>
          <div className="faq-item">
            <h3>🏠 Will installation damage my roof?</h3>
            <p>Our certified installers use proper mounting techniques and seal all penetrations. We guarantee no roof damage.</p>
          </div>
          <div className="faq-item">
            <h3>📱 How do I monitor my system?</h3>
            <p>Every system includes monitoring so you can track production and savings from your phone or computer.</p>
          </div>
          <div className="faq-item">
            <h3>🔧 What about maintenance?</h3>
            <p>Solar panels require minimal maintenance. We provide 25-year warranties and ongoing support.</p>
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="review-form-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>✍️ Write a Review</h3>
              <button onClick={() => setShowReviewForm(false)} className="close-btn">✕</button>
            </div>
            
            <div className="review-form">
              <div className="form-section">
                <h4>📝 Your Review</h4>
                <div className="rating-input">
                  <label>Overall Rating:</label>
                  <div className="star-selector">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} className="star-btn">⭐</button>
                    ))}
                  </div>
                </div>
                <input 
                  type="text" 
                  placeholder="Review title (e.g., 'Excellent service!')" 
                  className="form-input"
                />
                <textarea 
                  placeholder="Tell other customers about your experience..."
                  rows={5}
                  className="form-textarea"
                ></textarea>
              </div>

              <div className="form-section">
                <h4>👤 Your Information</h4>
                <div className="form-row">
                  <input type="text" placeholder="Your Name" />
                  <input type="text" placeholder="City, TX" />
                </div>
                <div className="form-row">
                  <input type="text" placeholder="System Size (e.g., 8.2 kW)" />
                  <input type="date" placeholder="Installation Date" />
                </div>
              </div>

              <div className="form-actions">
                <button className="submit-review-btn">
                  🚀 Submit Review
                </button>
                <p className="form-note">
                  <small>Reviews are verified and typically appear within 24 hours.</small>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
