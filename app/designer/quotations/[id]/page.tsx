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
  brandPhone?: string | null
  brandDescription?: string | null
  brandAddressLine1?: string | null
  brandAddressLine2?: string | null
  brandLocality?: string | null
  brandCity?: string | null
  brandState?: string | null
  brandPincode?: string | null
  projectName: string
  designerBudget?: number | null
  status: string
  itemsCount: number
  items: QuotationItem[]
  totalPrice: number | null
  isFullyPriced: boolean
  createdAt: string
  referenceImage?: string | null
  brandTerms?: string | null
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

  async function handleReject() {
    if (!quotation) return
    setActionLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/quotes/${quotation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' })
      })
      if (res.ok) {
        router.push('/designer/quotations')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to reject quotation')
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

      // Helper function to load image to Data URL for clean jsPDF rendering
      const loadImageDataUrl = async (url: string): Promise<string | null> => {
        if (!url) return null
        if (url.startsWith('data:image/')) return url

        let fetchUrl = url
        if (url.startsWith('http://') || url.startsWith('https://')) {
          fetchUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`
        }

        return new Promise((resolve) => {
          const img = new Image()
          img.crossOrigin = 'Anonymous'
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas')
              canvas.width = img.naturalWidth || img.width || 300
              canvas.height = img.naturalHeight || img.height || 200
              const ctx = canvas.getContext('2d')
              if (ctx) {
                ctx.fillStyle = '#FFFFFF'
                ctx.fillRect(0, 0, canvas.width, canvas.height)
                ctx.drawImage(img, 0, 0)
                resolve(canvas.toDataURL('image/jpeg', 0.85))
              } else {
                resolve(null)
              }
            } catch (e) {
              console.warn('Canvas conversion error in PDF:', e)
              resolve(null)
            }
          }
          img.onerror = (e) => {
            console.warn('Failed to load image for PDF:', fetchUrl, e)
            resolve(null)
          }
          img.src = fetchUrl
        })
      }

      // 1. TOP HEADER
      // Left side (x = 15): DesignBHK Branding & Address (Replacing Logo)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.setTextColor(17, 17, 17)
      doc.text('DesignBHK', 15, 20)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(60, 60, 60)
      doc.text('Experience Centre Showroom', 15, 26)
      doc.text('Beside Kotak Mahindra Bank, Habsiguda', 15, 31)
      doc.text('Habsiguda-Nacharam Road,', 15, 36)
      doc.text('Hyderabad, Telangana', 15, 41)
      doc.text('Contact No : +91 70321 70323', 15, 46)
      doc.text('Email Id : madhavan@designbhk.com', 15, 51)

      // Right side (x = 120): Brand Name, Address & Description
      let rightY = 20
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(17, 17, 17)
      doc.text(quotation.brandName || 'Brand Details', 120, rightY)
      rightY += 6

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(60, 60, 60)

      if (quotation.brandDescription) {
        const descLines = doc.splitTextToSize(quotation.brandDescription, 75)
        doc.text(descLines, 120, rightY)
        rightY += descLines.length * 4.5
      }

      const addressParts = [
        quotation.brandAddressLine1,
        quotation.brandAddressLine2,
        quotation.brandLocality,
        [quotation.brandCity, quotation.brandState, quotation.brandPincode].filter(Boolean).join(', ')
      ].filter(Boolean)

      if (addressParts.length > 0) {
        addressParts.forEach((part) => {
          const lines = doc.splitTextToSize(part as string, 75)
          doc.text(lines, 120, rightY)
          rightY += lines.length * 4.5
        })
      }

      if (quotation.brandPhone) {
        doc.text(`Contact No : ${quotation.brandPhone}`, 120, rightY)
        rightY += 4.5
      }

      if (quotation.brandEmail) {
        doc.text(`Email Id : ${quotation.brandEmail}`, 120, rightY)
        rightY += 4.5
      }

      // 2. PREPARED FOR & METADATA SECTION
      let y = 68
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9.5)
      doc.setTextColor(40, 40, 40)
      doc.text('Prepared for', 15, y)
      
      y += 5
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(17, 17, 17)
      doc.text(quotation.projectName, 15, y)

      y += 5
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9.5)
      doc.setTextColor(60, 60, 60)
      doc.text(`Designer: ${quotation.brandName}`, 15, y)

      y += 8
      doc.text(formatDate(quotation.createdAt), 15, y)

      y += 5
      doc.setFont('helvetica', 'bold')
      doc.text(`Ref: DESIGNBHK-${quotation.id.substring(0, 14).toUpperCase()}`, 15, y)

      // 3. TITLE HEADER: Estimate
      y += 15
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.setTextColor(180, 50, 60) // Burgundy red matching target
      const titleWidth = doc.getTextWidth('Estimate')
      doc.text('Estimate', (210 - titleWidth) / 2, y)

      y += 8

      // 4. ITEMS TABLE HEADER
      // Columns: S.No (10), Description (60), Image (35), UOM (15), USP (22), QTY (15), Price (23) -> Total = 180
      const tableLeft = 15
      const colWidths = [10, 62, 38, 14, 20, 14, 22]
      const colX = [
        tableLeft,
        tableLeft + 10,
        tableLeft + 72,
        tableLeft + 110,
        tableLeft + 124,
        tableLeft + 144,
        tableLeft + 158
      ]

      const drawTableHeader = (currY: number) => {
        doc.setDrawColor(180, 180, 180)
        doc.setFillColor(255, 255, 255)
        doc.rect(tableLeft, currY, 180, 10, 'F')
        doc.line(tableLeft, currY, tableLeft + 180, currY)
        doc.line(tableLeft, currY + 10, tableLeft + 180, currY + 10)

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(17, 17, 17)

        doc.text('S.No', colX[0] + 2, currY + 6.5)
        doc.text('Description', colX[1] + 2, currY + 6.5)
        doc.text('Image', colX[2] + 13, currY + 6.5)
        doc.text('UOM', colX[3] + 2, currY + 6.5)
        doc.text('Per Sft', colX[4] + 2, currY + 6.5)
        doc.text('QTY', colX[5] + 2, currY + 6.5)
        doc.text('Price', colX[6] + 2, currY + 6.5)

        // Draw vertical grid lines for header
        for (let i = 0; i <= colWidths.length; i++) {
          const xPos = i === colWidths.length ? tableLeft + 180 : colX[i]
          doc.line(xPos, currY, xPos, currY + 10)
        }
      }

      drawTableHeader(y)
      y += 10

      const refImages = parseReferenceImages(quotation.referenceImage)

      // 5. RENDER ITEMS
      let totalAmount = 0

      for (let index = 0; index < quotation.items.length; index++) {
        const item = quotation.items[index]
        const itemImgSrc = item.image || (refImages[index] || refImages[0] || null)

        const linePrice = item.pricePerSft && item.sft ? item.sft * item.quantity * item.pricePerSft : 0
        totalAmount += linePrice

        // Wrap description text
        doc.setFontSize(8)
        const areaCategoryText = `Area: All Area , Category: ${item.itemType || 'Wood Work'}`
        const mainDescLines = doc.splitTextToSize(item.description, 58)
        const notesLines = item.notes ? doc.splitTextToSize(`Note: ${item.notes}`, 58) : []
        const coreFinishText = [item.coreMaterial, item.externalFinish].filter(Boolean).join(', ')

        const contentHeight = 12 + (mainDescLines.length * 3.5) + (notesLines.length * 3.5) + (coreFinishText ? 4 : 0)
        const rowHeight = Math.max(contentHeight, 28)

        if (y + rowHeight > 270) {
          doc.addPage()
          y = 20
          drawTableHeader(y)
          y += 10
        }

        const rowStartY = y

        // Render S.No
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8.5)
        doc.setTextColor(17, 17, 17)
        doc.text(String(index + 1), colX[0] + 3, y + 6)

        // Render Description
        let descY = y + 5
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8.5)
        doc.setTextColor(180, 50, 60) // Red title for item
        doc.text(item.itemType || item.description.substring(0, 25), colX[1] + 2, descY)

        descY += 4.5
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7.5)
        doc.setTextColor(60, 60, 60)
        doc.text(areaCategoryText, colX[1] + 2, descY)

        descY += 4
        doc.setTextColor(30, 30, 30)
        doc.text(mainDescLines, colX[1] + 2, descY)
        descY += (mainDescLines.length * 3.5)

        if (notesLines.length > 0) {
          doc.setTextColor(100, 100, 100)
          doc.text(notesLines, colX[1] + 2, descY)
          descY += (notesLines.length * 3.5)
        }

        if (coreFinishText) {
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(40, 40, 40)
          doc.text(coreFinishText, colX[1] + 2, descY + 1)
        }

        // Render Image inside column 2
        if (itemImgSrc) {
          try {
            const unitImgData = await loadImageDataUrl(itemImgSrc)
            if (unitImgData) {
              const format = unitImgData.startsWith('data:image/png') ? 'PNG' : 'JPEG'
              doc.addImage(unitImgData, format, colX[2] + 2, rowStartY + 3, 34, 22)
            }
          } catch (e) {
            console.warn('Could not embed unit image in PDF:', e)
          }
        }

        // Render UOM, USP, QTY, Price
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(17, 17, 17)

        const uomText = item.sft ? 'Sq ft' : 'Nos'
        doc.text(uomText, colX[3] + 2, rowStartY + 10)

        const uspText = item.pricePerSft ? `INR ${item.pricePerSft.toLocaleString('en-IN')}` : '-'
        doc.text(uspText, colX[4] + 1, rowStartY + 10)

        doc.text(String(item.quantity), colX[5] + 3, rowStartY + 10)

        const priceText = linePrice > 0 ? `INR ${linePrice.toLocaleString('en-IN')}` : '-'
        doc.text(priceText, colX[6] + 1, rowStartY + 10)

        // Row Grid & Border
        doc.setDrawColor(200, 200, 200)
        doc.rect(tableLeft, rowStartY, 180, rowHeight)

        for (let i = 0; i <= colWidths.length; i++) {
          const xPos = i === colWidths.length ? tableLeft + 180 : colX[i]
          doc.line(xPos, rowStartY, xPos, rowStartY + rowHeight)
        }

        y += rowHeight
      }

      y += 10

      // 6. SUMMARY SECTION
      if (y + 55 > 270) {
        doc.addPage()
        y = 20
      }

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(180, 50, 60)
      doc.text('Summary', 15, y)
      y += 6

      // Summary Table Header
      const sumLeft = 15
      const sumWidths = [12, 60, 25, 40, 43]
      const sumX = [sumLeft, sumLeft + 12, sumLeft + 72, sumLeft + 97, sumLeft + 137]

      doc.setDrawColor(180, 180, 180)
      doc.setFillColor(255, 255, 255)
      doc.rect(sumLeft, y, 165, 8)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.5)
      doc.setTextColor(17, 17, 17)

      doc.text('S.No', sumX[0] + 2, y + 5.5)
      doc.text('Name', sumX[1] + 2, y + 5.5)
      doc.text('Quantity', sumX[2] + 2, y + 5.5)
      doc.text('Price', sumX[3] + 2, y + 5.5)
      doc.text('Total', sumX[4] + 2, y + 5.5)

      for (let i = 0; i <= sumWidths.length; i++) {
        const xPos = i === sumWidths.length ? sumLeft + 165 : sumX[i]
        doc.line(xPos, y, xPos, y + 8)
      }

      y += 8
      // Items Summary Row
      doc.rect(sumLeft, y, 165, 8)
      doc.setFont('helvetica', 'normal')
      doc.text('1', sumX[0] + 4, y + 5.5)
      doc.text('Items', sumX[1] + 2, y + 5.5)
      doc.text(String(quotation.items.length), sumX[2] + 4, y + 5.5)
      doc.text(`INR ${totalAmount.toLocaleString('en-IN')}`, sumX[3] + 2, y + 5.5)
      doc.text(`INR ${totalAmount.toLocaleString('en-IN')}`, sumX[4] + 2, y + 5.5)

      for (let i = 0; i <= sumWidths.length; i++) {
        const xPos = i === sumWidths.length ? sumLeft + 165 : sumX[i]
        doc.line(xPos, y, xPos, y + 8)
      }

      y += 8
      // Initial Total Row
      doc.rect(sumLeft + 72, y, 93, 8)
      doc.setFont('helvetica', 'bold')
      doc.text('Initial Total', sumX[3] - 20, y + 5.5)
      doc.text(`INR ${totalAmount.toLocaleString('en-IN')}`, sumX[4] + 2, y + 5.5)
      doc.line(sumX[4], y, sumX[4], y + 8)

      y += 8
      // Final Total Row
      doc.rect(sumLeft + 72, y, 93, 8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(180, 50, 60)
      doc.text('Final Total', sumX[3] - 20, y + 5.5)
      doc.text(`INR ${totalAmount.toLocaleString('en-IN')}`, sumX[4] + 2, y + 5.5)
      doc.line(sumX[4], y, sumX[4], y + 8)

      y += 16

      // 7. TERMS AND CONDITIONS SECTION
      if (y + 80 > 270) {
        doc.addPage()
        y = 20
      }

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(180, 50, 60)
      doc.text('Terms And Conditions', 15, y)
      y += 8

      if (quotation.brandTerms) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(70, 70, 70)
        const lines = doc.splitTextToSize(quotation.brandTerms, 175)
        
        lines.forEach((line: string) => {
          if (y + 6 > 270) {
            doc.addPage()
            y = 20
          }
          doc.text(line, 15, y)
          y += 5
        })
      } else {
        const termsList = [
          { title: 'Validity', desc: 'This quotation is valid for 15 (fifteen) days from the date of issue. Prices, materials, and availability are subject to change thereafter without prior notice.' },
          { title: 'Scope & Changes', desc: 'The quotation is based on specifications shared by Client. Any changes requested after acceptance will be treated as extra work and charged separately.' },
          { title: 'Payments', desc: 'Payment terms will follow agreed milestone schedule. Work will commence after advance payment.' },
          { title: 'Materials & Third-Party Vendors', desc: 'Rates for materials are as quoted at preparation time. Any market fluctuation will be borne by Client.' },
          { title: 'Timelines', desc: 'Estimated timelines are indicative (Standard delivery within 45 working days from design finalization).' },
          { title: 'Ownership & Acceptance', desc: 'All drawings and designs remain intellectual property until full payment is received. Approval confirms acceptance of terms.' }
        ]

        doc.setFontSize(8.5)
        termsList.forEach(t => {
          if (y + 12 > 270) {
            doc.addPage()
            y = 20
          }
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(17, 17, 17)
          doc.text(t.title, 15, y)
          y += 4

          doc.setFont('helvetica', 'normal')
          doc.setTextColor(70, 70, 70)
          const lines = doc.splitTextToSize(`• ${t.desc}`, 175)
          doc.text(lines, 18, y)
          y += (lines.length * 3.8) + 3
        })
      }

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
            Back to List
          </button>
          {quotation.status !== 'REJECTED' && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ color: '#dc2626', borderColor: '#fca5a5' }}
              disabled={actionLoading}
              onClick={handleReject}
            >
              {actionLoading ? 'Updating…' : '✗ Reject Quote'}
            </button>
          )}
          {quotation.status !== 'APPROVED' && quotation.isFullyPriced && (
            <button
              type="button"
              className="btn btn-primary"
              style={{ background: '#16a34a', color: '#fff', borderColor: '#16a34a' }}
              disabled={actionLoading}
              onClick={handleApprove}
            >
              {actionLoading ? 'Approving…' : '✓ Approve Quote'}
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
