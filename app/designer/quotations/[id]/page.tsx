'use client'

import { useState, useEffect, use, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface QuotationItem {
  id: string
  description: string
  quantity: number
  sft: number
  pricePerSft: number | null
  notes?: string
}

interface Quotation {
  id: string
  brandId: string
  brandName: string
  brandEmail: string
  projectName: string
  designerBudget?: number | null
  status: string
  itemsCount: number
  items: QuotationItem[]
  totalPrice: number | null
  isFullyPriced: boolean
  createdAt: string
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    APPROVED: 'badge badge-approved',
    DECLINED: 'badge badge-rejected',
    REJECTED: 'badge badge-rejected',
    SUBMITTED: 'badge badge-submitted',
    ACTIVE: 'badge badge-active',
  }
  return <span className={cls[status] || 'badge badge-pending'}>{status.charAt(0) + status.slice(1).toLowerCase()}</span>
}

function QuotationDetail({ id }: { id: string }) {
  const router = useRouter()
  const [quotation, setQuotation] = useState<Quotation | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchDetail = useCallback(async () => {
    try {
      const res = await fetch('/api/designer/quotations')
      if (res.ok) {
        const data = await res.json()
        const found = (data.quotations || []).find((q: any) => q.id === id)
        setQuotation(found || null)
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

  async function handleApprove() {
    if (!quotation) return
    if (!confirm(`Are you sure you want to select ${quotation.brandName} for this project? All other brand bids will be rejected.`)) return
    setActionLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/designer/quotations/${quotation.id}/select`, {
        method: 'POST'
      })
      if (res.ok) {
        router.push('/designer/quotations')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to select quotation')
        setActionLoading(false)
      }
    } catch {
      setError('Network error')
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: '40px auto', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading quotation details...
      </div>
    )
  }

  if (!quotation) {
    return (
      <div style={{ maxWidth: 800, margin: '40px auto', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--text-primary)' }}>Quotation not found</h3>
        <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => router.push('/designer/quotations')}>
          Go Back
        </button>
      </div>
    )
  }

  const budgetExceeded = quotation.totalPrice && quotation.designerBudget && quotation.totalPrice > quotation.designerBudget

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Quotation Details</h1>
          <p className="page-subtitle">Received from {quotation.brandName}</p>
        </div>
        <button className="btn btn-secondary" onClick={() => router.push('/designer/quotations')}>
          ← Back to List
        </button>
      </div>

      {error && <div className="login-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>Brand Details</label>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{quotation.brandName}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{quotation.brandEmail}</div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>Project Name</label>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{quotation.projectName}</div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>Status</label>
            <div>
              <StatusBadge status={quotation.status} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>Designer Budget</label>
            <div style={{ fontWeight: 600, fontSize: 14 }}>
              {quotation.designerBudget ? `₹${quotation.designerBudget.toLocaleString('en-IN')}` : 'No Budget Set'}
            </div>
          </div>
        </div>

        {/* Itemized pricing table */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 18, marginBottom: 24, backgroundColor: '#fafafa' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Brand Itemized Rates
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {quotation.items.map((item, idx) => {
              const lineTotal = item.pricePerSft ? item.sft * item.quantity * item.pricePerSft : null
              return (
                <div key={item.id || idx} style={{ background: '#fff', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: 6, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{item.description}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                      Size: {item.sft} SFT | Qty: {item.quantity} {item.notes && `| Note: ${item.notes}`}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 120 }}>
                    {item.pricePerSft !== null ? (
                      <>
                        <div style={{ fontWeight: 600, fontSize: 13.5 }}>₹{item.pricePerSft}/SFT</div>
                        <div style={{ fontSize: 11.5, color: '#16a34a', fontWeight: 600, marginTop: 2 }}>Total: ₹{lineTotal?.toLocaleString('en-IN')}</div>
                      </>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Pricing Pending</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {quotation.totalPrice !== null && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid var(--border)', fontWeight: 700 }}>
              <span style={{ fontSize: 13.5 }}>Estimated Brand Total:</span>
              <span style={{ fontSize: 16, color: budgetExceeded ? '#dc2626' : '#16a34a' }}>
                ₹{quotation.totalPrice.toLocaleString('en-IN')}
                {budgetExceeded && <span style={{ fontSize: 11, display: 'block', fontWeight: 500, textAlign: 'right' }}>(Exceeds Budget)</span>}
              </span>
            </div>
          )}
        </div>

        <div className="form-actions" style={{ borderTop: '1px solid var(--border)', paddingTop: 18, justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" className="btn btn-secondary" onClick={() => router.push('/designer/quotations')} disabled={actionLoading}>
            Cancel
          </button>
          {quotation.status === 'SUBMITTED' && quotation.isFullyPriced && (
            <button
              type="button"
              className="btn btn-primary"
              style={{ background: '#000', color: '#fff' }}
              disabled={actionLoading}
              onClick={handleApprove}
            >
              {actionLoading ? 'Approving…' : '✓ Choose & Approve Brand'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <QuotationDetail id={id} />
}
