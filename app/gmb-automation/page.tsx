'use client'

import { useState } from 'react'
import Link from 'next/link'

interface PostTemplate {
  id: string
  type: 'service' | 'product' | 'update' | 'offer'
  title: string
  content: string
  keywords: string[]
  cta: string
  status: 'draft' | 'scheduled' | 'published'
  publishDate?: string
}

const postTemplates: PostTemplate[] = [
  {
    id: '1',
    type: 'service',
    title: 'Solar Panel Installation Austin',
    content: `Transform your Austin home with professional solar panel installation from Astrawatt Solar! 

🌞 Custom solar designs for every roof type
⚡ Enphase Platinum Certified installers  
💰 Federal tax credits + Austin Energy rebates
🔧 Full-service: design to final connection

Whether you're in Georgetown, Cedar Park, or Round Rock, we make solar simple and affordable. Our veteran-owned team handles all permits, paperwork, and utility connections.

Ready to slash your energy bills? Book your FREE consultation today!`,
    keywords: ['solar panel installation', 'Austin solar', 'solar installers'],
    cta: 'Call now',
    status: 'draft'
  },
  {
    id: '2', 
    type: 'product',
    title: 'Tesla Powerwall 3 Installation',
    content: `Never lose power again with Tesla Powerwall 3 installation in Austin! 

🔋 Backup power for your entire home
⚡ Powers AC, lights, and devices during outages
📱 Monitor and control via smartphone app
🌟 Seamless integration with solar panels

Austin families are protecting themselves from grid instability with Powerwall 3. When ERCOT issues alerts, you'll have peace of mind knowing your family stays powered.

Certified Tesla installers serving Austin, Round Rock, Cedar Park, and Georgetown.`,
    keywords: ['Tesla Powerwall', 'battery backup', 'home energy storage'],
    cta: 'Learn More',
    status: 'scheduled',
    publishDate: '2025-01-15'
  },
  {
    id: '3',
    type: 'update', 
    title: 'Veteran-Owned Solar Excellence',
    content: `🇺🇸 Proud to be Austin's 100% Veteran & Firefighter-Owned solar company!

Our team brings military precision and firefighter safety standards to every solar installation. We don't just install panels - we build energy independence for our neighbors.

✅ Enphase Platinum Certified
✅ REC Solar Panel specialists  
✅ 8+ years serving Central Texas
✅ Full-service from consultation to connection

From Pflugerville to Leander, families trust our commitment to quality and service. Experience the difference veteran leadership makes.`,
    keywords: ['veteran owned', 'solar company', 'Austin solar'],
    cta: 'Contact Us',
    status: 'draft'
  }
]

