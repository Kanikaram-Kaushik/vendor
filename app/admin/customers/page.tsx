'use client'

import { useState, useEffect, useCallback } from 'react'

interface Customer {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function ActionsMenu({
  customer,
  onEdit,
  onDelete,
}: {
  customer: Customer
  onEdit: (c: Customer) => void
  onDelete: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="actions-menu-wrap">
      <button className="actions-btn" onClick={() => setOpen(!open)} id={`customer-actions-${customer.id}`}>
        ···
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div className="actions-dropdown">
            <button onClick={() => { setOpen(false); onEdit(customer) }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit
            </button>
            <button className="danger" onClick={() => { setOpen(false); onDelete(customer.id) }}>
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

interface CustomerModalProps {
  customer?: Customer
  onClose: () => void
  onSave: () => void
}

function CustomerModal({ customer, onClose, onSave }: CustomerModalProps) {
  const [name, setName] = useState(customer?.name || '')
  const [email, setEmail] = useState(customer?.email || '')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const url = customer ? `/api/customers/${customer.id}` : '/api/customers'
      const method = customer ? 'PATCH' : 'POST'
      const body: Record<string, string> = { name, email }
      if (!customer && password) body.password = password
      if (customer && password) body.password = password

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
        <h2 className="modal-title">{customer ? 'Edit Customer' : 'Add Customer'}</h2>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password {customer && '(leave blank to keep current)'}</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required={!customer}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : customer ? 'Save Changes' : 'Create Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editCustomer, setEditCustomer] = useState<Customer | undefined>(undefined)

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/customers')
    const data = await res.json()
    setCustomers(data.customers || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this customer?')) return
    await fetch(`/api/customers/${id}`, { method: 'DELETE' })
    fetchCustomers()
  }

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Customers</h1>
        <p className="page-subtitle">Manage customer accounts and login access.</p>
      </div>

      <div className="page-body">
        {/* Pre-existing login info banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))',
          border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: '12px',
          padding: '14px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '13px',
          color: 'var(--text-secondary)',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(99,102,241,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>
            <strong style={{ color: 'var(--text-primary)' }}>Demo login:</strong>
            {' '}email <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: 4 }}>demo.customer@designbhk.com</code>
            {' '}· password <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: 4 }}>customer123</code>
          </span>
        </div>

        <div className="table-wrap">
          <div className="table-toolbar">
            <input
              className="search-input"
              placeholder="Search customers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="customers-search"
            />
            <button
              id="add-customer-btn"
              className="btn btn-primary"
              onClick={() => { setEditCustomer(undefined); setShowModal(true) }}
            >
              + Add Customer
            </button>
          </div>

          {loading ? (
            <div className="empty-state"><div className="empty-state-text">Loading…</div></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👤</div>
              <div className="empty-state-text">No customers found</div>
              <div className="empty-state-sub">Add a customer to get started</div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer) => (
                  <tr key={customer.id}>
                    <td style={{ fontWeight: 500 }}>{customer.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{customer.email}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{formatDate(customer.createdAt)}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{formatDate(customer.updatedAt)}</td>
                    <td>
                      <ActionsMenu
                        customer={customer}
                        onEdit={(c) => { setEditCustomer(c); setShowModal(true) }}
                        onDelete={handleDelete}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && filtered.length > 0 && (
            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid var(--border)',
              fontSize: '12px',
              color: 'var(--text-muted)',
            }}>
              {filtered.length} customer{filtered.length !== 1 ? 's' : ''} total
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <CustomerModal
          customer={editCustomer}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); fetchCustomers() }}
        />
      )}
    </div>
  )
}
