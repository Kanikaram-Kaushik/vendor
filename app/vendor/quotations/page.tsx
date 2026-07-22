'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface QuoteItem {
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
}

interface Quote {
  id: string
  projectName: string
  status: 'SUBMITTED' | 'APPROVED' | 'DECLINED' | 'ACTIVE' | 'REJECTED'
  designerName: string
  designerEmail: string
  itemsCount: number
  items?: QuoteItem[]
  createdAt: string
  quotationWindowHours?: number | null
  quotationExpiresAt?: string | null
  isQuotationClosed?: boolean
  referenceImage?: string | null
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
    REJECTED: 'badge badge-rejected',
    SUBMITTED: 'badge badge-submitted',
    ACTIVE: 'badge badge-active',
  }
  return <span className={cls[status] || 'badge badge-pending'}>{status.charAt(0) + status.slice(1).toLowerCase()}</span>
}

export default function VendorQuotationsPage() {
  const router = useRouter()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(0)

  const fetchQuotes = useCallback(async () => {
    try {
      const res = await fetch('/api/vendor/quotes')
      if (res.ok) {
        const data = await res.json()
        setQuotes(data.quotes || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQuotes()
  }, [fetchQuotes])

  useEffect(() => {
    setNow(Date.now())
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Quotations</h1>
        <p className="page-subtitle">View and track all quotations submitted to your brand</p>
      </div>

      <div className="page-body">
        <div className="table-wrap">
          <div className="table-toolbar">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
              All Received Quotes
            </span>
          </div>

          {loading ? (
            <div className="empty-state"><div className="empty-state-text">Loading…</div></div>
          ) : quotes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-text">No quotations received yet</div>
              <div className="empty-state-sub">Quotations sent by designers will appear here</div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Submitted By</th>
                  <th>Items</th>
                  <th>Window</th>
                  <th>Status</th>
                  <th>Received Date</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => (
                  <tr key={q.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/vendor/quotations/${q.id}`)}>
                    <td style={{ fontWeight: 500 }}>{q.projectName}</td>
                    <td>
                      <div>{q.designerName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{q.designerEmail}</div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {q.itemsCount === 0 ? '-' : q.itemsCount}
                    </td>
                    <td style={{ color: q.isQuotationClosed ? '#b91c1c' : 'var(--text-secondary)', fontWeight: 500 }}>
                      {q.quotationWindowHours ? `${q.quotationWindowHours}h • ${formatTimeRemaining(q.quotationExpiresAt, now)}` : formatTimeRemaining(q.quotationExpiresAt, now)}
                    </td>
                    <td>
                      <StatusBadge status={q.status} />
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{formatDate(q.createdAt)}</td>
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
