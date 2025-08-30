import type { Metadata } from 'next'
import 'leaflet/dist/leaflet.css'
import './globals.css'
import './enhanced-dashboard.css'
import './tabbed-dashboard.css'
import './enhanced-geo-grid.css'
import './help-system.css'
import './data-refresh.css'
import './priority-actions-improved.css'
import './gmb-automation/gmb-styles.css'
import './seo-tracking/seo-styles.css'
import './review-management/review-styles.css'
import './recommendations/recommendations-styles.css'
import './error-handling.css'
import ErrorBoundary from './components/ErrorBoundary'
import DevModeHandler from './components/DevModeHandler'
import HealthCheck from './components/HealthCheck'

export const metadata: Metadata = {
  title: 'Astrawatt Solar Marketing Automation',
  description: 'SEO, GMB, and competitor tracking automation for Astrawatt Solar',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <html lang="en">
      <body className={isDevelopment ? 'suppress-dev-warnings' : ''}>
        <ErrorBoundary>
          <DevModeHandler />
          {isDevelopment && (
            <div className="dev-mode-active">DEV MODE</div>
          )}
          <div className="prevent-layout-shift">
            {children}
          </div>
        </ErrorBoundary>
      </body>
    </html>
  )
}
