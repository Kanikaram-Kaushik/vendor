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
  parentQuoteId?: string | null
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

  // Group quotations by parent project / submission
  const groupedProjects = quotations.reduce((acc, q) => {
    const key = q.parentQuoteId || q.projectName
    if (!acc[key]) {
      acc[key] = {
        projectName: q.projectName,
        designerBudget: q.designerBudget,
        quotes: [],
      }
    }
    acc[key].quotes.push(q)
    return acc
  }, {} as Record<string, { projectName: string; designerBudget?: number | null; quotes: Quotation[] }>)

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Received Quotations</h1>
        <p className="page-subtitle">Compare and select rates from brands distributed for your projects</p>
      </div>

      <div className="page-body">
        {loading ? (
          <div className="table-wrap">
            <div className="empty-state"><div className="empty-state-text">Loading quotations…</div></div>
          </div>
        ) : quotations.length === 0 ? (
          <div className="table-wrap">
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-text">No quotations received yet</div>
              <div className="empty-state-sub">Brand bids will appear here once Admin distributes your submissions</div>
            </div>
          </div>
        ) : (
          Object.entries(groupedProjects).map(([key, group]) => (
            <div className="table-wrap" key={key} style={{ marginBottom: 24 }}>
              <div className="table-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                    📁 Project: {group.projectName}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 12 }}>
                    ({group.quotes.length} Brand Quote{group.quotes.length > 1 ? 's' : ''})
                  </span>
                </div>
                {group.designerBudget && (
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#16a34a' }}>
                    Target Budget: ₹{group.designerBudget.toLocaleString('en-IN')}
                  </div>
                )}
              </div>

              <table className="data-table">
                <thead>
                  <tr>
                    <th>Brand Name</th>
                    <th>Bid Total</th>
                    <th>Status</th>
                    <th>Date Received</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {group.quotes.map((q) => {
                    const budgetExceeded = q.totalPrice && q.designerBudget && q.totalPrice > q.designerBudget
                    return (
                      <tr key={q.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/designer/quotations/${q.id}`)}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{q.brandName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{q.brandEmail}</div>
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
                        <td style={{ color: 'var(--text-muted)' }}>{formatDate(q.createdAt)}</td>
                        <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '6px 10px', fontSize: 12 }}
                              onClick={() => router.push(`/designer/quotations/${q.id}`)}
                            >
                              View Details
                            </button>
                            {q.status !== 'APPROVED' && (
                              <button
                                className="btn btn-primary"
                                style={{ padding: '6px 10px', fontSize: 12, background: '#16a34a', borderColor: '#16a34a' }}
                                onClick={async () => {
                                  await fetch(`/api/designer/quotations/${q.id}/select`, { method: 'POST' })
                                  fetchData()
                                }}
                              >
                                Approve
                              </button>
                            )}
                            {q.status !== 'REJECTED' && (
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '6px 10px', fontSize: 12, color: '#dc2626', borderColor: '#fca5a5' }}
                                onClick={async () => {
                                  await fetch(`/api/quotes/${q.id}`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ status: 'REJECTED' }),
                                  })
                                  fetchData()
                                }}
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
