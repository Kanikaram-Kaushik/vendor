'use client'

import { useState, useEffect, useCallback } from 'react'
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

export default function DesignerQuotationsPage() {
  const router = useRouter()
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/designer/quotations')
      if (res.ok) {
        const data = await res.json()
        setQuotations(data.quotations || [])
      }
    } catch (err) {
      console.error('Error fetching quotations:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Received Quotations</h1>
        <p className="page-subtitle">Compare and select rates from brands distributed for your projects</p>
      </div>

      <div className="page-body">
        <div className="table-wrap">
          <div className="table-toolbar">
            <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-secondary)' }}>
              Offers from Brands
            </span>
          </div>

          {loading ? (
            <div className="empty-state"><div className="empty-state-text">Loading quotations…</div></div>
          ) : quotations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-text">No quotations received yet</div>
              <div className="empty-state-sub">Brand bids will appear here once Admin distributes your submissions</div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Brand Name</th>
                  <th>Budget</th>
                  <th>Bid Total</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map((q) => {
                  const budgetExceeded = q.totalPrice && q.designerBudget && q.totalPrice > q.designerBudget
                  return (
                    <tr key={q.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/designer/quotations/${q.id}`)}>
                      <td style={{ fontWeight: 600 }}>{q.projectName}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{q.brandName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{q.brandEmail}</div>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>
                        {q.designerBudget ? `₹${q.designerBudget.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td>
                        {q.totalPrice !== null ? (
                          <div style={{ fontWeight: 600, color: budgetExceeded ? '#dc2626' : '#16a34a' }}>
                            ₹{q.totalPrice.toLocaleString('en-IN')}
                            {budgetExceeded && <span style={{ fontSize: 10, display: 'block', fontWeight: 500 }}>(Over Budget)</span>}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>Pricing Pending</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={q.status} />
                      </td>
                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: 12 }}
                          onClick={() => router.push(`/designer/quotations/${q.id}`)}
                        >
                          View & Action
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
