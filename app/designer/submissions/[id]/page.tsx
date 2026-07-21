'use client'

import { useState, useEffect, use, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface SubmissionItem {
  id: string
  description: string
  quantity: number
  notes?: string
  pricePerSft?: number | null
  sft?: number | null
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
  items?: SubmissionItem[]
  createdAt: string
}

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

function SubmissionDetail({ id }: { id: string }) {
  const router = useRouter()
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(Date.now())

  const fetchDetail = useCallback(async () => {
    try {
      const res = await fetch('/api/designer/submissions')
      if (res.ok) {
        const data = await res.json()
        const found = (data.submissions || []).find((s: any) => s.id === id)
        setSubmission(found || null)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: '40px auto', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading submission details...
      </div>
    )
  }

  if (!submission) {
    return (
      <div style={{ maxWidth: 800, margin: '40px auto', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--text-primary)' }}>Submission not found</h3>
        <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => router.push('/designer/submissions')}>
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">{submission.projectName}</h1>
          <p className="page-subtitle">Submitted on {formatDate(submission.createdAt)}</p>
        </div>
        <button className="btn btn-secondary" onClick={() => router.push('/designer/submissions')}>
          ← Back to List
        </button>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>Brand Assignment</label>
            <div style={{ fontWeight: 600, fontSize: 14, color: submission.brandName === 'Pending Distribution' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
              {submission.brandName}
            </div>
            {submission.brandEmail && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{submission.brandEmail}</div>}
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>Status</label>
            <div>
              <StatusBadge status={submission.status} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>Quotation Window</label>
            <div style={{ fontWeight: 600, fontSize: 14, color: submission.quotationExpiresAt && new Date(submission.quotationExpiresAt).getTime() <= now ? '#b91c1c' : 'var(--text-primary)' }}>
              {submission.quotationWindowHours ? `${submission.quotationWindowHours}h • ${formatTimeRemaining(submission.quotationExpiresAt, now)}` : formatTimeRemaining(submission.quotationExpiresAt, now)}
            </div>
            {submission.quotationExpiresAt && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Closes on {new Date(submission.quotationExpiresAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </div>
            )}
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>Target Budget</label>
            <div style={{ fontWeight: 600, fontSize: 15, color: '#16a34a' }}>
              {submission.designerBudget ? `₹${submission.designerBudget.toLocaleString('en-IN')}` : 'No Budget Set'}
            </div>
          </div>
        </div>

        {submission.referenceImage && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Reference Image
            </div>
            <img
              src={submission.referenceImage}
              alt="Reference for project"
              style={{ width: '100%', maxWidth: 520, borderRadius: 10, border: '1px solid var(--border)', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Submission Items List */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 18, backgroundColor: '#fafafa' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Items & Specifications
          </div>
          
          {submission.items && submission.items.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {submission.items.map((item, idx) => (
                <div key={item.id || idx} style={{ background: '#fff', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: 6, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13.5 }}>{item.description}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                      Size: <strong style={{ color: 'var(--text-primary)' }}>{item.sft || 0} SFT</strong> | Qty: <strong style={{ color: 'var(--text-primary)' }}>{item.quantity}</strong>
                      {item.notes && <span style={{ marginLeft: 10, fontStyle: 'italic', color: 'var(--text-muted)' }}>Note: {item.notes}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>No items in this submission.</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <SubmissionDetail id={id} />
}
