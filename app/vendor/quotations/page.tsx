'use client'

import { useState, useEffect, useCallback } from 'react'

interface QuoteItem {
  id: string
  description: string
  quantity: number
  notes?: string
  pricePerSft?: number | null
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
}

const HARDWARES = ['EBCO', 'HETTICH', 'HAFELE']
const CORES = ['MR Ply', 'BWP Ply', 'HDHMR']
const FINISHES = ['Laminate', 'Acrylic', 'PU']

const ITEM_TYPES = [
  { name: 'Tv Cabinet', code: 1, group: 'Living & Dining / MBR / CBR / GBR' },
  { name: 'Crockery Unit', code: 2, group: 'Living & Dining' },
  { name: 'Puja Unit', code: 2, group: 'Living & Dining' },
  { name: 'Partition', code: 1, group: 'Living & Dining' },
  { name: 'Wardrobe', code: 2, group: 'MBR / CBR / GBR' },
  { name: 'Tv Unit', code: 1, group: 'MBR / CBR / GBR' },
  { name: 'Study Unit', code: 1, group: 'MBR / CBR / GBR' },
  { name: 'Bed', code: 2, group: 'MBR / CBR / GBR' },
  { name: 'Bedside Table', code: 1, group: 'MBR / CBR / GBR' },
  { name: 'Dressing Unit', code: 2, group: 'MBR / CBR / GBR' },
  { name: 'Base Unit (Kitchen)', code: 2, group: 'Kitchen' },
  { name: 'Wall Unit (Kitchen)', code: 2, group: 'Kitchen' },
  { name: 'Loft', code: 1, group: 'Kitchen' },
  { name: 'Tall units (Kitchen)', code: 2, group: 'Kitchen' },
  { name: 'Shoerack', code: 1, group: 'Outside' }
]

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

