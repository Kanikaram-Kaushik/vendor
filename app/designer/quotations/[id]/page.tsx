'use client'

import { useState, useEffect, use, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { parseReferenceImages } from '@/lib/reference-image'
import { ReferenceImageGallery } from '@/components/ReferenceImageGallery'

interface QuotationItem {
  id: string
  description: string
  quantity: number
  sft: number
  pricePerSft: number | null
  notes?: string
  image?: string | null
  itemType?: string | null
  hardware?: string | null
  coreMaterial?: string | null
  externalFinish?: string | null
}

interface Quotation {
  id: string
  brandId: string
  brandName: string
  brandEmail: string
  projectName: string
  designerBudget?: number | null
  status: string
  itemsCount: number
  items: QuotationItem[]
  totalPrice: number | null
  isFullyPriced: boolean
  createdAt: string
  referenceImage?: string | null
}

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

function QuotationDetail({ id }: { id: string }) {
  const router = useRouter()
  const [quotation, setQuotation] = useState<Quotation | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchDetail = useCallback(async () => {
    try {
      const res = await fetch('/api/designer/quotations')
      if (res.ok) {
        const data = await res.json()
        const found = (data.quotations || []).find((q: Quotation) => q.id === id)
        setQuotation(found || null)
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

  async function handleApprove() {
    if (!quotation) return
    setActionLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/designer/quotations/${quotation.id}/select`, {
        method: 'POST'
      })
      if (res.ok) {
        router.push('/designer/quotations')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to select quotation')
        setActionLoading(false)
      }
    } catch {
      setError('Network error')
      setActionLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!quotation) return
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()

      // Set Font
      doc.setFont('helvetica', 'normal')

      // Header Banner
      doc.setFillColor(17, 17, 17)
      doc.rect(0, 0, 210, 30, 'F')

      // Header Title
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text('DESIGNBHK', 15, 20)

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('BRAND QUOTATION', 165, 20)

      // Reset text color to primary
      doc.setTextColor(17, 17, 17)

      // Section: Details Block
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Quotation Details', 15, 45)

      // Metadata Info left
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('Brand Name:', 15, 55)
      doc.setFont('helvetica', 'normal')
      doc.text(quotation.brandName, 42, 55)

      doc.setFont('helvetica', 'bold')
      doc.text('Brand Email:', 15, 62)
      doc.setFont('helvetica', 'normal')
      doc.text(quotation.brandEmail, 42, 62)

      doc.setFont('helvetica', 'bold')
      doc.text('Date Received:', 15, 69)
      doc.setFont('helvetica', 'normal')
      doc.text(formatDate(quotation.createdAt), 45, 69)

      // Metadata Info right
      doc.setFont('helvetica', 'bold')
      doc.text('Project Name:', 110, 55)
      doc.setFont('helvetica', 'normal')
      doc.text(quotation.projectName, 138, 55)

      doc.setFont('helvetica', 'bold')
      doc.text('Status:', 110, 62)
      doc.setFont('helvetica', 'normal')
      doc.text(quotation.status, 138, 62)

      doc.setFont('helvetica', 'bold')
      doc.text('Designer Budget:', 110, 69)
      doc.setFont('helvetica', 'normal')
      doc.text(quotation.designerBudget ? `INR ${quotation.designerBudget.toLocaleString('en-IN')}` : 'No Budget Set', 142, 69)

      // Divider Line
      doc.setDrawColor(220, 220, 220)
      doc.line(15, 78, 195, 78)

      let y = 87

      // Helper function to load image to HTMLImageElement
      const loadImage = (url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.crossOrigin = 'Anonymous'
          img.onload = () => resolve(img)
          img.onerror = (e) => reject(e)
          img.src = url
        })
      }

      // Check for reference images
      const refImages = parseReferenceImages(quotation.referenceImage)

      if (refImages.length > 0) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text(`Reference Images (${refImages.length})`, 15, y)
        y += 6

        let xOffset = 15
        for (let i = 0; i < refImages.length; i++) {
          try {
            const img = await loadImage(refImages[i])
            if (xOffset + 35 > 195) {
              xOffset = 15
              y += 30
            }
            if (y + 28 > 270) {
              doc.addPage()
              y = 20
              xOffset = 15
            }
            doc.addImage(img, 'JPEG', xOffset, y, 32, 24)
            xOffset += 36
          } catch (e) {
            console.warn('Could not embed reference image in PDF:', e)
          }
        }
        y += 30
      }

      // Section: Itemized Rates Header
      if (y + 20 > 270) {
        doc.addPage()
        y = 20
      }

      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Itemized Specifications', 15, y)
      y += 6

      // Table Header: Image | Description | Size (SFT) | Qty | Rate/SFT | Total
      doc.setFillColor(245, 245, 245)
      doc.rect(15, y, 180, 8, 'F')

      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('Image', 18, y + 5)
      doc.text('Description', 45, y + 5)
      doc.text('Size (SFT)', 120, y + 5)
      doc.text('Qty', 142, y + 5)
      doc.text('Rate/SFT', 155, y + 5)
      doc.text('Total', 180, y + 5)

      y += 8
      doc.setFont('helvetica', 'normal')

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

      // Items loop with unit image rendered directly in the Image column inside the table
      for (let index = 0; index < quotation.items.length; index++) {
        const item = quotation.items[index]
        const hasUnitImage = !!item.image

        let itemPurpose = ''
        if (item.itemType && ITEM_DESCRIPTIONS[item.itemType]) {
          itemPurpose = ITEM_DESCRIPTIONS[item.itemType]
        } else {
          for (const [typeName, descStr] of Object.entries(ITEM_DESCRIPTIONS)) {
            if (item.description.toLowerCase().includes(typeName.toLowerCase())) {
              itemPurpose = descStr
              break
            }
          }
        }

        const subDetail = item.notes ? item.notes : itemPurpose
        const rowHeight = hasUnitImage ? 24 : (subDetail ? 16 : 10)

        if (y + rowHeight > 270) {
          doc.addPage()
          y = 20
        }

        if (index % 2 === 1) {
          doc.setFillColor(250, 250, 250)
          doc.rect(15, y, 180, rowHeight, 'F')
        }

        // Draw image inside the Image column
        if (hasUnitImage && item.image) {
          try {
            const unitImg = await loadImage(item.image)
            doc.addImage(unitImg, 'JPEG', 18, y + 2, 22, 18)
          } catch (e) {
            console.warn('Could not embed unit image in PDF table row:', e)
          }
        } else {
          doc.setFontSize(8)
          doc.setTextColor(150, 150, 150)
          doc.text('-', 25, y + 6)
          doc.setTextColor(17, 17, 17)
        }

        const maxDescLen = 38
        const titleText = item.description.length > maxDescLen ? item.description.substring(0, maxDescLen - 3) + '...' : item.description
        const titleY = subDetail ? y + 6 : y + (hasUnitImage ? 12 : 6)

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8.5)
        doc.text(titleText, 45, titleY)

        if (subDetail) {
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(7.5)
          doc.setTextColor(110, 110, 110)
          const subText = subDetail.length > 42 ? subDetail.substring(0, 39) + '...' : subDetail
          doc.text(subText, 45, titleY + 5)
          doc.setTextColor(17, 17, 17)
        }

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8.5)
        const numberY = subDetail && !hasUnitImage ? y + 8 : (hasUnitImage ? y + 12 : y + 6)
        doc.text(String(item.sft), 120, numberY)
        doc.text(String(item.quantity), 142, numberY)
        doc.text(item.pricePerSft !== null ? `INR ${item.pricePerSft.toLocaleString('en-IN')}` : '-', 155, numberY)

        const lineTotal = item.pricePerSft ? item.sft * item.quantity * item.pricePerSft : null
        doc.text(lineTotal !== null ? `INR ${lineTotal.toLocaleString('en-IN')}` : '-', 180, numberY)

        y += rowHeight
      }

      // Divider Line
      doc.setDrawColor(220, 220, 220)
      doc.line(15, y + 2, 195, y + 2)
      y += 8

      // Estimated Brand Total
      if (quotation.totalPrice !== null) {
        if (y + 12 > 270) {
          doc.addPage()
          y = 20
        }
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.text('Estimated Brand Total:', 110, y)
        doc.text(`INR ${quotation.totalPrice.toLocaleString('en-IN')}`, 160, y)
        y += 14
      } else {
        y += 6
      }

      // Terms and Conditions Block
      if (y + 45 > 270) {
        doc.addPage()
        y = 20
      }

      doc.setDrawColor(230, 230, 230)
      doc.setFillColor(252, 252, 252)
      doc.roundedRect(15, y, 180, 40, 3, 3, 'FD')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(50, 50, 50)
      doc.text('TERMS & CONDITIONS', 20, y + 8)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(100, 100, 100)
      
      const terms = [
        '1. Validity: This quotation is valid for 30 days from the date of issuance.',
        '2. Payment Schedule: 50% advance upon approval, 40% prior to dispatch, 10% post installation.',
        '3. Taxes & Freight: Prices are inclusive of applicable GST unless specified otherwise. Transportation extra as actuals.',
        '4. Variations: Any changes in site dimensions, materials, or scope will be re-quoted accordingly.',
        '5. Warranty: Standard 5-year manufacturer warranty applies on hardware and core materials as per brand guidelines.',
      ]

      let termY = y + 15
      terms.forEach((term) => {
        doc.text(term, 20, termY)
        termY += 5.2
      })

      // Save Document
      doc.save(`Quotation-${quotation.projectName.replace(/\s+/g, '_')}.pdf`)
    } catch (err) {
      console.error('Failed to generate PDF:', err)
      alert('Error generating PDF. Please try again.')
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: '40px auto', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading quotation details...
      </div>
    )
  }

  if (!quotation) {
    return (
      <div style={{ maxWidth: 800, margin: '40px auto', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--text-primary)' }}>Quotation not found</h3>
        <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => router.push('/designer/quotations')}>
          Go Back
        </button>
      </div>
    )
  }

  const budgetExceeded = quotation.totalPrice && quotation.designerBudget && quotation.totalPrice > quotation.designerBudget

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Quotation Details</h1>
          <p className="page-subtitle">Received from {quotation.brandName}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary no-print" onClick={handleDownloadPDF}>
            Download PDF
          </button>
          <button className="btn btn-secondary no-print" onClick={() => router.push('/designer/quotations')}>
            ← Back to List
          </button>
        </div>
      </div>

      {error && <div className="login-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>Brand Details</label>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{quotation.brandName}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{quotation.brandEmail}</div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>Project Name</label>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{quotation.projectName}</div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>Status</label>
            <div>
              <StatusBadge status={quotation.status} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 11, marginBottom: 4 }}>Designer Budget</label>
            <div style={{ fontWeight: 600, fontSize: 14 }}>
              {quotation.designerBudget ? `₹${quotation.designerBudget.toLocaleString('en-IN')}` : 'No Budget Set'}
            </div>
          </div>
        </div>

        <ReferenceImageGallery referenceImage={quotation.referenceImage} />

        {/* Itemized pricing table */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 18, marginBottom: 24, backgroundColor: '#fafafa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Brand Itemized Rates
            </div>
            {(() => {
              const totalSft = quotation.items.reduce((sum, item) => sum + ((item.sft || 0) * (item.quantity || 1)), 0)
              return totalSft > 0 ? (
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', background: '#e2e8f0', padding: '2px 10px', borderRadius: 12 }}>
                  Total Area: {Math.round(totalSft * 100) / 100} SFT
                </span>
              ) : null
            })()}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {quotation.items.map((item, idx) => {
              const lineTotal = item.pricePerSft ? item.sft * item.quantity * item.pricePerSft : null
              return (
                <div key={item.id || idx} style={{ background: '#fff', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: 8, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                    {item.image && (
                      <img src={item.image} alt={`${item.description} reference`} style={{ width: 84, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)', flexShrink: 0 }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{item.description}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                        Size: {item.sft} SFT | Qty: {item.quantity} {item.notes && `| Note: ${item.notes}`}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 120 }}>
                    {item.pricePerSft !== null ? (
                      <>
                        <div style={{ fontWeight: 600, fontSize: 13.5 }}>₹{item.pricePerSft}/SFT</div>
                        <div style={{ fontSize: 11.5, color: '#16a34a', fontWeight: 600, marginTop: 2 }}>Total: ₹{lineTotal?.toLocaleString('en-IN')}</div>
                      </>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Pricing Pending</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {quotation.totalPrice !== null && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid var(--border)', fontWeight: 700 }}>
              <span style={{ fontSize: 13.5 }}>Estimated Brand Total:</span>
              <span style={{ fontSize: 16, color: budgetExceeded ? '#dc2626' : '#16a34a' }}>
                ₹{quotation.totalPrice.toLocaleString('en-IN')}
                {budgetExceeded && <span style={{ fontSize: 11, display: 'block', fontWeight: 500, textAlign: 'right' }}>(Exceeds Budget)</span>}
              </span>
            </div>
          )}
        </div>

        <div className="form-actions" style={{ borderTop: '1px solid var(--border)', paddingTop: 18, justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" className="btn btn-secondary" onClick={() => router.push('/designer/quotations')} disabled={actionLoading}>
            Cancel
          </button>
          {quotation.status === 'SUBMITTED' && quotation.isFullyPriced && (
            <button
              type="button"
              className="btn btn-primary"
              style={{ background: '#000', color: '#fff' }}
              disabled={actionLoading}
              onClick={handleApprove}
            >
              {actionLoading ? 'Approving…' : '✓ Choose & Approve Brand'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <QuotationDetail id={id} />
}
