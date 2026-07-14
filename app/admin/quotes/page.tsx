'use client'

import { useState, useEffect, useCallback } from 'react'

interface Quote {
  id: string
  brandId: string
  brandName: string
  brandEmail: string
  projectName: string
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'ACTIVE'
  createdAt: string
  updatedAt: string
}

interface Brand {
  id: string
  name: string
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    APPROVED: 'badge badge-approved',
    REJECTED: 'badge badge-rejected',
    SUBMITTED: 'badge badge-submitted',
    ACTIVE: 'badge badge-active',
  }
  return <span className={cls[status] || 'badge badge-pending'}>{status.charAt(0) + status.slice(1).toLowerCase()}</span>
}

function QuoteModal({ brands, onClose, onSave }: { brands: Brand[]; onClose: () => void; onSave: () => void }) {
  const [brandId, setBrandId] = useState(brands[0]?.id || '')
  const [projectName, setProjectName] = useState('')
  const [status, setStatus] = useState('SUBMITTED')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId, projectName, status }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed'); setLoading(false); return }
      onSave()
    } catch {
      setError('Network error')
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Add Quote</h2>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Brand</label>
            <select className="form-select" value={brandId} onChange={e => setBrandId(e.target.value)} required>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Project Name</label>
            <input className="form-input" value={projectName} onChange={e => setProjectName(e.target.value)} required />
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
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating…' : 'Create Quote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showModal, setShowModal] = useState(false)

  const fetchData = useCallback(async () => {
    const [qRes, bRes] = await Promise.all([
      fetch('/api/quotes'),
      fetch('/api/brands'),
    ])
    const qData = await qRes.json()
    const bData = await bRes.json()
    setQuotes(qData.quotes || [])
    setBrands((bData.brands || []).map((b: any) => ({ id: b.id, name: b.name })))
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleStatusChange(id: string, status: string) {
    await fetch(`/api/quotes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchData()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this quote?')) return
    await fetch(`/api/quotes/${id}`, { method: 'DELETE' })
    fetchData()
  }

  const filtered = quotes.filter((q) => {
    const matchSearch =
      q.brandName.toLowerCase().includes(search.toLowerCase()) ||
      q.projectName.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || q.status === statusFilter
    return matchSearch && matchStatus
  })

  const filters = ['ALL', 'SUBMITTED', 'APPROVED', 'REJECTED', 'ACTIVE']

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Quotes</h1>
        <p className="page-subtitle">Manage and review all project quotes.</p>
      </div>

      <div className="page-body">
        <div className="table-wrap">
          <div className="table-toolbar">
            <div className="filter-bar">
              {filters.map((f) => (
                <button
                  key={f}
                  className={`filter-chip ${statusFilter === f ? 'active' : ''}`}
                  onClick={() => setStatusFilter(f)}
                  id={`filter-${f.toLowerCase()}`}
                >
                  {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
              <input
                className="search-input"
                placeholder="Search quotes…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="quotes-search"
              />
              <button id="add-quote-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
                + Add Quote
              </button>
            </div>
          </div>

          {loading ? (
            <div className="empty-state"><div className="empty-state-text">Loading…</div></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-text">No quotes found</div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Project Name</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((quote) => (
                  <tr key={quote.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{quote.brandName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{quote.brandEmail}</div>
                    </td>
                    <td>{quote.projectName}</td>
                    <td><StatusBadge status={quote.status} /></td>
                    <td style={{ color: 'var(--text-muted)' }}>{formatDate(quote.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {quote.status !== 'APPROVED' && (
                          <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handleStatusChange(quote.id, 'APPROVED')}>
                            Approve
                          </button>
                        )}
                        {quote.status !== 'REJECTED' && (
                          <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handleStatusChange(quote.id, 'REJECTED')}>
                            Reject
                          </button>
                        )}
                        <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handleDelete(quote.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <QuoteModal
          brands={brands}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); fetchData() }}
        />
      )}
    </div>
  )
}
