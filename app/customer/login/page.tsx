'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CustomerLoginPage() {
  const router = useRouter()
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password')
  const [method, setMethod] = useState<'email' | 'phone'>('email')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: identifier || 'demo.customer@designbhk.com',
          password: password || 'customer123',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      router.push(data.redirect || '/customer/dashboard')
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  function handleFillDemo() {
    setIdentifier('demo.customer@designbhk.com')
    setPassword('customer123')
  }

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: 480 }}>
        <div className="login-logo">
          <div className="login-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <span className="login-logo-text">DesignBHK</span>
        </div>

        <h1 className="login-title">Customer Portal Access</h1>
        <p className="login-subtitle">Sign in or create an account to view quotations and track designs</p>

        {/* Tab switcher: Sign in vs Sign up */}
        <div style={{ display: 'flex', gap: 6, padding: 4, background: '#f3f4f6', borderRadius: 999, marginBottom: 20 }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '8px 16px',
              borderRadius: 999,
              border: 'none',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              background: authMode === 'sign-in' ? '#000' : 'transparent',
              color: authMode === 'sign-in' ? '#fff' : '#666',
              transition: 'all 0.2s',
            }}
            onClick={() => setAuthMode('sign-in')}
          >
            Sign in
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '8px 16px',
              borderRadius: 999,
              border: 'none',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              background: authMode === 'sign-up' ? '#000' : 'transparent',
              color: authMode === 'sign-up' ? '#fff' : '#666',
              transition: 'all 0.2s',
            }}
            onClick={() => setAuthMode('sign-up')}
          >
            Create Account
          </button>
        </div>

        {authMode === 'sign-in' && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#444' }}>
              <input
                type="radio"
                name="loginMethod"
                checked={loginMethod === 'password'}
                onChange={() => setLoginMethod('password')}
              />
              Password
            </label>
            <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#444' }}>
              <input
                type="radio"
                name="loginMethod"
                checked={loginMethod === 'otp'}
                onChange={() => setLoginMethod('otp')}
              />
              OTP Code
            </label>
          </div>
        )}

        {error && <div className="login-error" style={{ marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {authMode === 'sign-up' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              {method === 'email' ? 'Email Address' : 'Phone Number'}
            </label>
            <input
              type={method === 'email' ? 'email' : 'tel'}
              className="form-input"
              placeholder={method === 'email' ? 'customer@example.com' : '+91 98765 43210'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          {(authMode === 'sign-up' || loginMethod === 'password') && (
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={authMode === 'sign-up' || loginMethod === 'password'}
              />
            </div>
          )}

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
            style={{ width: '100%', marginTop: 8 }}
          >
            {loading
              ? 'Processing…'
              : authMode === 'sign-up'
              ? 'Create Customer Account'
              : loginMethod === 'otp'
              ? 'Send OTP Code'
              : 'Sign In to Customer Dashboard'}
          </button>
        </form>

        <button
          type="button"
          className="login-btn"
          style={{ marginTop: 12, width: '100%', background: '#f3f3f3', color: '#111', border: '1px solid #e5e5e5' }}
          onClick={handleFillDemo}
        >
          Fill Demo Customer Credentials
        </button>

        <div style={{ marginTop: 24, textAlign: 'center', borderTop: '1px solid #eee', paddingTop: 16 }}>
          <p style={{ fontSize: 12, color: '#888', margin: 0 }}>
            Looking for Admin, Designer or Vendor login?
          </p>
          <Link href="/login" style={{ display: 'inline-block', marginTop: 6, fontSize: 12.5, fontWeight: 600, color: '#111' }}>
            ← Back to main portal login
          </Link>
        </div>
      </div>
    </div>
  )
}