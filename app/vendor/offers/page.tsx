export default function VendorOffersPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Offers</h1>
        <p className="page-subtitle">Configure discount coupon codes and special promotional deals</p>
      </div>

      <div className="page-body">
        <div className="card" style={{ maxWidth: 600 }}>
          <div className="card-body" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🏷️</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Promotions & Offers</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>This feature is coming soon. Here you will be able to manage promotional codes and offers.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
