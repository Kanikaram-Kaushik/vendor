'use client'

import { useState, useEffect, useCallback } from 'react'

interface Brand {
  id: string
  name: string
  email: string
  phone: string
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING'
  createdAt: string
  _count?: { quotes: number }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    ACTIVE: 'badge badge-active',
    INACTIVE: 'badge badge-inactive',
    PENDING: 'badge badge-pending',
  }
  return <span className={cls[status] || 'badge badge-pending'}>{status.charAt(0) + status.slice(1).toLowerCase()}</span>
}

function ActionsMenu({
  brand, onEdit, onDelete, onToggle,
}: {
  brand: Brand
  onEdit: (b: Brand) => void
  onDelete: (id: string) => void
  onToggle: (id: string, status: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="actions-menu-wrap">
      <button className="actions-btn" onClick={() => setOpen(!open)} id={`brand-actions-${brand.id}`}>···</button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div className="actions-dropdown">
            <button onClick={() => { setOpen(false); onEdit(brand) }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit
            </button>
            <button onClick={() => { setOpen(false); onToggle(brand.id, brand.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE') }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" y1="2" x2="12" y2="12" />
              </svg>
              {brand.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            </button>
            <button className="danger" onClick={() => { setOpen(false); onDelete(brand.id) }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function BrandModal({ brand, onClose, onSave }: { brand?: Brand; onClose: () => void; onSave: () => void }) {
  const [name, setName] = useState(brand?.name || '')
  const [email, setEmail] = useState(brand?.email || '')
  const [phone, setPhone] = useState(brand?.phone || '')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState(brand?.status || 'ACTIVE')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const url = brand ? `/api/brands/${brand.id}` : '/api/brands'
      const method = brand ? 'PATCH' : 'POST'
      const body: Record<string, string> = { name, email, phone, status }
      if (!brand) body.password = password
      if (brand && password) body.password = password

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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
        <h2 className="modal-title">{brand ? 'Edit Brand' : 'Add Brand'}</h2>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Brand Name</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password {brand && '(leave blank to keep current)'}</label>
            <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} required={!brand} />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={status} onChange={e => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE' | 'PENDING')}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : brand ? 'Save Changes' : 'Create Brand'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editBrand, setEditBrand] = useState<Brand | undefined>(undefined)

  const fetchBrands = useCallback(async () => {
    const res = await fetch('/api/brands')
    const data = await res.json()
    setBrands(data.brands || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchBrands() }, [fetchBrands])

  async function handleDelete(id: string) {
    if (!confirm('Delete this brand? All associated quotes will also be deleted.')) return
    await fetch(`/api/brands/${id}`, { method: 'DELETE' })
    fetchBrands()
  }

  async function handleToggle(id: string, status: string) {
    await fetch(`/api/brands/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchBrands()
  }

  const filtered = brands.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Brands</h1>
        <p className="page-subtitle">Manage your brands here.</p>
      </div>

      <div className="page-body">
        <div className="table-wrap">
          <div className="table-toolbar">
            <input
              className="search-input"
              placeholder="Search brands…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="brands-search"
            />
            <button
              id="add-brand-btn"
              className="btn btn-primary"
              onClick={() => { setEditBrand(undefined); setShowModal(true) }}
            >
              + Add Brand
            </button>
          </div>

          {loading ? (
            <div className="empty-state"><div className="empty-state-text">Loading…</div></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🏢</div>
              <div className="empty-state-text">No brands found</div>
              <div className="empty-state-sub">Add a brand to get started</div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((brand) => (
                  <tr key={brand.id}>
                    <td style={{ fontWeight: 500 }}>{brand.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{brand.email}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{brand.phone}</td>
                    <td><StatusBadge status={brand.status} /></td>
                    <td>
                      <ActionsMenu
                        brand={brand}
                        onEdit={(b) => { setEditBrand(b); setShowModal(true) }}
                        onDelete={handleDelete}
                        onToggle={handleToggle}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <BrandModal
          brand={editBrand}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); fetchBrands() }}
        />
      )}
    </div>
  )
}
