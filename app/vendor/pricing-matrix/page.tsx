'use client'

import { useState, useEffect } from 'react'

interface MatrixCell {
  code: number
  hardware: string
  coreMaterial: string
  externalFinish: string
  price: number
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

// Helper to make a unique lookup key
const makeKey = (code: number, hw: string, core: string, finish: string) => 
  `${code}-${hw}-${core}-${finish}`

export default function PricingMatrixPage() {
  const [selectedItem, setSelectedItem] = useState<string>('')
  const [prices, setPrices] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    async function loadMatrix() {
      try {
        const res = await fetch('/api/vendor/pricing-matrix')
        if (res.ok) {
          const data = await res.json()
          const cells: MatrixCell[] = data.cells || []
          const priceMap: Record<string, string> = {}
          cells.forEach((cell) => {
            const key = makeKey(cell.code, cell.hardware, cell.coreMaterial, cell.externalFinish)
            priceMap[key] = String(cell.price)
          })
          setPrices(priceMap)
        }
      } catch (err) {
        console.error(err)
        setMessage({ text: 'Failed to load pricing matrix', type: 'error' })
      } finally {
        setLoading(false)
      }
    }
    loadMatrix()
  }, [])

  const handlePriceChange = (code: number, hw: string, core: string, finish: string, value: string) => {
    const key = makeKey(code, hw, core, finish)
    setPrices((prev) => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    // Build payload array of all 54 cells
    const cellsList: MatrixCell[] = []
    
    for (const code of [1, 2]) {
      for (const hw of HARDWARES) {
        for (const core of CORES) {
          for (const finish of FINISHES) {
            const key = makeKey(code, hw, core, finish)
            const rawVal = prices[key] || '0'
            const parsedPrice = parseFloat(rawVal) || 0
            
            cellsList.push({
              code,
              hardware: hw,
              coreMaterial: core,
              externalFinish: finish,
              price: parsedPrice
            })
          }
        }
      }
    }

    try {
      const res = await fetch('/api/vendor/pricing-matrix', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cells: cellsList })
      })

      if (res.ok) {
        setMessage({ text: 'Pricing matrix updated successfully!', type: 'success' })
      } else {
        const data = await res.json()
        setMessage({ text: data.error || 'Failed to update pricing matrix', type: 'error' })
      }
    } catch {
      setMessage({ text: 'Network error occurred while saving', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  // Resolve current active code based on selected item
  const matchedItem = ITEM_TYPES.find(it => it.name === selectedItem)
  const activeCode = matchedItem ? matchedItem.code : null

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Pricing Matrix</h1>
          <p className="page-subtitle">Configure rate per SFT based on core, external finish, and hardware</p>
        </div>
        {activeCode && (
          <button 
            className="btn btn-primary" 
            style={{ background: '#000', color: '#fff', padding: '10px 24px', fontWeight: 600, borderRadius: 6 }}
            onClick={handleSave}
            disabled={loading || saving}
          >
            {saving ? 'Saving...' : 'Save Matrix'}
          </button>
        )}
      </div>

      <div className="page-body">
        {message && (
          <div 
            style={{ 
              padding: '12px 16px', 
              borderRadius: 6, 
              marginBottom: 20, 
              fontSize: 13.5,
              fontWeight: 500,
              backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2', 
              color: message.type === 'success' ? '#16a34a' : '#dc2626',
              border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`
            }}
          >
            {message.type === 'success' ? '✓ ' : '✗ '}
            {message.text}
          </div>
        )}

        {/* Dropdown Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 28, maxWidth: 400 }}>
          <label style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-secondary)' }}>Select Option Type to Configure Pricing</label>
          <select
            className="form-select"
            style={{ padding: '10px 14px', fontSize: 14, borderRadius: 6, width: '100%', border: '1px solid var(--border)', background: '#fff' }}
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
          >
            <option value="">-- Select Option Type --</option>
            {ITEM_TYPES.map((it) => (
              <option key={it.name} value={it.name}>
                {it.name} (Code {it.code})
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="empty-state-text">Loading pricing tables...</div>
          </div>
        ) : !activeCode ? (
          <div className="empty-state" style={{ padding: '40px 20px', border: '1px dashed var(--border)', background: '#fff', borderRadius: 8 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
            <div className="empty-state-text" style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>No Option Selected</div>
            <div className="empty-state-sub" style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4 }}>
              Please select an option type from the dropdown above to configure its pricing matrix.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div style={{ background: '#fff', border: '1px solid var(--border)', padding: '14px 20px', borderRadius: 6, fontWeight: 500, fontSize: 13.5, color: 'var(--text-secondary)' }}>
              Configuring matrix for <strong style={{ color: 'var(--text-primary)' }}>{selectedItem}</strong> (maps to <strong style={{ color: 'var(--text-primary)' }}>Code {activeCode}</strong> rate card)
            </div>

            {HARDWARES.map((hw) => {
              // Color styles for headings to match Excel sheet aesthetics
              const colorMap: Record<string, { bg: string; text: string }> = {
                EBCO: { bg: '#dcfce7', text: '#15803d' },      // Greenish
                HETTICH: { bg: '#ffedd5', text: '#c2410c' },   // Orangeish
                HAFELE: { bg: '#e0f2fe', text: '#0369a1' }     // Blueish
              }
              const color = colorMap[hw] || { bg: '#f3f4f6', text: '#374151' }

              return (
                <div key={hw} className="card" style={{ overflow: 'hidden' }}>
                  {/* Table Header */}
                  <div style={{ backgroundColor: color.bg, color: color.text, padding: '14px 20px', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{hw} Hardware Pricing (Code {activeCode})</span>
                    <span style={{ fontSize: 11.5, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price per SFT (₹)</span>
                  </div>

                  {/* Pricing Matrix Form Grid */}
                  <div style={{ padding: 20 }}>
                    <table className="data-table" style={{ borderCollapse: 'collapse', width: '100%' }}>
                      <thead>
                        <tr style={{ background: '#f9fafb' }}>
                          <th style={{ padding: '12px 16px', borderBottom: '2px solid #eee', textAlign: 'left', color: 'var(--text-secondary)' }}>Core Material / External Finish</th>
                          {FINISHES.map((finish) => (
                            <th key={finish} style={{ padding: '12px 16px', borderBottom: '2px solid #eee', textAlign: 'right', color: 'var(--text-secondary)' }}>
                              {finish}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {CORES.map((core) => (
                          <tr key={core} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>{core}</td>
                            {FINISHES.map((finish) => {
                              const key = makeKey(activeCode, hw, core, finish)
                              return (
                                <td key={finish} style={{ padding: '10px 16px', textAlign: 'right' }}>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>₹</span>
                                    <input
                                      type="number"
                                      min="0"
                                      className="form-input"
                                      style={{ width: 120, padding: '6px 10px', textAlign: 'right', fontWeight: 500 }}
                                      value={prices[key] || ''}
                                      onChange={(e) => handlePriceChange(activeCode, hw, core, finish, e.target.value)}
                                      placeholder="0.00"
                                    />
                                  </div>
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