export default function GMBAutomation() {
  const [selectedTemplate, setSelectedTemplate] = useState<PostTemplate | null>(null)
  const [generatedPosts, setGeneratedPosts] = useState<PostTemplate[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const generateNewPost = async (type: PostTemplate['type']) => {
    setIsGenerating(true)

    try {
      // Call the API to generate a new post
      const response = await fetch('/api/gmb-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, business: 'Astrawatt Solar' })
      })

      if (response.ok) {
        const generatedData = await response.json()
        const newPost: PostTemplate = {
          id: Date.now().toString(),
          type,
          title: generatedData.title || `${type.charAt(0).toUpperCase() + type.slice(1)} Post`,
          content: generatedData.content || getDefaultContent(type),
          keywords: generatedData.keywords || ['austin solar', 'solar installation'],
          cta: generatedData.cta || 'Call now',
          status: 'draft'
        }

        setGeneratedPosts([newPost, ...generatedPosts])

        // Show success message
        alert('✅ New post generated successfully! Review and edit before publishing.')
      } else {
        // Fallback to template-based generation if API fails
        const newPost = generateTemplatePost(type)
        setGeneratedPosts([newPost, ...generatedPosts])
        console.log('Using template fallback for post generation')
      }
    } catch (error) {
      console.error('Error generating post:', error)
      // Fallback to template generation
      const newPost = generateTemplatePost(type)
      setGeneratedPosts([newPost, ...generatedPosts])
    }

    setIsGenerating(false)
  }

  const generateTemplatePost = (type: PostTemplate['type']): PostTemplate => {
    const templates = {
      service: {
        title: 'Expert Solar Installation Services',
        content: `🌞 Professional solar installation in Austin & surrounding areas!\n\n⚡ Custom solar designs for every home\n💰 Federal tax credits + local rebates\n🔧 Full-service installation & maintenance\n🏆 Veteran-owned & Enphase certified\n\nServing Austin, Cedar Park, Georgetown, Round Rock & beyond. Make the switch to clean energy today!`,
        keywords: ['solar installation', 'Austin solar', 'solar services'],
        cta: 'Get Free Quote'
      },
      product: {
        title: 'Premium Solar Products & Equipment',
        content: `🔋 High-quality solar equipment for maximum efficiency!\n\n⚡ REC solar panels - 25 year warranty\n🔋 Tesla Powerwall integration available\n📱 Enphase monitoring systems\n🌟 Tier 1 equipment only\n\nUpgrade your Austin home with the best solar technology. Quality products, expert installation, unbeatable performance.`,
        keywords: ['solar panels', 'Tesla Powerwall', 'solar equipment'],
        cta: 'View Products'
      },
      update: {
        title: 'Austin Solar Industry Update',
        content: `📈 Solar continues growing in Central Texas!\n\n🌞 Austin Energy rebates still available\n⚡ Net metering benefits for homeowners\n💰 Federal tax credit extended through 2032\n🏠 Home values increase with solar\n\nNow is the perfect time to go solar in Austin. Don't miss out on these incredible incentives!`,
        keywords: ['Austin solar news', 'solar incentives', 'solar rebates'],
        cta: 'Learn More'
      },
      offer: {
        title: 'Limited Time Solar Special Offer',
        content: `🎉 SPECIAL OFFER: $1,000 OFF Solar Installation!\n\n💰 Additional savings on top of federal credits\n⚡ Free energy consultation included\n🔧 Professional installation by certified team\n📞 Limited time - book by month end\n\nDon't wait! This exclusive offer won't last long. Join hundreds of Austin families saving with solar.`,
        keywords: ['solar deal', 'Austin solar offer', 'solar discount'],
        cta: 'Claim Offer'
      }
    }

    const template = templates[type]
    return {
      id: Date.now().toString(),
      type,
      title: template.title,
      content: template.content,
      keywords: template.keywords,
      cta: template.cta,
      status: 'draft'
    }
  }

  const getDefaultContent = (type: PostTemplate['type']): string => {
    switch (type) {
      case 'service': return 'Professional solar installation services in Austin...'
      case 'product': return 'Premium solar products and equipment...'
      case 'update': return 'Latest updates from your Austin solar company...'
      case 'offer': return 'Special solar installation offer...'
      default: return 'Solar content for Austin homeowners...'
    }
  }

  return (
    <div className="gmb-automation">
      <header className="page-header">
        <Link href="/" className="back-button">← Back to Dashboard</Link>
        <h1>📱 GMB Content Automation</h1>
        <p>Generate and schedule Google My Business posts to maintain consistent presence</p>
      </header>

      <div className="automation-stats">
        <div className="stat-card urgent">
          <h3>🚨 Critical Status</h3>
          <p>Last post: 1 month ago</p>
          <p>Competitors posting: Weekly</p>
        </div>
        <div className="stat-card">
          <h3>📊 Performance Gap</h3>
          <p>Your posts: 1-2/month</p>
          <p>Recommended: 3-4/week</p>
        </div>
        <div className="stat-card">
          <h3>🎯 Goal</h3>
          <p>Increase posting frequency</p>
          <p>Improve local engagement</p>
        </div>
      </div>

      <div className="content-generator">
        <h2>🤖 AI Content Generator</h2>
        <p>Generate optimized GMB posts based on your service data and competitors</p>
        
        <div className="generator-buttons">
          <button 
            onClick={() => generateNewPost('service')}
            disabled={isGenerating}
            className="generate-btn service"
          >
            {isGenerating ? '⏳ Generating...' : '🔧 Generate Service Post'}
          </button>
          <button 
            onClick={() => generateNewPost('product')}
            disabled={isGenerating}
            className="generate-btn product"
          >
            {isGenerating ? '⏳ Generating...' : '📦 Generate Product Post'}
          </button>
          <button 
            onClick={() => generateNewPost('update')}
            disabled={isGenerating}
            className="generate-btn update"
          >
            {isGenerating ? '⏳ Generating...' : '📢 Generate Company Update'}
          </button>
          <button 
            onClick={() => generateNewPost('offer')}
            disabled={isGenerating}
            className="generate-btn offer"
          >
            {isGenerating ? '⏳ Generating...' : '💰 Generate Special Offer'}
          </button>
        </div>
      </div>

      <div className="post-templates">
        <h2>📋 Post Templates & Queue</h2>
        <div className="templates-grid">
          {[...generatedPosts, ...postTemplates].map(template => (
            <div key={template.id} className={`template-card ${template.status}`}>
              <div className="template-header">
                <span className={`type-badge ${template.type}`}>{template.type}</span>
                <span className={`status-badge ${template.status}`}>{template.status}</span>
              </div>
              
              <h3>{template.title}</h3>
              <div className="content-preview">
                {template.content.slice(0, 150)}...
              </div>
              
              <div className="keywords">
                {template.keywords.map(keyword => (
                  <span key={keyword} className="keyword-tag">#{keyword}</span>
                ))}
              </div>
              
              <div className="template-actions">
                <button 
                  onClick={() => setSelectedTemplate(template)}
                  className="action-btn primary"
                >
                  ✏️ Edit
                </button>
                <button className="action-btn">📅 Schedule</button>
                <button className="action-btn success">🚀 Publish</button>
              </div>
              
              {template.publishDate && (
                <div className="publish-date">
                  📅 Scheduled: {template.publishDate}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="content-calendar">
        <h2>📅 Content Calendar</h2>
        <div className="calendar-view">
          <div className="calendar-header">
            <h3>January 2025 - Suggested Schedule</h3>
            <p>Recommended: 3-4 posts per week to match competitor frequency</p>
          </div>
          
          <div className="calendar-grid">
            <div className="calendar-day">
              <div className="day-number">15</div>
              <div className="scheduled-post tesla">Tesla Powerwall 3</div>
            </div>
            <div className="calendar-day">
              <div className="day-number">17</div>
              <div className="scheduled-post service">Solar Installation</div>
            </div>
            <div className="calendar-day">
              <div className="day-number">20</div>
              <div className="scheduled-post offer">Special Offer</div>
            </div>
            <div className="calendar-day">
              <div className="day-number">22</div>
              <div className="scheduled-post update">Company Update</div>
            </div>
            <div className="calendar-day empty">
              <div className="day-number">24</div>
              <button className="add-post-btn">+ Add Post</button>
            </div>
          </div>
        </div>
      </div>

      {selectedTemplate && (
        <div className="post-editor-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Post: {selectedTemplate.title}</h3>
              <button onClick={() => setSelectedTemplate(null)} className="close-btn">✕</button>
            </div>
            
            <div className="editor-form">
              <label>
                Title:
                <input type="text" defaultValue={selectedTemplate.title} />
              </label>
              
              <label>
                Content:
                <textarea rows={10} defaultValue={selectedTemplate.content} />
              </label>
              
              <label>
                Call to Action:
                <select defaultValue={selectedTemplate.cta}>
                  <option value="Call now">Call now</option>
                  <option value="Learn More">Learn More</option>
                  <option value="Book Consultation">Book Consultation</option>
                  <option value="Get Quote">Get Quote</option>
                </select>
              </label>
              
              <div className="editor-actions">
                <button className="action-btn primary">💾 Save Changes</button>
                <button className="action-btn">📅 Schedule Post</button>
                <button className="action-btn success">🚀 Publish Now</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
