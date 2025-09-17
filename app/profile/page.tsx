'use client'

import BusinessProfileForm from '../components/BusinessProfileForm'
import Link from 'next/link'
import '../setup/setup-styles.css'

export default function ProfilePage() {
  return (
    <div className="dev-profile-page">
      <div className="profile-header">
        <div className="header-left">
          <Link href="/" className="back-button">← Back to Dashboard</Link>
          <div className="header-info">
            <h1>🏢 Business Profile</h1>
            <p>Set your business details so the dashboard can tailor data and competitor tracking</p>
          </div>
        </div>
      </div>
      <BusinessProfileForm />
    </div>
  )
}
