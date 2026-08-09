'use client'

import { useState, useEffect, use, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { parseReferenceImages } from '@/lib/reference-image'
import { formatQuotationDeadline } from '@/lib/quote-window'
import { ReferenceImageGallery } from '@/components/ReferenceImageGallery'

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
  image?: string | null
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
  { name: 'Shoerack', code: 1, group: 'Outside' },
  { name: 'False Ceiling', code: 1, group: 'Ceiling' },
  { name: 'Electrical Work', code: 1, group: 'MEP Services' },
  { name: 'Plumbing Work', code: 1, group: 'MEP Services' },
  { name: 'Painting & Polish', code: 1, group: 'Finishes' },
  { name: 'Flooring & Tiling', code: 1, group: 'Finishes' },
  { name: 'Lighting & Fixtures', code: 1, group: 'Lighting' },
  { name: 'Wall Paneling', code: 1, group: 'Wall Features' },
  { name: 'CNC Partition', code: 1, group: 'Partitions' },
  { name: 'Custom Carpentry', code: 1, group: 'Custom Works' }
]

const NON_WOOD_ITEMS = [
  { name: 'False Ceiling', units: ['sft'] },
  { name: 'Electrical Work', units: ['nos'] },
  { name: 'Plumbing Work', units: ['nos'] },
  { name: 'Painting & Polish', units: ['sft'] },
  { name: 'Flooring & Tiling', units: ['sft'] },
  { name: 'Lighting & Fixtures', units: ['nos'] },
  { name: 'Wall Paneling', units: ['sft'] },
  { name: 'CNC Partition', units: ['sft'] },
  { name: 'Custom Carpentry', units: ['sft', 'nos'] }
]

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTimeRemaining(expiresAt?: string | null, now = Date.now()) {
  if (!expiresAt) return 'No window set'
  const remaining = new Date(expiresAt).getTime() - now
  if (remaining <= 0) return 'Closed'

  const totalSeconds = Math.floor(remaining / 1000)
  const days = Math.floor(totalSeconds / (3600 * 24))
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0 || days > 0) parts.push(`${hours}h`)
  if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`)
  parts.push(`${seconds}s`)

  return `${parts.join(' ')} left`
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

interface MatrixCell {
  code: number
  hardware: string
  coreMaterial: string
  externalFinish: string
  price: number
}

interface NonWoodMatrixCell {
  itemType: string
  unit: string
  price: number
}

interface NonWoodEdit {
  itemType: string
  unit: string
  area: string
  pricePerUnit: string
}

function QuoteDetail({ id }: { id: string }) {
  const router = useRouter()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [prices, setPrices] = useState<Record<string, string>>({})
  const [nonWoodEdits, setNonWoodEdits] = useState<Record<string, NonWoodEdit>>({})
  const [error, setError] = useState('')
  const [matrixCells, setMatrixCells] = useState<MatrixCell[]>([])
  const [nonWoodMatrixCells, setNonWoodMatrixCells] = useState<NonWoodMatrixCell[]>([])
  const [now, setNow] = useState(0)

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
          setNonWoodMatrixCells(data.nonWoodCells || [])
        }
      } catch (err) {
        console.error('Error fetching matrix cells for lookup:', err)
      }
    }
    loadMatrix()
  }, [])

  const fetchDetail = useCallback(async () => {
    try {
      const res = await fetch('/api/vendor/quotes')
      if (res.ok) {
        const data = await res.json()
        const found = (data.quotes || []).find((q: Quote) => q.id === id)
        if (found) {
          setQuote(found)
          const initial: Record<string, string> = {}
          const initialNw: Record<string, NonWoodEdit> = {}
          found.items?.forEach((item: QuoteItem) => {
            initial[item.id] = item.pricePerSft !== null && item.pricePerSft !== undefined ? String(item.pricePerSft) : ''
            
            // Populate non-wood edits if this is a non-wood item or likely one
            const isNonWood = item.itemType ? 
                !ITEM_TYPES.some(it => it.name === item.itemType) : 
                false
            
            if (isNonWood || (item.itemType && ['False Ceiling', 'Electrical Work', 'Plumbing Work'].some(t => item.itemType?.includes(t)))) {
               initialNw[item.id] = {
                 itemType: item.itemType || 'False Ceiling',
                 unit: item.sft ? 'sft' : 'nos',
                 area: item.sft ? String(item.sft) : String(item.quantity),
                 pricePerUnit: item.pricePerSft !== null && item.pricePerSft !== undefined ? String(item.pricePerSft) : ''
               }
            }
          })
          setPrices(initial)
          setNonWoodEdits(initialNw)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  useEffect(() => {
    setNow(Date.now())
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
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
    if (!quote) return
    setActionLoading(true)
    setError('')
    try {
      const itemsPayload = Object.entries(prices).map(([itemId, val]) => {
        // If it's a non-wood item, we send the edited area, qty, itemType
        const nw = nonWoodEdits[itemId]
        if (nw) {
          return {
            id: itemId,
            pricePerSft: nw.pricePerUnit.trim() === '' ? null : parseFloat(nw.pricePerUnit),
            itemType: nw.itemType,
            sft: nw.unit === 'sft' ? nw.area : null,
            quantity: nw.unit === 'nos' ? nw.area : '1'
          }
        }
        return {
          id: itemId,
          pricePerSft: val.trim() === '' ? null : parseFloat(val),
        }
      })

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
        setActionLoading(false)
        return
      }

      router.push('/vendor/quotations')
    } catch {
      setError('Network error')
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: '40px auto', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading quotation details...
      </div>
    )
  }

  if (!quote) {
    return (
      <div style={{ maxWidth: 800, margin: '40px auto', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--text-primary)' }}>Quotation not found</h3>
        <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => router.push('/vendor/quotations')}>
          Go Back
        </button>
      </div>
    )
  }

  const isEditable = quote.status === 'SUBMITTED' && !quote.isQuotationClosed

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Quotation Details</h1>
          <p className="page-subtitle">Submitted by designer {quote.designerName}</p>
        </div>
        <button className="btn btn-secondary" onClick={() => router.push('/vendor/quotations')}>
          ← Back to List
        </button>
      </div>

      {error && <div className="login-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Designer Details</label>
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>{quote.designerName}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{quote.designerEmail}</div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Project Name</label>
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>{quote.projectName}</div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Status</label>
            <div>
              <StatusBadge status={quote.status} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Quotation Deadline</label>
            <div style={{ fontWeight: 600, color: quote.isQuotationClosed ? '#b91c1c' : 'var(--text-primary)' }}>
                {formatQuotationDeadline(quote.quotationExpiresAt)}
            </div>
            {quote.quotationExpiresAt && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {formatTimeRemaining(quote.quotationExpiresAt, now)}
              </div>
            )}
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Received Date</label>
            <div>{formatDate(quote.createdAt)}</div>
          </div>
        </div>

        {quote.isQuotationClosed && (
          <div className="login-error" style={{ marginBottom: 20, background: '#fef2f2', color: '#991b1b', borderColor: '#fecaca' }}>
            This quotation window has closed. Vendors can no longer submit or update prices.
          </div>
        )}

        <ReferenceImageGallery referenceImage={quote.referenceImage} />

                    {/* Items Pricing Table */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 18, marginBottom: 24, backgroundColor: '#fafafa' }}>
          {/* Calculate and display Total SFT */}
                    {(() => {
                      const totalSft = quote.items?.reduce((sum, item) => sum + ((item.sft || 0) * (item.quantity || 1)), 0) || 0
                      return (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border-light)' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Quote Items & Pricing
                          </span>
                          {totalSft > 0 && (
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', background: '#e2e8f0', padding: '2px 10px', borderRadius: 12 }}>
                              Total Area: {Math.round(totalSft * 100) / 100} SFT
                            </span>
                          )}
                        </div>
                      )
                    })()}

          {quote.items && quote.items.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(() => {
                const refImages = parseReferenceImages(quote.referenceImage)
                return quote.items.map((item, idx) => {
                  if (nonWoodEdits[item.id]) {
                    const nw = nonWoodEdits[item.id]
                    const handleNwChange = (field: keyof NonWoodEdit, val: string) => {
                      setNonWoodEdits(prev => ({ ...prev, [item.id]: { ...nw, [field]: val } }))
                    }
                    
                    const computedTotal = (parseFloat(nw.area) || 0) * (parseFloat(nw.pricePerUnit) || 0)
                    return (
                      <div key={item.id || idx} style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 12, marginBottom: 4 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', background: '#fff', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: 8, fontSize: 13, gap: 16 }}>
                          <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                             <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>Item Type</label>
                             <select disabled={!isEditable} className="form-select" style={{ fontSize: 13, padding: '6px 10px', borderRadius: 4 }} value={nw.itemType} onChange={e => handleNwChange('itemType', e.target.value)}>
                               {NON_WOOD_ITEMS.map(it => <option key={it.name} value={it.name}>{it.name}</option>)}
                             </select>
                          </div>
                          <div style={{ flex: '0 1 100px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                             <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>Unit</label>
                             <select disabled={!isEditable} className="form-select" style={{ fontSize: 13, padding: '6px 10px', borderRadius: 4 }} value={nw.unit} onChange={e => handleNwChange('unit', e.target.value)}>
                               <option value="sft">SFT</option>
                               <option value="nos">Nos</option>
                             </select>
                          </div>
                          <div style={{ flex: '0 1 120px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                             <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>Area / Qty</label>
                             <input disabled={!isEditable} type="number" min="0" step="any" className="form-input" style={{ fontSize: 13, padding: '6px 10px', borderRadius: 4 }} value={nw.area} onChange={e => handleNwChange('area', e.target.value)} />
                          </div>
                          <div style={{ flex: '0 1 120px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                             <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>Price / Unit (₹)</label>
                             <input disabled={!isEditable} type="number" min="0" step="any" className="form-input" style={{ fontSize: 13, padding: '6px 10px', borderRadius: 4 }} value={nw.pricePerUnit} onChange={e => handleNwChange('pricePerUnit', e.target.value)} />
                          </div>
                          <div style={{ flex: '0 1 120px', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                             <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>Total Price (₹)</label>
                             <div style={{ fontSize: 14, fontWeight: 700, padding: '6px 0', color: computedTotal > 0 ? '#16a34a' : 'inherit' }}>₹{computedTotal.toFixed(2)}</div>
                          </div>
                        </div>
                        
                        {/* Lookup Matrix functionality for non-wood */}
                        {isEditable && (
                          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ fontSize: 11.5, padding: '4px 12px', borderRadius: 4, background: '#fff' }}
                              onClick={() => {
                                const cell = nonWoodMatrixCells.find(c => c.itemType === nw.itemType && c.unit === nw.unit)
                                if (cell) {
                                  handleNwChange('pricePerUnit', String(cell.price))
                                } else {
                                  alert('No standard rate found in your Pricing Matrix for this Item & Unit.')
                                }
                              }}
                            >
                              📐 Lookup Matrix Rate
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  }

                  const isLookupOpen = lookupItemId === item.id
                  const displayImg = item.image || (refImages[idx] || refImages[0] || null)
                  return (
                    <div key={item.id || idx} style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 12, marginBottom: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: 8, fontSize: 13, gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                          {displayImg && (
                            <img src={displayImg} alt={`${item.itemType || 'Unit'} reference`} style={{ width: 84, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)', flexShrink: 0 }} />
                          )}
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13.5 }}>{item.description}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                              {item.sft && `Size: ${item.sft} SFT | `}Qty: {item.quantity}
                            </div>
                            {item.notes && <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 4, fontStyle: 'italic' }}>Note: {item.notes}</div>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {isEditable && (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ fontSize: 11.5, padding: '6px 12px', color: 'var(--text-secondary)', background: '#fff', border: '1px solid var(--border)', borderRadius: 4 }}
                              onClick={() => {
                                if (isLookupOpen) {
                                  setLookupItemId(null)
                                } else {
                                  setLookupItemId(item.id)
                                  if (item.itemType) setSelectedItemType(item.itemType)
                                  if (item.coreMaterial) setSelectedCore(item.coreMaterial)
                                  if (item.externalFinish) setSelectedFinish(item.externalFinish)
                                  if (item.hardware) setSelectedHardware(item.hardware)

                                  if (!item.itemType) {
                                    const descLower = item.description.toLowerCase()
                                    const found = ITEM_TYPES.find(it => descLower.includes(it.name.toLowerCase()) || it.name.toLowerCase().includes(descLower))
                                    if (found) {
                                      setSelectedItemType(found.name)
                                    } else {
                                      setSelectedItemType('Tv Cabinet')
                                    }
                                  }
                                }
                              }}
                            >
                              {isLookupOpen ? 'Cancel' : '📐 Lookup Matrix'}
                            </button>
                          )}
                          <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>₹</span>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            className="form-input"
                            style={{ width: 110, padding: '6px 10px', fontSize: 13, textAlign: 'right', borderRadius: 4 }}
                            placeholder="Price / SFT"
                            disabled={!isEditable}
                            value={prices[item.id] || ''}
                            onChange={(e) => setPrices({ ...prices, [item.id]: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Expandable pricing matrix calculator */}
                      {isLookupOpen && (
                        <div style={{ backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: 6, padding: 14, marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid #f3f4f6', paddingBottom: 6 }}>
                            Price Matrix Calculator
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            <div>
                              <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4, fontWeight: 600 }}>Option Type</label>
                              <select className="form-select" style={{ fontSize: 12, padding: '6px 10px', width: '100%', borderRadius: 4 }} value={selectedItemType} onChange={e => setSelectedItemType(e.target.value)}>
                                {ITEM_TYPES.map(it => <option key={it.name} value={it.name}>{it.name} (Code {it.code})</option>)}
                              </select>
                            </div>
                            <div>
                              <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4, fontWeight: 600 }}>Core Material</label>
                              <select className="form-select" style={{ fontSize: 12, padding: '6px 10px', width: '100%', borderRadius: 4 }} value={selectedCore} onChange={e => setSelectedCore(e.target.value)}>
                                {CORES.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                            <div>
                              <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4, fontWeight: 600 }}>External Finish</label>
                              <select className="form-select" style={{ fontSize: 12, padding: '6px 10px', width: '100%', borderRadius: 4 }} value={selectedFinish} onChange={e => setSelectedFinish(e.target.value)}>
                                {FINISHES.map(f => <option key={f} value={f}>{f}</option>)}
                              </select>
                            </div>
                            <div>
                              <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4, fontWeight: 600 }}>Hardware</label>
                              <select className="form-select" style={{ fontSize: 12, padding: '6px 10px', width: '100%', borderRadius: 4 }} value={selectedHardware} onChange={e => setSelectedHardware(e.target.value)}>
                                {HARDWARES.map(h => <option key={h} value={h}>{h}</option>)}
                              </select>
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingTop: 10, borderTop: '1px solid #f3f4f6' }}>
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
                })
              })()}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>No items in this quote.</div>
          )}
        </div>

        <div className="form-actions" style={{ borderTop: '1px solid var(--border)', paddingTop: 18, justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" className="btn btn-secondary" onClick={() => router.push('/vendor/quotations')} disabled={actionLoading}>
            Cancel
          </button>
          {isEditable && (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={actionLoading}
                onClick={() => handleSubmit('DRAFT')}
              >
                Save Draft
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={actionLoading}
                onClick={() => handleSubmit('DECLINED')}
              >
                Decline
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ background: '#000', color: '#fff' }}
                disabled={actionLoading}
                onClick={() => handleSubmit('SUBMITTED')}
              >
                {actionLoading ? 'Submitting…' : '✓ Approve & Submit Quote'}
              </button>
            </>
          )}
          {!isEditable && quote.status === 'SUBMITTED' && quote.isQuotationClosed && (
            <button type="button" className="btn btn-secondary" disabled>
              Quotation Window Closed
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <QuoteDetail id={id} />
}
