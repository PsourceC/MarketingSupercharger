import type { Metadata } from 'next'
import './gmb-automation/gmb-styles.css'
import './seo-tracking/seo-styles.css'

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
