import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { type, business } = await request.json()

    // Generate content based on type
    const generatedContent = generateGMBContent(type, business)

    return NextResponse.json(generatedContent)
  } catch (error: any) {
    console.error('Error generating GMB post:', error)
    return NextResponse.json({ 
      error: 'Failed to generate GMB post',
      details: error.message 
    }, { status: 500 })
  }
}

function generateGMBContent(type: string, business: string) {
  const templates = {
    service: {
      title: 'Professional Solar Installation Services',
      content: `🌞 Expert solar installation in Austin & Central Texas!\n\n⚡ Custom solar system design for your home\n💰 Federal tax credits + Austin Energy rebates\n🔧 Full-service installation & maintenance\n🏆 Veteran-owned & Enphase Platinum certified\n\nTransform your energy bills with clean, renewable power. Serving Austin, Georgetown, Cedar Park, Round Rock & beyond.\n\nReady to go solar? Get your FREE consultation today! 📞`,
      keywords: ['solar installation', 'Austin solar', 'solar services', 'renewable energy'],
      cta: 'Get Free Quote'
    },
    product: {
      title: 'Premium Solar Equipment & Technology',
      content: `🔋 The latest solar technology for maximum efficiency!\n\n⚡ REC solar panels - industry-leading performance\n🔋 Tesla Powerwall integration available\n📱 Enphase monitoring & micro-inverters\n🌟 Tier 1 equipment with 25-year warranties\n\nDon't settle for inferior equipment. Your Austin home deserves the best solar technology available.\n\nUpgrade to premium solar today! 🌞`,
      keywords: ['solar panels', 'Tesla Powerwall', 'solar equipment', 'REC panels'],
      cta: 'View Products'
    },
    update: {
      title: 'Austin Solar Market Update',
      content: `📈 Great news for Central Texas solar!\n\n🌞 Austin Energy rebates still available ($2,400/system)\n⚡ Net metering benefits continue for homeowners\n💰 30% Federal tax credit extended through 2032\n🏠 Solar increases home values by 4%+\n\nWith electricity rates rising, now is the perfect time to lock in your energy costs with solar.\n\nDon't miss these incredible incentives! ⏰`,
      keywords: ['Austin solar news', 'solar incentives', 'solar rebates', 'net metering'],
      cta: 'Learn More'
    },
    offer: {
      title: 'Limited Time Solar Special - $2,500 OFF!',
      content: `🎉 EXCLUSIVE OFFER: Save $2,500 on Solar Installation!\n\n💰 Additional savings on top of federal tax credits\n⚡ FREE comprehensive energy audit included\n🔧 Professional installation by certified team\n📞 Limited spots available - ends this month!\n\nJoin 500+ Austin families already saving with solar. This deal won't last!\n\nClaim your savings today! 🚀`,
      keywords: ['solar deal', 'Austin solar offer', 'solar discount', 'solar savings'],
      cta: 'Claim Offer Now'
    }
  }

  const template = templates[type as keyof typeof templates] || templates.service
  
  return {
    title: template.title,
    content: template.content,
    keywords: template.keywords,
    cta: template.cta,
    metadata: {
      generatedAt: new Date().toISOString(),
      type,
      business,
      targetAudience: 'Austin homeowners interested in solar energy'
    }
  }
}
