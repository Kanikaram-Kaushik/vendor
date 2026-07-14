'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

interface OverviewData {
  stats: {
    totalUsers: number
    totalBrands: number
    totalQuotes: number
    adminCount: number
    designerCount: number
  }
  pipeline: {
    SUBMITTED: number
    APPROVED: number
    REJECTED: number
    ACTIVE: number
  }
  recentQuotes: Array<{
    id: string
    brandName: string
    projectName: string
    status: string
    createdAt: string
  }>
  recentBrands: Array<{
    id: string
    name: string
    email: string
    status: string
    createdAt: string
  }>
  recentAuditLogs: Array<{
    id: string
    action: string
    entityType: string
    performedBy: string
    details: string | null
    createdAt: string
  }>
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    APPROVED: 'badge badge-approved',
    REJECTED: 'badge badge-rejected',
    SUBMITTED: 'badge badge-submitted',
    ACTIVE: 'badge badge-active',
    PENDING: 'badge badge-pending',
  }
  return <span className={cls[status] || 'badge badge-pending'}>{status}</span>
}

export default function OverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/overview', { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        setData(json)
        setLastUpdated(new Date())
      }
    } catch (err) {
      console.error('Failed to fetch overview:', err)
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
          <h1 className="page-title">Overview</h1>
        </div>
        <div className="page-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
          <div style={{ color: '#999', fontSize: 14 }}>Loading dashboard…</div>
        </div>
      </div>
    )
  }

  const stats = data?.stats
  const pipeline = data?.pipeline

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 className="page-title">Overview</h1>
          <span className="realtime-dot">
            Live · {lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}
          </span>
        </div>
      </div>

      <div className="page-body">
        {/* Stats Row */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Brands</div>
            <div className="stat-value">{stats?.totalBrands ?? 0}</div>
            <div className="stat-sub">Active | Verified</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Quotes</div>
            <div className="stat-value">{stats?.totalQuotes ?? 0}</div>
            <div className="stat-sub">{pipeline?.SUBMITTED ?? 0} submitted for review</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{stats?.totalUsers ?? 0}</div>
            <div className="stat-sub">{stats?.adminCount ?? 0} Admins | {stats?.designerCount ?? 0} Designers</div>
          </div>
        </div>

        {/* Middle Row: Pipeline + Recent Quotes */}
        <div className="two-col">
          {/* Quote Pipeline */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Quote Pipeline</span>
            </div>
            <div className="card-body">
              <div className="pipeline-grid">
                <div className="pipeline-item">
                  <div className="pipeline-label">Submitted</div>
                  <div className="pipeline-value">{pipeline?.SUBMITTED ?? 0}</div>
                </div>
                <div className="pipeline-item">
                  <div className="pipeline-label">Approved</div>
                  <div className="pipeline-value">{pipeline?.APPROVED ?? 0}</div>
                </div>
                <div className="pipeline-item">
                  <div className="pipeline-label">Rejected</div>
                  <div className="pipeline-value">{pipeline?.REJECTED ?? 0}</div>
                </div>
                <div className="pipeline-item">
                  <div className="pipeline-label">Active Windows</div>
                  <div className="pipeline-value">{pipeline?.ACTIVE ?? 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Quotes */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Quotes</span>
              <Link href="/admin/quotes" className="view-all">View all</Link>
            </div>
            <div className="quote-list">
              {data?.recentQuotes.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📋</div>
                  <div className="empty-state-text">No quotes yet</div>
                </div>
              ) : (
                data?.recentQuotes.map((q) => (
                  <div key={q.id} className="quote-row">
                    <div className="quote-avatar">
                      {q.brandName.charAt(0).toUpperCase()}
                    </div>
                    <div className="quote-info">
                      <div className="quote-name">{q.brandName}</div>
                      <div className="quote-project">{q.projectName}</div>
                    </div>
                    <div className="quote-meta">
                      <StatusBadge status={q.status} />
                      <span className="quote-date">{formatDate(q.createdAt)}</span>
                      <Link href="/admin/quotes" className="quote-open-btn">Open</Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row: Recent Brands + Operational Signals */}
        <div className="two-col">
          {/* Recent Brands */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Brands</span>
              <Link href="/admin/brands" className="view-all">View all</Link>
            </div>
            <div className="card-body">
              {data?.recentBrands.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">🏢</div>
                  <div className="empty-state-text">No brands yet</div>
                </div>
              ) : (
                <div className="brand-mini-grid">
                  {data?.recentBrands.map((b) => (
                    <div key={b.id} className="brand-card-mini">
                      <div className="brand-avatar-mini">{b.name.charAt(0).toUpperCase()}</div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Operational Signals */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Operational Signals</span>
              <Link href="/admin/audit-logs" className="view-all">Audit Logs →</Link>
            </div>
            <div className="log-list">
              {data?.recentAuditLogs.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📊</div>
                  <div className="empty-state-text">No activity yet</div>
                </div>
              ) : (
                data?.recentAuditLogs.map((log) => (
                  <div key={log.id} className="log-row">
                    <div className="log-dot" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="log-action">{log.action}</div>
                      {log.details && <div className="log-details">{log.details}</div>}
                    </div>
                    <div className="log-meta">
                      <div className="log-by">{log.performedBy}</div>
                      <div className="log-time">{formatDate(log.createdAt)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
