'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Submission {
  id: string
  customerName: string
  projectName: string
  status: string
  itemsCount: number
  createdAt: string
}

interface Stats {
  total: number
  drafts: number
  submitted: number
  approved: number
}

interface StatsData {
  stats: Stats
  recent: Submission[]
}

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    APPROVED: 'badge badge-approved',
    DECLINED: 'badge badge-rejected',
    REJECTED: 'badge badge-rejected',
    SUBMITTED: 'badge badge-submitted',
    DRAFT: 'badge badge-pending',
  }
  
  const text = status === 'REJECTED' ? 'DECLINED' : status
  return <span className={cls[status] || 'badge badge-pending'}>{text}</span>
}

export default function DesignerDashboard() {
  const router = useRouter()
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  
  // Carousel/list page index
  const [page, setPage] = useState(0)
  const itemsPerPage = 4

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/designer/stats', { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        setData(json)
        setLastUpdated(new Date())
      }
    } catch (err) {
      console.error('Failed to fetch designer stats:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [fetchData])

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Designer's Portal</h1>
          <p className="page-subtitle">Welcome back!</p>
        </div>
        <div className="page-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
          <div style={{ color: '#999', fontSize: 14 }}>Loading dashboard…</div>
        </div>
      </div>
    )
  }

  const stats = data?.stats || { total: 0, drafts: 0, submitted: 0, approved: 0 }
  const recent = data?.recent || []

  const totalPages = Math.ceil(recent.length / itemsPerPage)
  const startIndex = page * itemsPerPage
  const paginatedItems = recent.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title">Designer's Portal</h1>
            <p className="page-subtitle">Welcome back!</p>
          </div>
          <span className="realtime-dot">
            Live · {lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}
          </span>
        </div>
      </div>

      <div className="page-body">
        {/* Stats Row */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-label">Total submissions</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-sub">{stats.drafts} drafts</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Draft submissions</div>
            <div className="stat-value">{stats.drafts}</div>
            <div className="stat-sub">Ready to submit</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Submitted</div>
            <div className="stat-value">{stats.submitted}</div>
            <div className="stat-sub">Waiting for approval</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Approved</div>
            <div className="stat-value">{stats.approved}</div>
            <div className="stat-sub">In pipeline</div>
          </div>
        </div>

        {/* Quick Actions Row */}
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Quick Actions</h2>
        <div className="two-col" style={{ marginBottom: 28 }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 20 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Create new submission</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Start building a new submission</div>
            </div>
            <button className="btn btn-primary" style={{ padding: '8px 20px', borderRadius: 4, fontWeight: 600 }} onClick={() => router.push('/designer/submissions?open=true')}>
              + Create
            </button>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 20 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>View All Submissions</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Manage all your submissions</div>
            </div>
            <button className="btn btn-secondary" style={{ padding: '8px 20px', borderRadius: 4, fontWeight: 600 }} onClick={() => router.push('/designer/submissions')}>
              View
            </button>
          </div>
        </div>

        {/* Recent Submissions Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Recent submissions</h2>
          <Link href="/designer/submissions" className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 12px', background: '#111', color: '#fff', borderRadius: 4 }}>
            view all
          </Link>
        </div>

        <div className="card" style={{ padding: 24 }}>
          {recent.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div className="empty-state-icon">📝</div>
              <div className="empty-state-text">No submissions yet</div>
              <div className="empty-state-sub">Create your first submission to see it here</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {paginatedItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 24px',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: '#fff',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{item.customerName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{item.projectName}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              ))}

              {/* Chevrons Navigation for paginating recent submissions */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, background: '#eee', opacity: page === 0 ? 0.5 : 1 }}
                    disabled={page === 0}
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, background: '#eee', opacity: page === totalPages - 1 ? 0.5 : 1 }}
                    disabled={page === totalPages - 1}
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
