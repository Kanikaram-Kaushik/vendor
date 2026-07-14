export default function VendorShopPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Shop</h1>
        <p className="page-subtitle">Manage your product catalog and storefront items</p>
      </div>

      <div className="page-body">
        <div className="card" style={{ maxWidth: 600 }}>
          <div className="card-body" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🛍️</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Storefront & Products</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>This feature is coming soon. Here you will be able to manage your brand shop items.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
