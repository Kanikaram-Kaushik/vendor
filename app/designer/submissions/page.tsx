'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

interface SubmissionItem {
  description: string
  quantity: number
}

interface Submission {
  id: string
  brandId: string
  brandName: string
  brandEmail: string
  projectName: string
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'DECLINED'
  itemsCount: number
  items?: Array<{
    id: string
    description: string
    quantity: number
    notes?: string
    pricePerSft?: number | null
  }>
  createdAt: string
}

interface Brand {
  id: string
  name: string
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    APPROVED: 'badge badge-approved',
    DECLINED: 'badge badge-rejected',
    SUBMITTED: 'badge badge-submitted',
    DRAFT: 'badge badge-pending',
  }
  return <span className={cls[status] || 'badge badge-pending'}>{status.charAt(0) + status.slice(1).toLowerCase()}</span>
}

function NewSubmissionModal({
  brands,
  onClose,
  onSave,
}: {
  brands: Brand[]
  onClose: () => void
  onSave: () => void
}) {
  const [brandId, setBrandId] = useState(brands[0]?.id || '')
  const [projectName, setProjectName] = useState('')
  const [items, setItems] = useState<SubmissionItem[]>([])
  const [desc, setDesc] = useState('')
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function addItem() {
    if (!desc.trim()) return
    setItems([...items, { description: desc, quantity: qty }])
    setDesc('')
    setQty(1)
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  async function handleSubmit(asDraft: boolean) {
    if (!brandId || !projectName) {
      setError('Please select a Customer and enter a Project Name.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/designer/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId,
          projectName,
          status: asDraft ? 'DRAFT' : 'SUBMITTED',
          items,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to create submission')
        setLoading(false)
        return
      }

      onSave()
    } catch {
      setError('Network error')
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <h2 className="modal-title">New Submission</h2>
        {error && <div className="login-error">{error}</div>}

        <div className="form-group">
          <label className="form-label">Customer (Brand)</label>
          <select className="form-select" value={brandId} onChange={(e) => setBrandId(e.target.value)} required>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Project Name</label>
          <input className="form-input" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="e.g. Customer 1 project details" required />
        </div>

        {/* Submission Items Section */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 12, marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>Items list</div>
          
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <input className="form-input" style={{ flex: 2, padding: 6 }} placeholder="Item description..." value={desc} onChange={e => setDesc(e.target.value)} />
            <input type="number" className="form-input" style={{ flex: 1, minWidth: 60, padding: 6 }} min="1" placeholder="Qty" value={qty} onChange={e => setQty(Number(e.target.value))} />
            <input className="form-input" style={{ flex: 1, minWidth: 80, padding: 6, backgroundColor: '#f5f5f5', cursor: 'not-allowed' }} placeholder="Price / SFT" disabled value="" />
            <button type="button" className="btn btn-secondary" style={{ padding: '6px 12px' }} onClick={addItem}>Add</button>
          </div>

          {items.length > 0 ? (
            <div style={{ maxHeight: 150, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)', padding: '6px 8px', borderRadius: 4, fontSize: 12.5, gap: 8 }}>
                  <span style={{ flex: 2 }}>{item.description} ({item.quantity})</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Price/SFT:</span>
                    <input className="form-input" style={{ width: 80, padding: '2px 6px', fontSize: 12, backgroundColor: '#f5f5f5', cursor: 'not-allowed', textAlign: 'right' }} placeholder="Blocked" disabled value="" />
                  </div>
                  <button type="button" style={{ color: 'red', fontWeight: 600, marginLeft: 4 }} onClick={() => removeItem(idx)}>×</button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No items added yet.</div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-secondary" disabled={loading} onClick={() => handleSubmit(true)}>
            Save as Draft
          </button>
          <button type="button" className="btn btn-primary" disabled={loading} style={{ background: '#111' }} onClick={() => handleSubmit(false)}>
            Submit for Review
          </button>
        </div>
      </div>
    </div>
  )
}

function ActionsMenu({
  submission,
  onView,
  onSubmit,
  onDelete,
}: {
  submission: Submission
  onView: () => void
  onSubmit: (id: string) => void
  onDelete: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="actions-menu-wrap">
      <button className="actions-btn" onClick={() => setOpen(!open)} id={`sub-actions-${submission.id}`}>
        ···
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div className="actions-dropdown">
            <button onClick={() => { setOpen(false); onView() }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              View Details
            </button>
            {submission.status === 'DRAFT' && (
              <>
                <button onClick={() => { setOpen(false); onSubmit(submission.id) }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Submit
                </button>
                <button className="danger" onClick={() => { setOpen(false); onDelete(submission.id) }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                  </svg>
                  Delete
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function ViewSubmissionModal({
  submission,
  onClose,
}: {
  submission: Submission
  onClose: () => void
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 550 }}>
        <h2 className="modal-title">Submission Details</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 11, marginBottom: 2 }}>Customer (Brand)</label>
            <div style={{ fontWeight: 500, fontSize: 13.5 }}>{submission.brandName}</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{submission.brandEmail}</div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 11, marginBottom: 2 }}>Project Name</label>
            <div style={{ fontWeight: 500, fontSize: 13.5 }}>{submission.projectName}</div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>Status</label>
            <div>
              <StatusBadge status={submission.status} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 11, marginBottom: 2 }}>Created Date</label>
            <div style={{ fontSize: 13 }}>{formatDate(submission.createdAt)}</div>
          </div>
        </div>

        {/* Submission Items List */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase' }}>
            Items & Pricing
          </div>
          
          {submission.items && submission.items.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
              {submission.items.map((item, idx) => (
                <div key={item.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)', padding: '8px 12px', borderRadius: 4, fontSize: 13, gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{item.description}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Qty: {item.quantity}</div>
                    {item.notes && <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>Note: {item.notes}</div>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Price/SFT:</span>
                    <input 
                      className="form-input" 
                      style={{ width: 100, padding: '4px 8px', fontSize: 12, backgroundColor: '#f5f5f5', cursor: 'not-allowed', textAlign: 'right' }} 
                      placeholder="Pending" 
                      disabled 
                      value={item.pricePerSft !== undefined && item.pricePerSft !== null ? `₹${item.pricePerSft}` : ''} 
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>No items in this submission.</div>
          )}
        </div>

        <div className="form-actions" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function SubmissionsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showModal, setShowModal] = useState(false)
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [sRes, bRes] = await Promise.all([
        fetch(`/api/designer/submissions?status=${statusFilter}`),
        fetch('/api/brands/public'),
      ])
      const sData = await sRes.json()
      const bData = await bRes.json()
      setSubmissions(sData.submissions || [])
      setBrands(bData.brands || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Open modal if page is navigated with open=true search param
  useEffect(() => {
    if (searchParams.get('open') === 'true') {
      setShowModal(true)
      // clear the param from url
      router.replace('/designer/submissions')
    }
  }, [searchParams, router])

  async function handleSubmitDraft(id: string) {
    const res = await fetch(`/api/designer/submissions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'SUBMITTED' }),
    })
    if (res.ok) fetchData()
  }

  async function handleDeleteDraft(id: string) {
    if (!confirm('Are you sure you want to delete this draft?')) return
    const res = await fetch(`/api/designer/submissions/${id}`, {
      method: 'DELETE',
    })
    if (res.ok) fetchData()
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Submissions</h1>
        <p className="page-subtitle">Manage and track all your submissions</p>
      </div>

      <div className="page-body">
        <div className="table-wrap">
          <div className="table-toolbar">
            <div>
              <select
                className="form-select"
                style={{ width: 140, padding: '6px 12px', fontSize: 13 }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="APPROVED">Approved</option>
                <option value="DECLINED">Declined</option>
              </select>
            </div>
            
            <button
              className="btn btn-primary"
              style={{ background: '#000', color: '#fff', fontWeight: 600, padding: '8px 16px', borderRadius: 4 }}
              onClick={() => setShowModal(true)}
            >
              + New Submission
            </button>
          </div>

          {loading ? (
            <div className="empty-state"><div className="empty-state-text">Loading…</div></div>
          ) : submissions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-text">No submissions found</div>
              <div className="empty-state-sub">Create a new submission to start</div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Project</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedSub(sub)}>
                    <td style={{ fontWeight: 500 }}>{sub.brandName}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{sub.projectName}</td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {sub.itemsCount === 0 ? '-' : sub.itemsCount}
                    </td>
                    <td>
                      <StatusBadge status={sub.status} />
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{formatDate(sub.createdAt)}</td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <ActionsMenu
                        submission={sub}
                        onView={() => setSelectedSub(sub)}
                        onSubmit={handleSubmitDraft}
                        onDelete={handleDeleteDraft}
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
        <NewSubmissionModal
          brands={brands}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false)
            fetchData()
          }}
        />
      )}

      {selectedSub && (
        <ViewSubmissionModal
          submission={selectedSub}
          onClose={() => setSelectedSub(null)}
        />
      )}
    </div>
  )
}

export default function SubmissionsPage() {
  return (
    <Suspense fallback={<div>Loading page...</div>}>
      <SubmissionsContent />
    </Suspense>
  )
}
