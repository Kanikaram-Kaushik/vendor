'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DesignerLoginPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/login')
  }, [router])

  return (
    <div className="login-page">
      <div className="login-card">
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Redirecting to unified login...</p>
      </div>
    </div>
  )
}
