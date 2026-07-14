'use client'

import { useState, useEffect, useCallback } from 'react'

interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId: string
  performedBy: string
  details: string | null
  createdAt: string
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function actionColor(action: string) {
  if (action.includes('CREATED')) return '#16a34a'
  if (action.includes('DELETED')) return '#dc2626'
  if (action.includes('UPDATED')) return '#0369a1'
  if (action === 'LOGIN') return '#7c3aed'
  return '#999'
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchLogs = useCallback(async () => {
    const res = await fetch('/api/audit-logs')
    const data = await res.json()
    setLogs(data.logs || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.performedBy.toLowerCase().includes(search.toLowerCase()) ||
      (l.details || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Audit Logs</h1>
        <p className="page-subtitle">Complete history of all admin actions.</p>
      </div>

      <div className="page-body">
        <div className="table-wrap">
          <div className="table-toolbar">
            <input
              className="search-input"
              placeholder="Search logs…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="audit-search"
            />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
              {filtered.length} entries
            </span>
          </div>

          {loading ? (
            <div className="empty-state"><div className="empty-state-text">Loading…</div></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <div className="empty-state-text">No audit logs found</div>
            </div>
          ) : (
            <div className="log-list">
              {filtered.map((log) => (
                <div key={log.id} className="log-row">
                  <div
                    className="log-dot"
                    style={{ background: actionColor(log.action) }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        className="log-action"
                        style={{ color: actionColor(log.action) }}
                      >
                        {log.action}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg)', padding: '1px 6px', borderRadius: 4, border: '1px solid var(--border)' }}>
                        {log.entityType}
                      </span>
                    </div>
                    {log.details && <div className="log-details" style={{ marginTop: 2 }}>{log.details}</div>}
                  </div>
                  <div className="log-meta">
                    <div className="log-by">{log.performedBy}</div>
                    <div className="log-time">{formatDateTime(log.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
