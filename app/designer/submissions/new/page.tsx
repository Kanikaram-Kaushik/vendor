'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface SubmissionItem {
  description: string
  quantity: number
  itemType?: string
  hardware?: string
  coreMaterial?: string
  externalFinish?: string
  sft?: number
  notes?: string
}

const HARDWARES = ['EBCO', 'HETTICH', 'HAFELE']
const CORES = ['MR Ply', 'BWP Ply', 'HDHMR']
const FINISHES = ['Laminate', 'Acrylic', 'PU']
const ITEM_TYPES = [
  'Tv Cabinet',
  'Crockery Unit',
  'Puja Unit',
  'Partition',
  'Wardrobe',
  'Tv Unit',
  'Study Unit',
  'Bed',
  'Bedside Table',
  'Dressing Unit',
  'Base Unit (Kitchen)',
  'Wall Unit (Kitchen)',
  'Loft',
  'Tall units (Kitchen)',
  'Shoerack'
]

export default function NewSubmissionPage() {
  const router = useRouter()
  const [projectName, setProjectName] = useState('')
  const [designerBudget, setDesignerBudget] = useState('')
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

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      },
    ])
    setItemNotes('')
    setQty(1)
    setWidth(5)
    setLength(2)
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
        </div>

        {/* Current Items List */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 24, minHeight: 120 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase' }}>Submission Items ({items.length})</div>
          {items.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)', padding: '10px 14px', borderRadius: 6, fontSize: 13 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{item.description}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                      Size: {item.sft} SFT | Qty: {item.quantity} {item.notes && `| Note: ${item.notes}`}
                    </div>
                  </div>
                  <button type="button" style={{ color: '#dc2626', fontWeight: 600, padding: '6px 12px', border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => removeItem(idx)}>Remove</button>
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
