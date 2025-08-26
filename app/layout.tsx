import type { Metadata } from 'next'
import './globals.css'
import './enhanced-dashboard.css'
import './enhanced-geo-grid.css'
import './help-system.css'
import './data-refresh.css'
import './gmb-automation/gmb-styles.css'
import './seo-tracking/seo-styles.css'
import './review-management/review-styles.css'
import './recommendations/recommendations-styles.css'

export const metadata: Metadata = {
  title: 'Astrawatt Solar Marketing Automation',
  description: 'SEO, GMB, and competitor tracking automation for Astrawatt Solar',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
