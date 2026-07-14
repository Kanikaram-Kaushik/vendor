'use client'

export default function ConfigurationPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Configuration</h1>
        <p className="page-subtitle">Manage application settings.</p>
      </div>

      <div className="page-body">
        <div className="card" style={{ maxWidth: 560 }}>
          <div className="card-header">
            <span className="card-title">General Settings</span>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Application Name</label>
              <input className="form-input" defaultValue="DesignBHK" />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Email</label>
              <input type="email" className="form-input" defaultValue="admin@designbhk.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Support Phone</label>
              <input className="form-input" defaultValue="+91 98765 43210" />
            </div>
            <div style={{ marginTop: 20, padding: '14px 16px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Database Info</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Provider: <strong>Neon PostgreSQL</strong></div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>ORM: <strong>Prisma</strong></div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary">Save Changes</button>
            </div>
          </div>
        </div>

        <div className="card" style={{ maxWidth: 560, marginTop: 16 }}>
          <div className="card-header">
            <span className="card-title">Danger Zone</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Re-seed Database</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Reset all data to initial seed values. This cannot be undone.</div>
              </div>
              <button
                className="btn btn-danger"
                id="reseed-btn"
                onClick={async () => {
                  if (!confirm('This will erase ALL data and reseed. Are you sure?')) return
                  const res = await fetch('/api/seed', { method: 'POST' })
                  const data = await res.json()
                  if (data.success) alert('Database reseeded! Admin: admin@designbhk.com / admin123')
                  else alert('Seed failed: ' + data.error)
                }}
              >
                Re-seed
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
