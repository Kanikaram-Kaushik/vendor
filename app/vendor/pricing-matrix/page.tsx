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

// Helper to make a unique lookup key
const makeKey = (code: number, hw: string, core: string, finish: string) => 
  `${code}-${hw}-${core}-${finish}`

export default function PricingMatrixPage() {
  const [activeTab, setActiveTab] = useState<number>(1) // Code 1 or Code 2
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

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Pricing Matrix</h1>
          <p className="page-subtitle">Configure rate per SFT based on core, external finish, and hardware</p>
        </div>
        <button 
          className="btn btn-primary" 
          style={{ background: '#000', color: '#fff', padding: '10px 24px', fontWeight: 600, borderRadius: 6 }}
          onClick={handleSave}
          disabled={loading || saving}
        >
          {saving ? 'Saving...' : 'Save Matrix'}
        </button>
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

        {/* Dynamic Category Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 24, gap: 16 }}>
          <button 
            style={{ 
              padding: '12px 8px', 
              fontSize: 14, 
              fontWeight: activeTab === 1 ? 600 : 500, 
              color: activeTab === 1 ? 'var(--text-primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 1 ? '2px solid #000' : 'none',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab(1)}
          >
            Code 1 Items
            <span style={{ display: 'block', fontSize: 11, fontWeight: 400, color: 'var(--text-muted)', marginTop: 2 }}>
              TV Cabinet, Partition, Study, Bedside Table, Shoerack, TV Unit, Loft
            </span>
          </button>
          <button 
            style={{ 
              padding: '12px 8px', 
              fontSize: 14, 
              fontWeight: activeTab === 2 ? 600 : 500, 
              color: activeTab === 2 ? 'var(--text-primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 2 ? '2px solid #000' : 'none',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab(2)}
          >
            Code 2 Items
            <span style={{ display: 'block', fontSize: 11, fontWeight: 400, color: 'var(--text-muted)', marginTop: 2 }}>
              Crockery, Wardrobe, Bed, Dressing, Puja, Kitchen (Base/Wall/Tall)
            </span>
          </button>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="empty-state-text">Loading pricing tables...</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
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
                    <span>{hw} Hardware Pricing (Code {activeTab})</span>
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
                              const key = makeKey(activeTab, hw, core, finish)
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
                                      onChange={(e) => handlePriceChange(activeTab, hw, core, finish, e.target.value)}
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
