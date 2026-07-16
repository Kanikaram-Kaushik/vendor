'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Brand {
  id: string
  name: string
}

export default function NewManualQuotePage() {
  const router = useRouter()
  const [brands, setBrands] = useState<Brand[]>([])
  const [brandId, setBrandId] = useState('')
  const [projectName, setProjectName] = useState('')
  const [status, setStatus] = useState('SUBMITTED')
  const [loading, setLoading] = useState(false)
  const [fetchingBrands, setFetchingBrands] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadBrands() {
      try {
        const res = await fetch('/api/brands/public')
        if (res.ok) {
          const data = await res.json()
          setBrands(data.brands || [])
          if (data.brands && data.brands.length > 0) {
            setBrandId(data.brands[0].id)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setFetchingBrands(false)
      }
    }
    loadBrands()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!brandId) {
      setError('Please select a brand.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId, projectName, status }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to create quote')
        setLoading(false)
        return
      }
      router.push('/admin/quotes')
    } catch {
      setError('Network error')
      setLoading(false)
    }
  }

  if (fetchingBrands) {
    return (
      <div style={{ maxWidth: 600, margin: '40px auto', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading brand list...
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px' }}>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <h1 className="page-title">Add Quote Manually</h1>
        <p className="page-subtitle">Create a direct quotation request for a brand</p>
      </div>

      {error && <div className="login-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="card" style={{ padding: 24 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Brand</label>
            <select className="form-select" value={brandId} onChange={e => setBrandId(e.target.value)} required>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Project Name</label>
            <input className="form-input" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="e.g. Apartment unit 203 Kitchen" required />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="SUBMITTED">Submitted</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="ACTIVE">Active</option>
            </select>
          </div>
          <div className="form-actions" style={{ borderTop: '1px solid var(--border)', paddingTop: 18, justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={() => router.push('/admin/quotes')}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ background: '#000', color: '#fff' }} disabled={loading}>
              {loading ? 'Creating…' : 'Create Quote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
