'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatQuotationDeadline, toDateTimeLocalValue } from '@/lib/quote-window'
import { formatReferenceImages } from '@/lib/reference-image'


interface SubmissionItem {
  description: string
  quantity: number
  itemType?: string
  hardware?: string
  coreMaterial?: string
  externalFinish?: string
  sft?: number
  notes?: string
  image?: string
  imageName?: string
}

const HARDWARES = ['EBCO', 'HETTICH', 'HAFELE']
const CORES = ['MR Ply', 'BWP Ply', 'HDHMR']
const FINISHES = ['Laminate', 'Acrylic', 'PU']
const ITEM_DESCRIPTIONS: Record<string, string> = {
  'Tv Cabinet': 'Storage or media unit for TV and entertainment equipment with cable management.',
  'Crockery Unit': 'Glass or solid door display cabinet for dining area tableware and glassware.',
  'Puja Unit': 'Sacred shrine unit designed for daily prayers, brass items, and idols.',
  'Partition': 'Divider screen or open shelving unit to create visual zones in living/dining areas.',
  'Wardrobe': 'Bedroom clothing storage unit with hanging rods, drawers, and shelves.',
  'Tv Unit': 'Wall-mounted or standing bedroom/living room TV backdrop panel and console.',
  'Study Unit': 'Work desk with overhead shelving or drawer storage for laptops and books.',
  'Bed': 'Custom bed frame structure with optional headboard and under-bed storage.',
  'Bedside Table': 'Compact nightstand for beside-the-bed lighting, books, and daily essentials.',
  'Dressing Unit': 'Mirror frame unit with dedicated vanity drawers and cosmetics storage.',
  'Base Unit (Kitchen)': 'Under-counter kitchen storage cabinets housing sinks, drawers, and pullouts.',
  'Wall Unit (Kitchen)': 'Over-counter wall-mounted kitchen cabinets for spices, dishes, and groceries.',
  'Loft': 'Top-tier overhead storage cabinets above wardrobes or kitchen wall units.',
  'Tall units (Kitchen)': 'Full-height kitchen pantry cabinet for appliances (oven, microwave) and groceries.',
  'Shoerack': 'Entryway footwear storage console with ventilation and seating options.'
}

const ITEM_TYPES = Object.keys(ITEM_DESCRIPTIONS)

