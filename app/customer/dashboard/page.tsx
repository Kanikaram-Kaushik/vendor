'use client'

import { useRouter } from 'next/navigation'

export default function CustomerDashboardPage() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/customer/logout', { method: 'POST' })
    router.push('/customer/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, #333 0, #111 45%, #090909 100%)', padding: 24 }}>
      <div style={{ maxWidth: 760, margin: '0 auto', background: '#fff', borderRadius: 24, padding: 32, boxShadow: '0 20px 50px rgba(0,0,0,0.28)' }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, marginBottom: 8 }}>Customer dashboard</h1>
        <p style={{ color: '#666', marginBottom: 24 }}>You are signed in with the demo customer account.</p>

        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div style={{ border: '1px solid #e5e5e5', borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', marginBottom: 8 }}>Account</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Demo Customer</div>
            <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>demo.customer@designbhk.com</div>
          </div>
          <div style={{ border: '1px solid #e5e5e5', borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', marginBottom: 8 }}>Status</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Signed in</div>
            <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>Demo login is active</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{ marginTop: 24, background: '#111', color: '#fff', borderRadius: 12, padding: '12px 20px', fontWeight: 600 }}
        >
          Log out
        </button>
      </div>
    </div>
  )
}