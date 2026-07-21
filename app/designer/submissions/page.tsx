'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

interface SubmissionItem {
  description: string
  quantity: number
  itemType?: string
  hardware?: string
  coreMaterial?: string
  externalFinish?: string
  sft?: number
  notes?: string
}

interface Submission {
  id: string
  brandId: string | null
  brandName: string
  brandEmail: string
  projectName: string
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'DECLINED'
  itemsCount: number
  designerBudget?: number | null
  quotationWindowHours?: number | null
  quotationExpiresAt?: string | null
  referenceImage?: string | null
  items?: Array<{
    id: string
    description: string
    quantity: number
    notes?: string
    pricePerSft?: number | null
    itemType?: string | null
    hardware?: string | null
    coreMaterial?: string | null
    externalFinish?: string | null
    sft?: number | null
  }>
  createdAt: string
}

interface Brand {
  id: string
  name: string
}

const HARDWARES = ['EBCO', 'HETTICH', 'HAFELE']
const CORES = ['MR Ply', 'BWP Ply', 'HDHMR']
const FINISHES = ['Laminate', 'Acrylic', 'PU']
const ITEM_TYPES = [
  'Tv Cabinet',
  'Crockery Unit',
  'Puja Unit',
  'Partition',
  'Wardrobe',
  'Tv Unit',
  'Study Unit',
  'Bed',
  'Bedside Table',
  'Dressing Unit',
  'Base Unit (Kitchen)',
  'Wall Unit (Kitchen)',
  'Loft',
  'Tall units (Kitchen)',
  'Shoerack'
]

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTimeRemaining(expiresAt?: string | null, now = Date.now()) {
  if (!expiresAt) return 'No window set'
  const remaining = new Date(expiresAt).getTime() - now
  if (remaining <= 0) return 'Closed'
  const totalMinutes = Math.ceil(remaining / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`
}

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    APPROVED: 'badge badge-approved',
    DECLINED: 'badge badge-rejected',
    SUBMITTED: 'badge badge-submitted',
    DRAFT: 'badge badge-pending',
    ACTIVE: 'badge badge-active',
  }
  return <span className={cls[status] || 'badge badge-pending'}>{status.charAt(0) + status.slice(1).toLowerCase()}</span>
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

function SubmissionsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [now, setNow] = useState(Date.now())

  const fetchData = useCallback(async () => {
    try {
      const sRes = await fetch(`/api/designer/submissions?status=${statusFilter}`)
      const sData = await sRes.json()
      setSubmissions(sData.submissions || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  // Redirect to new page if navigated with open=true search param
  useEffect(() => {
    if (searchParams.get('open') === 'true') {
      router.push('/designer/submissions/new')
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
              onClick={() => router.push('/designer/submissions/new')}
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
                  <th>Budget</th>
                  <th>Quote Window</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/designer/submissions/${sub.id}`)}>
                    <td style={{ fontWeight: 500 }}>{sub.brandName}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{sub.projectName}</td>
                    <td style={{ fontWeight: 500, color: '#16a34a' }}>
                      {sub.designerBudget ? `₹${sub.designerBudget.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td style={{ fontWeight: 500, color: sub.quotationExpiresAt && new Date(sub.quotationExpiresAt).getTime() <= now ? '#b91c1c' : 'var(--text-secondary)' }}>
                      {sub.quotationWindowHours ? `${sub.quotationWindowHours}h • ${formatTimeRemaining(sub.quotationExpiresAt, now)}` : formatTimeRemaining(sub.quotationExpiresAt, now)}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {sub.itemsCount === 0 ? '-' : `${sub.itemsCount} items`}
                    </td>
                    <td>
                      <StatusBadge status={sub.status} />
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{formatDate(sub.createdAt)}</td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <ActionsMenu
                        submission={sub}
                        onView={() => router.push(`/designer/submissions/${sub.id}`)}
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