export default function NewSubmissionPage() {
  const router = useRouter()
  const [projectName, setProjectName] = useState('')
  const [designerBudget, setDesignerBudget] = useState('')
  const [quotationDeadline, setQuotationDeadline] = useState('')
  // Computed on the client only — a render-time new Date() would differ
  // between the server and client markup and trip a hydration mismatch.
  const [minDeadline, setMinDeadline] = useState('')
  const [referenceImages, setReferenceImages] = useState<string[]>([])
  const [items, setItems] = useState<SubmissionItem[]>([])

  // Item detail fields
  const [itemType, setItemType] = useState(ITEM_TYPES[0])
  const [coreMaterial, setCoreMaterial] = useState(CORES[0])
  const [externalFinish, setExternalFinish] = useState(FINISHES[0])
  const [hardware, setHardware] = useState(HARDWARES[0])
  const [width, setWidth] = useState<number | ''>(5)
  const [length, setLength] = useState<number | ''>(2)
  const [qty, setQty] = useState(1)
  const [itemNotes, setItemNotes] = useState('')
  const [itemImage, setItemImage] = useState('')
  const [itemImageName, setItemImageName] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setMinDeadline(toDateTimeLocalValue(new Date()))
  }, [])

  function handleReferenceImagesChange(files: FileList | null) {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    const nonImages = fileArray.filter((f) => !f.type.startsWith('image/'))
    if (nonImages.length > 0) {
      setError('Please select only image files for reference images.')
      return
    }

    setError('')

    const readPromises = fileArray.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
          reader.onerror = () => reject(new Error(`Failed to read file ${file.name}`))
          reader.readAsDataURL(file)
        })
    )

    Promise.all(readPromises)
      .then((results) => {
        const valid = results.filter(Boolean)
        setReferenceImages((prev) => [...prev, ...valid])
      })
      .catch((err) => {
        console.error(err)
        setError('Failed to read some of the selected images.')
      })
  }

  function removeReferenceImage(index: number) {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index))
  }

  function addItem() {
    if (!width || Number(width) <= 0 || !length || Number(length) <= 0) {
      setError('Please enter a valid Width and Length (greater than 0).')
      return
    }
    if (qty <= 0) {
      setError('Quantity must be greater than 0.')
      return
    }
    setError('')

    const description = `${itemType} (${coreMaterial}, ${externalFinish}, ${hardware} hardware)`
    const sftVal = Math.round(Number(width) * Number(length) * 100) / 100
    setItems([
      ...items,
      {
        description,
        quantity: qty,
        itemType,
        coreMaterial,
        externalFinish,
        hardware,
        sft: sftVal,
        notes: itemNotes,
        image: itemImage || undefined,
        imageName: itemImageName || undefined,
      },
    ])
    setItemNotes('')
    setQty(1)
    setWidth(5)
    setLength(2)
    setItemImage('')
    setItemImageName('')
  }

  function handleItemImageChange(file: File | null) {
    if (!file) {
      setItemImage('')
      setItemImageName('')
      return
    }
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file for the item.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setItemImage(typeof reader.result === 'string' ? reader.result : '')
      setItemImageName(file.name)
      setError('')
    }
    reader.onerror = () => setError('Failed to read the selected item image.')
    reader.readAsDataURL(file)
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  async function handleSubmit(asDraft: boolean) {
    if (!projectName) {
      setError('Please enter a Project Name.')
      return
    }
    if (items.length === 0) {
      setError('Please add at least one item.')
      return
    }
    if (!asDraft) {
      if (!quotationDeadline) {
        setError('Please pick a quotation deadline.')
        return
      }
      const parsedDeadline = new Date(quotationDeadline)
      if (Number.isNaN(parsedDeadline.getTime())) {
        setError('Please pick a valid quotation deadline.')
        return
      }
      if (parsedDeadline.getTime() <= Date.now()) {
        setError('The quotation deadline must be in the future.')
        return
      }
    }
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/designer/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName,
          designerBudget: designerBudget ? parseFloat(designerBudget) : null,
          status: asDraft ? 'DRAFT' : 'SUBMITTED',
          // Send an absolute instant so the server does not reinterpret the
          // picker's local wall-clock time in its own timezone.
          quotationDeadline: quotationDeadline ? new Date(quotationDeadline).toISOString() : null,
          referenceImage: formatReferenceImages(referenceImages),
          items,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to create submission')
        setLoading(false)
        return
      }

      router.push('/designer/submissions')
    } catch {
      setError('Network error')
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <h1 className="page-title">New Submission</h1>
        <p className="page-subtitle">Build specifications and set target budgets for your project</p>
      </div>

      {error && <div className="login-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 20 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Project Name</label>
            <input className="form-input" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="e.g. Living room interior" required />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Target Budget (₹)</label>
            <input type="number" className="form-input" value={designerBudget} onChange={(e) => setDesignerBudget(e.target.value)} placeholder="e.g. 500000" />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 20, maxWidth: 320 }}>
          <label className="form-label">Quotation Deadline</label>
          <input
            type="datetime-local"
            step="1"
            min={minDeadline || undefined}
            className="form-input"
            value={quotationDeadline}
            onChange={(e) => setQuotationDeadline(e.target.value)}
          />
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Required when you submit the project for vendors.
          </div>
          {quotationDeadline && (
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6, fontWeight: 600 }}>
              Closes on {formatQuotationDeadline(quotationDeadline)}
            </div>
          )}
        </div>

        <div className="form-group" style={{ marginBottom: 20 }}>
          <label className="form-label">Reference Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            className="form-input"
            onChange={(e) => handleReferenceImagesChange(e.target.files)}
          />
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Add visual references for how the finished project should look (you can select multiple images).
          </div>

          {referenceImages.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Attached Reference Images ({referenceImages.length})
                </span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '2px 8px', fontSize: 12 }}
                  onClick={() => setReferenceImages([])}
                >
                  Clear All
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
                {referenceImages.map((imgSrc, idx) => (
                  <div key={idx} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', aspectRatio: '4/3', backgroundColor: '#f1f5f9' }}>
                    <img src={imgSrc} alt={`Reference ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => removeReferenceImage(idx)}
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        background: 'rgba(239, 68, 68, 0.9)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: 22,
                        height: 22,
                        fontSize: 12,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add Submission Item Form */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 18, marginBottom: 20, backgroundColor: '#fafafa' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Add Project Item Spec
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Option Type</label>
              <select className="form-select" style={{ fontSize: 13, padding: '8px 12px', width: '100%', borderRadius: 6 }} value={itemType} onChange={e => setItemType(e.target.value)}>
                {ITEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Core Material</label>
              <select className="form-select" style={{ fontSize: 13, padding: '8px 12px', width: '100%', borderRadius: 6 }} value={coreMaterial} onChange={e => setCoreMaterial(e.target.value)}>
                {CORES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>External Finish</label>
              <select className="form-select" style={{ fontSize: 13, padding: '8px 12px', width: '100%', borderRadius: 6 }} value={externalFinish} onChange={e => setExternalFinish(e.target.value)}>
                {FINISHES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Hardware</label>
              <select className="form-select" style={{ fontSize: 13, padding: '8px 12px', width: '100%', borderRadius: 6 }} value={hardware} onChange={e => setHardware(e.target.value)}>
                {HARDWARES.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>

          {/* Selected Option Type Description Hint */}
          {ITEM_DESCRIPTIONS[itemType] && (
            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: '8px 12px', marginBottom: 14, fontSize: 12, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 600 }}>ℹ️ {itemType}:</span>
              <span>{ITEM_DESCRIPTIONS[itemType]}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Width (Ft)</label>
              <input type="number" min="0.1" step="any" className="form-input" style={{ fontSize: 13, padding: '8px 12px', borderRadius: 6 }} value={width} onChange={e => setWidth(e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 5" />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Length/Height (Ft)</label>
              <input type="number" min="0.1" step="any" className="form-input" style={{ fontSize: 13, padding: '8px 12px', borderRadius: 6 }} value={length} onChange={e => setLength(e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 2" />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Calculated Size (SFT)</label>
              <input type="number" className="form-input" style={{ fontSize: 13, padding: '8px 12px', borderRadius: 6, backgroundColor: '#f3f4f6', cursor: 'not-allowed', color: '#374151', fontWeight: 600 }} value={(width && length) ? Math.round(width * length * 100) / 100 : ''} readOnly placeholder="Auto-calculated" />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Quantity</label>
              <input type="number" min="1" className="form-input" style={{ fontSize: 13, padding: '8px 12px', borderRadius: 6 }} value={qty} onChange={e => setQty(Number(e.target.value))} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Additional Notes (Optional)</label>
              <input className="form-input" style={{ fontSize: 13, padding: '8px 12px', borderRadius: 6 }} placeholder="e.g. customized dimensions..." value={itemNotes} onChange={e => setItemNotes(e.target.value)} />
            </div>
            <button type="button" className="btn btn-secondary" style={{ padding: '10px 24px', height: 'fit-content' }} onClick={addItem}>
              + Add Item Spec
            </button>
          </div>

          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Unit Image (Optional)</label>
            <input type="file" accept="image/*" className="form-input" onChange={(e) => handleItemImageChange(e.target.files?.[0] || null)} />
            {itemImageName && <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-secondary)' }}>Selected: {itemImageName}</div>}
          </div>
        </div>

        {/* Current Items List */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 24, minHeight: 120 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase' }}>Submission Items ({items.length})</div>
          {items.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)', padding: '12px 16px', borderRadius: 8, fontSize: 13, gap: 16, border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                    {item.image && (
                      <img src={item.image} alt={`${item.itemType || 'Unit'} reference`} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)', flexShrink: 0 }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-primary)' }}>{item.description}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
                        Size: <strong style={{ color: 'var(--text-primary)' }}>{item.sft} SFT</strong> | Qty: <strong style={{ color: 'var(--text-primary)' }}>{item.quantity}</strong>
                        {item.notes && <span style={{ marginLeft: 8, fontStyle: 'italic', color: 'var(--text-muted)' }}>| Note: {item.notes}</span>}
                      </div>
                    </div>
                  </div>
                  <button type="button" style={{ color: '#dc2626', fontWeight: 600, padding: '6px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12.5 }} onClick={() => removeItem(idx)}>Remove</button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>No items added yet. Please use the form above to add specs.</div>
          )}
        </div>

        <div className="form-actions" style={{ borderTop: '1px solid var(--border)', paddingTop: 18, justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" className="btn btn-secondary" onClick={() => router.push('/designer/submissions')} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="btn btn-secondary" disabled={loading} onClick={() => handleSubmit(true)}>
            Save as Draft
          </button>
          <button type="button" className="btn btn-primary" disabled={loading} style={{ background: '#111', color: '#fff' }} onClick={() => handleSubmit(false)}>
            Submit for Review
          </button>
        </div>
      </div>
    </div>
  )
}