function QuoteDetailModal({
  quote,
  onClose,
  onSave,
}: {
  quote: Quote
  onClose: () => void
  onSave: () => void
}) {
  const [prices, setPrices] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    quote.items?.forEach((item) => {
      initial[item.id] = item.pricePerSft !== null && item.pricePerSft !== undefined ? String(item.pricePerSft) : ''
    })
    return initial
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [matrixCells, setMatrixCells] = useState<any[]>([])

  // Lookup state per item
  const [lookupItemId, setLookupItemId] = useState<string | null>(null)
  const [selectedItemType, setSelectedItemType] = useState<string>('Tv Cabinet')
  const [selectedCore, setSelectedCore] = useState<string>('MR Ply')
  const [selectedFinish, setSelectedFinish] = useState<string>('Laminate')
  const [selectedHardware, setSelectedHardware] = useState<string>('EBCO')

  // Load pricing matrix cells for lookups
  useEffect(() => {
    async function loadMatrix() {
      try {
        const res = await fetch('/api/vendor/pricing-matrix')
        if (res.ok) {
          const data = await res.json()
          setMatrixCells(data.cells || [])
        }
      } catch (err) {
        console.error('Error fetching matrix cells for lookup:', err)
      }
    }
    loadMatrix()
  }, [])

  const getMatrixPrice = (itemType: string, core: string, finish: string, hw: string) => {
    const matchedType = ITEM_TYPES.find(it => it.name === itemType)
    if (!matchedType) return null
    const code = matchedType.code
    const cell = matrixCells.find(c => 
      c.code === code && 
      c.hardware === hw && 
      c.coreMaterial === core && 
      c.externalFinish === finish
    )
    return cell ? cell.price : null
  }

  async function handleSubmit(status?: string) {
    setLoading(true)
    setError('')
    try {
      const itemsPayload = Object.entries(prices).map(([id, val]) => ({
        id,
        pricePerSft: val.trim() === '' ? null : parseFloat(val),
      }))

      const res = await fetch(`/api/vendor/quotes/${quote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          items: itemsPayload,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to update quote')
        setLoading(false)
        return
      }

      onSave()
    } catch {
      setError('Network error')
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580 }}>
        <h2 className="modal-title">Quotation Details</h2>
        {error && <div className="login-error" style={{ marginBottom: 12 }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 11, marginBottom: 2 }}>Submitted By</label>
            <div style={{ fontWeight: 500, fontSize: 13.5 }}>{quote.designerName}</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{quote.designerEmail}</div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 11, marginBottom: 2 }}>Project Name</label>
            <div style={{ fontWeight: 500, fontSize: 13.5 }}>{quote.projectName}</div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>Status</label>
            <div>
              <StatusBadge status={quote.status} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 11, marginBottom: 2 }}>Received Date</label>
            <div style={{ fontSize: 13 }}>{formatDate(quote.createdAt)}</div>
          </div>
        </div>

        {/* Items Pricing Table */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase' }}>
            Quote Items & Pricing
          </div>

          {quote.items && quote.items.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 280, overflowY: 'auto' }}>
              {quote.items.map((item, idx) => {
                const isLookupOpen = lookupItemId === item.id
                return (
                  <div key={item.id || idx} style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 10, marginBottom: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)', padding: '8px 12px', borderRadius: 4, fontSize: 13, gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{item.description}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Qty: {item.quantity}</div>
                        {item.notes && <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>Note: {item.notes}</div>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ fontSize: 11, padding: '4px 8px', color: 'var(--text-secondary)', background: '#fff', border: '1px solid var(--border)' }}
                          onClick={() => {
                            if (isLookupOpen) {
                              setLookupItemId(null)
                            } else {
                              setLookupItemId(item.id)
                              // Match item type by parsing the description
                              const descLower = item.description.toLowerCase()
                              const found = ITEM_TYPES.find(it => descLower.includes(it.name.toLowerCase()) || it.name.toLowerCase().includes(descLower))
                              if (found) {
                                setSelectedItemType(found.name)
                              } else {
                                setSelectedItemType('Tv Cabinet')
                              }
                            }
                          }}
                        >
                          {isLookupOpen ? 'Cancel' : '📐 Lookup'}
                        </button>
                        <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>₹</span>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          className="form-input"
                          style={{ width: 100, padding: '4px 8px', fontSize: 12.5, textAlign: 'right' }}
                          placeholder="Price / SFT"
                          value={prices[item.id] || ''}
                          onChange={(e) => setPrices({ ...prices, [item.id]: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Expandable pricing matrix calculator */}
                    {isLookupOpen && (
                      <div style={{ backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: 4, padding: 12, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid #f3f4f6', paddingBottom: 4 }}>
                          Price Matrix Calculator
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                          <div>
                            <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 3, fontWeight: 500 }}>Option Type</label>
                            <select className="form-select" style={{ fontSize: 12, padding: '4px 8px', width: '100%', borderRadius: 4 }} value={selectedItemType} onChange={e => setSelectedItemType(e.target.value)}>
                              {ITEM_TYPES.map(it => <option key={it.name} value={it.name}>{it.name} (Code {it.code})</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 3, fontWeight: 500 }}>Core Material</label>
                            <select className="form-select" style={{ fontSize: 12, padding: '4px 8px', width: '100%', borderRadius: 4 }} value={selectedCore} onChange={e => setSelectedCore(e.target.value)}>
                              {CORES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 3, fontWeight: 500 }}>External Finish</label>
                            <select className="form-select" style={{ fontSize: 12, padding: '4px 8px', width: '100%', borderRadius: 4 }} value={selectedFinish} onChange={e => setSelectedFinish(e.target.value)}>
                              {FINISHES.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 3, fontWeight: 500 }}>Hardware</label>
                            <select className="form-select" style={{ fontSize: 12, padding: '4px 8px', width: '100%', borderRadius: 4 }} value={selectedHardware} onChange={e => setSelectedHardware(e.target.value)}>
                              {HARDWARES.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingTop: 8, borderTop: '1px solid #f3f4f6' }}>
                          <div>
                            {(() => {
                              const p = getMatrixPrice(selectedItemType, selectedCore, selectedFinish, selectedHardware)
                              if (p !== null) {
                                return <span style={{ color: 'green', fontWeight: 600, fontSize: 13 }}>Matrix Price: ₹{p} / SFT</span>
                              }
                              return <span style={{ color: 'red', fontWeight: 600, fontSize: 13 }}>Price not set in matrix</span>
                            })()}
                          </div>
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ background: '#000', color: '#fff', fontSize: 12, padding: '6px 12px', borderRadius: 4 }}
                            disabled={getMatrixPrice(selectedItemType, selectedCore, selectedFinish, selectedHardware) === null}
                            onClick={() => {
                              const p = getMatrixPrice(selectedItemType, selectedCore, selectedFinish, selectedHardware)
                              if (p !== null) {
                                setPrices({ ...prices, [item.id]: String(p) })
                                setLookupItemId(null)
                              }
                            }}
                          >
                            Apply Calculated Rate
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>No items in this quote.</div>
          )}
        </div>

        <div className="form-actions" style={{ marginTop: 16 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Close
          </button>
          
          <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
            {quote.status === 'SUBMITTED' && (
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ color: 'var(--badge-rejected-text)', background: 'var(--badge-rejected-bg)', fontWeight: 500 }}
                onClick={() => handleSubmit('DECLINED')}
                disabled={loading}
              >
                Decline Quote
              </button>
            )}
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => handleSubmit()} 
              disabled={loading}
            >
              Save Prices
            </button>
            {quote.status === 'SUBMITTED' && (
              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ background: '#000', color: '#fff' }}
                onClick={() => handleSubmit('APPROVED')}
                disabled={loading}
              >
                Approve & Submit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VendorQuotationsPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)

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
                  <th>Status</th>
                  <th>Received Date</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => (
                  <tr key={q.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedQuote(q)}>
                    <td style={{ fontWeight: 500 }}>{q.projectName}</td>
                    <td>
                      <div>{q.designerName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{q.designerEmail}</div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {q.itemsCount === 0 ? '-' : q.itemsCount}
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

      {selectedQuote && (
        <QuoteDetailModal
          quote={selectedQuote}
          onClose={() => setSelectedQuote(null)}
          onSave={() => {
            setSelectedQuote(null)
            fetchQuotes()
          }}
        />
      )}
    </div>
  )
}
