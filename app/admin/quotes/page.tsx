'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface BrandEstimation {
  brandId: string
  brandName: string
  totalCost: number | null
  isComplete: boolean
}

interface SubmissionItem {
  id: string
  description: string
  quantity: number
  itemType: string | null
  hardware: string | null
  coreMaterial: string | null
  externalFinish: string | null
  sft: number | null
}

interface DesignerSubmission {
  id: string
  projectName: string
  status: string
  designerName: string
  designerEmail: string
  designerBudget: number | null
  itemsCount: number
  items: SubmissionItem[]
  createdAt: string
  brandEstimations: BrandEstimation[]
}

interface BrandQuote {
  id: string
  brandId: string
  brandName: string
  brandEmail: string
  projectName: string
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'ACTIVE'
  totalCost?: number | null
  isFullyPriced?: boolean
  createdAt: string
  updatedAt: string
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    APPROVED: 'badge badge-approved',
    REJECTED: 'badge badge-rejected',
    DECLINED: 'badge badge-rejected',
    SUBMITTED: 'badge badge-submitted',
    ACTIVE: 'badge badge-active',
  }
  return <span className={cls[status] || 'badge badge-pending'}>{status.charAt(0) + status.slice(1).toLowerCase()}</span>
}

export default function QuotesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'submissions' | 'brand_quotes'>('submissions')
  
  // Designer Submissions State
  const [submissions, setSubmissions] = useState<DesignerSubmission[]>([])
  const [subLoading, setSubLoading] = useState(true)

  // Brand Quotes State
  const [quotes, setQuotes] = useState<BrandQuote[]>([])
  const [quotesLoading, setQuotesLoading] = useState(true)
  const [quotesSearch, setQuotesSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const fetchSubmissionsData = useCallback(async () => {
    setSubLoading(true)
    try {
      const res = await fetch('/api/admin/submissions')
      if (res.ok) {
        const data = await res.json()
        setSubmissions(data.submissions || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubLoading(false)
    }
  }, [])

  const fetchQuotesData = useCallback(async () => {
    setQuotesLoading(true)
    try {
      const qRes = await fetch('/api/quotes')
      const qData = await qRes.json()
      setQuotes(qData.quotes || [])
    } catch (err) {
      console.error(err)
    } finally {
      setQuotesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'submissions') {
      fetchSubmissionsData()
    } else {
      fetchQuotesData()
    }
  }, [activeTab, fetchSubmissionsData, fetchQuotesData])

  // Brand Quotes Actions
  async function handleStatusChange(id: string, status: string) {
    await fetch(`/api/quotes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchQuotesData()
  }

  async function handleDeleteQuote(id: string) {
    if (!confirm('Delete this quote?')) return
    await fetch(`/api/quotes/${id}`, { method: 'DELETE' })
    fetchQuotesData()
  }

  const filteredQuotes = quotes.filter((q) => {
    const matchSearch =
      q.brandName.toLowerCase().includes(quotesSearch.toLowerCase()) ||
      q.projectName.toLowerCase().includes(quotesSearch.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || q.status === statusFilter
    return matchSearch && matchStatus
  })

  // Group quotes by project name or parent submission
  const groupedBrandQuotes = filteredQuotes.reduce((acc, q) => {
    const key = q.projectName || 'Unassigned Project'
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(q)
    return acc
  }, {} as Record<string, BrandQuote[]>)

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Quotes & Submissions</h1>
          <p className="page-subtitle">Manage designer submissions and brand quotation processes.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        <button 
          style={{ 
            padding: '10px 20px', 
            fontWeight: 600, 
            fontSize: 14, 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'submissions' ? '2px solid #000' : 'none', 
            color: activeTab === 'submissions' ? '#000' : 'var(--text-muted)', 
            cursor: 'pointer' 
          }}
          onClick={() => setActiveTab('submissions')}
        >
          Designer Submissions
        </button>
        <button 
          style={{ 
            padding: '10px 20px', 
            fontWeight: 600, 
            fontSize: 14, 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'brand_quotes' ? '2px solid #000' : 'none', 
            color: activeTab === 'brand_quotes' ? '#000' : 'var(--text-muted)', 
            cursor: 'pointer' 
          }}
          onClick={() => setActiveTab('brand_quotes')}
        >
          Brand Quotes (Bidding)
        </button>
      </div>

      <div className="page-body">
        {activeTab === 'submissions' ? (
          <div className="table-wrap">
            <div className="table-toolbar">
              <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Designer Requests Awaiting Review
              </span>
            </div>

            {subLoading ? (
              <div className="empty-state"><div className="empty-state-text">Loading submissions…</div></div>
            ) : submissions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <div className="empty-state-text">No designer submissions found</div>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Designer</th>
                    <th>Budget</th>
                    <th>Items</th>
                    <th>Status</th>
                    <th>Submitted Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub.id}>
                      <td style={{ fontWeight: 600 }}>{sub.projectName}</td>
                      <td>
                        <div>{sub.designerName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub.designerEmail}</div>
                      </td>
                      <td style={{ fontWeight: 500, color: '#16a34a' }}>
                        {sub.designerBudget ? `₹${sub.designerBudget.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{sub.itemsCount} items</td>
                      <td><StatusBadge status={sub.status} /></td>
                      <td style={{ color: 'var(--text-muted)' }}>{formatDate(sub.createdAt)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ fontSize: 12, padding: '4px 10px' }}
                            onClick={() => router.push(`/admin/quotes/submissions/${sub.id}`)}
                          >
                            View Details
                          </button>
                          {sub.status === 'SUBMITTED' && (
                            <button 
                              className="btn btn-primary" 
                              style={{ background: '#000', color: '#fff', fontSize: 12, padding: '4px 10px' }}
                              onClick={() => router.push(`/admin/quotes/submissions/${sub.id}`)}
                            >
                              Review & Distribute
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div>
            <div className="table-toolbar" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="filter-bar">
                {['ALL', 'SUBMITTED', 'APPROVED', 'REJECTED', 'ACTIVE'].map((f) => (
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
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="search-input"
                  placeholder="Search quotes…"
                  value={quotesSearch}
                  onChange={(e) => setQuotesSearch(e.target.value)}
                  id="quotes-search"
                />
                <button id="add-quote-btn" className="btn btn-primary" onClick={() => router.push('/admin/quotes/new')}>
                  + Add Quote Manually
                </button>
              </div>
            </div>

            {quotesLoading ? (
              <div className="table-wrap">
                <div className="empty-state"><div className="empty-state-text">Loading quotes…</div></div>
              </div>
            ) : filteredQuotes.length === 0 ? (
              <div className="table-wrap">
                <div className="empty-state">
                  <div className="empty-state-icon">📋</div>
                  <div className="empty-state-text">No brand quotes found</div>
                </div>
              </div>
            ) : (
              Object.entries(groupedBrandQuotes).map(([projectName, groupQuotes]) => (
                <div className="table-wrap" key={projectName} style={{ marginBottom: 20 }}>
                  <div className="table-toolbar" style={{ background: 'var(--bg-secondary)', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                      📁 Project: {projectName}
                    </span>
                    <span style={{ fontSize: 12.5, color: 'var(--text-muted)', marginLeft: 8 }}>
                      ({groupQuotes.length} Brand Quote{groupQuotes.length > 1 ? 's' : ''})
                    </span>
                  </div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Brand</th>
                        <th>Total Cost</th>
                        <th>Status</th>
                        <th>Created Date</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupQuotes.map((quote) => (
                        <tr key={quote.id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{quote.brandName}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{quote.brandEmail}</div>
                          </td>
                          <td>
                            {quote.totalCost != null ? (
                              <div style={{ fontWeight: 700, color: '#16a34a', fontSize: 13.5 }}>
                                ₹{quote.totalCost.toLocaleString('en-IN')}
                              </div>
                            ) : (
                              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Pricing Pending</span>
                            )}
                          </td>
                          <td><StatusBadge status={quote.status} /></td>
                          <td style={{ color: 'var(--text-muted)' }}>{formatDate(quote.createdAt)}</td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '5px 10px', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
                                onClick={() => router.push(`/designer/quotations/${quote.id}`)}
                              >
                                📄 View Doc
                              </button>
                              <select
                                className="form-select"
                                style={{ width: 'auto', padding: '4px 8px', fontSize: 12 }}
                                value={quote.status}
                                onChange={(e) => handleStatusChange(quote.id, e.target.value)}
                              >
                                <option value="SUBMITTED">Submitted</option>
                                <option value="APPROVED">Approved</option>
                                <option value="REJECTED">Rejected</option>
                                <option value="ACTIVE">Active</option>
                              </select>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '4px 8px', fontSize: 12, color: '#dc2626' }}
                                onClick={() => handleDeleteQuote(quote.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
