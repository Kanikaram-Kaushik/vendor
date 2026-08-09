'use client'

import { useState, useEffect, use, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ReferenceImageGallery } from '@/components/ReferenceImageGallery'
import { parseReferenceImages } from '@/lib/reference-image'

interface BrandEstimation {
  brandId: string
  brandName: string
  totalCost: number | null
  isComplete: boolean
}

interface SubmissionItem {
  id: string
  description: string
  quantity: number
  itemType: string | null
  hardware: string | null
  coreMaterial: string | null
  externalFinish: string | null
  sft: number | null
  image: string | null
  notes?: string | null
}

interface DesignerSubmission {
  id: string
  projectName: string
  status: string
  designerName: string
  designerEmail: string
  designerBudget: number | null
  itemsCount: number
  items: SubmissionItem[]
  createdAt: string
  referenceImage?: string | null
  brandEstimations: BrandEstimation[]
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    APPROVED: 'badge badge-approved',
    REJECTED: 'badge badge-rejected',
    DECLINED: 'badge badge-rejected',
    SUBMITTED: 'badge badge-submitted',
    ACTIVE: 'badge badge-active',
  }
  return <span className={cls[status] || 'badge badge-pending'}>{status.charAt(0) + status.slice(1).toLowerCase()}</span>
}

function ReviewDistributeDetail({ id }: { id: string }) {
  const router = useRouter()
  const [submission, setSubmission] = useState<DesignerSubmission | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editNoteValue, setEditNoteValue] = useState('')
  const [savingItemId, setSavingItemId] = useState<string | null>(null)

  const fetchDetail = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/submissions')
      if (res.ok) {
        const data = await res.json()
        const found = (data.submissions || []).find((s: DesignerSubmission) => s.id === id)
        if (found) {
          setSubmission(found)
          // Pre-select brands that are complete and within budget
          const recommended = found.brandEstimations
            .filter((b: BrandEstimation) => b.isComplete && b.totalCost !== null && found.designerBudget && b.totalCost <= found.designerBudget)
            .map((b: BrandEstimation) => b.brandId)
          setSelectedBrands(recommended)
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

  const toggleBrand = (brandId: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId) ? prev.filter((id) => id !== brandId) : [...prev, brandId]
    )
  }

  async function handleDistribute() {
    if (selectedBrands.length === 0) {
      setError('Please select at least one brand to request quotes from.')
      return
    }
    setError('')
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/submissions/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandIds: selectedBrands }),
      })
      if (res.ok) {
        router.push('/admin/quotes')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to distribute request')
        setActionLoading(false)
      }
    } catch {
      setError('Network error')
      setActionLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!submission) return
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()

      // Helper function to load image to Data URL for clean jsPDF rendering
      const loadImageDataUrl = async (url: string): Promise<string | null> => {
        if (!url) return null
        if (url.startsWith('data:image/')) return url

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
            console.warn('Failed to load image for PDF:', url, e)
            resolve(null)
          }
          img.src = url
        })
      }

      // 1. TOP HEADER (Brand / Showroom Info)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.setTextColor(17, 17, 17)
      doc.text('DesignBHK', 120, 20)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(60, 60, 60)
      doc.text('Experience Centre Showroom', 120, 26)
      doc.text('Beside Kotak Mahindra Bank, Habsiguda', 120, 31)
      doc.text('Habsiguda-Nacharam Road,', 120, 36)
      doc.text('Hyderabad, Telangana', 120, 41)
      doc.text('Contact No : +91 70321 70323', 120, 46)
      doc.text('Email Id : madhavan@designbhk.com', 120, 51)

      // Try embedding Logo on the left
      try {
        const logoImgData = await loadImageDataUrl('/icon.png')
        doc.addImage(logoImgData, 'PNG', 15, 15, 45, 45)
      } catch (e) {
        doc.setDrawColor(200, 200, 200)
        doc.rect(15, 15, 45, 45)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.text('DesignBHK', 22, 40)
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
      doc.text(submission.projectName, 15, y)

      y += 5
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9.5)
      doc.setTextColor(60, 60, 60)
      doc.text(`Designer: ${submission.designerName}`, 15, y)

      y += 8
      doc.text(formatDate(submission.createdAt), 15, y)

      y += 5
      doc.setFont('helvetica', 'bold')
      doc.text(`Ref: DESIGNBHK-${submission.id.substring(0, 14).toUpperCase()}`, 15, y)

      // 3. TITLE HEADER: Estimate
      y += 15
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.setTextColor(180, 50, 60) // Burgundy red matching target
      const titleWidth = doc.getTextWidth('Estimate')
      doc.text('Estimate', (210 - titleWidth) / 2, y)

      y += 8

      // 4. ITEMS TABLE HEADER
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
        doc.text('USP', colX[4] + 2, currY + 6.5)
        doc.text('QTY', colX[5] + 2, currY + 6.5)
        doc.text('Price', colX[6] + 2, currY + 6.5)

        for (let i = 0; i <= colWidths.length; i++) {
          const xPos = i === colWidths.length ? tableLeft + 180 : colX[i]
          doc.line(xPos, currY, xPos, currY + 10)
        }
      }

      drawTableHeader(y)
      y += 10

      const refImages = parseReferenceImages(submission.referenceImage)

      // 5. RENDER ITEMS
      let totalAmount = 0

      for (let index = 0; index < submission.items.length; index++) {
        const item = submission.items[index]
        const itemImgSrc = item.image || (refImages[index] || refImages[0] || null)

        const linePrice = 0
        totalAmount += linePrice

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

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8.5)
        doc.setTextColor(17, 17, 17)
        doc.text(String(index + 1), colX[0] + 3, y + 6)

        let descY = y + 5
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8.5)
        doc.setTextColor(180, 50, 60)
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

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(17, 17, 17)

        const uomText = item.sft ? 'Sq ft' : 'Nos'
        doc.text(uomText, colX[3] + 2, rowStartY + 10)
        doc.text('-', colX[4] + 5, rowStartY + 10)
        doc.text(String(item.quantity), colX[5] + 3, rowStartY + 10)
        doc.text('-', colX[6] + 5, rowStartY + 10)

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
      doc.rect(sumLeft, y, 165, 8)
      doc.setFont('helvetica', 'normal')
      doc.text('1', sumX[0] + 4, y + 5.5)
      doc.text('Items', sumX[1] + 2, y + 5.5)
      doc.text(String(submission.items.length), sumX[2] + 4, y + 5.5)
      doc.text('-', sumX[3] + 5, y + 5.5)
      doc.text('-', sumX[4] + 5, y + 5.5)

      for (let i = 0; i <= sumWidths.length; i++) {
        const xPos = i === sumWidths.length ? sumLeft + 165 : sumX[i]
        doc.line(xPos, y, xPos, y + 8)
      }

      y += 8
      doc.rect(sumLeft + 72, y, 93, 8)
      doc.setFont('helvetica', 'bold')
      doc.text('Initial Total', sumX[3] - 20, y + 5.5)
      doc.text(submission.designerBudget ? `INR ${submission.designerBudget.toLocaleString('en-IN')}` : '-', sumX[4] + 2, y + 5.5)
      doc.line(sumX[4], y, sumX[4], y + 8)

      y += 8
      doc.rect(sumLeft + 72, y, 93, 8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(180, 50, 60)
      doc.text('Final Total', sumX[3] - 20, y + 5.5)
      doc.text(submission.designerBudget ? `INR ${submission.designerBudget.toLocaleString('en-IN')}` : '-', sumX[4] + 2, y + 5.5)
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

      doc.save(`Submission-${submission.projectName.replace(/\s+/g, '_')}.pdf`)
    } catch (err) {
      console.error('Failed to generate PDF:', err)
      alert('Error generating PDF. Please try again.')
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: '40px auto', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading submission review details...
      </div>
    )
  }

  if (!submission) {
    return (
      <div style={{ maxWidth: 800, margin: '40px auto', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--text-primary)' }}>Submission not found</h3>
        <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => router.push('/admin/quotes')}>
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Review Submission</h1>
          <p className="page-subtitle">Inspect designer details and select match-making brands</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={handleDownloadPDF}>
            Download PDF
          </button>
          <button className="btn btn-secondary" onClick={() => router.push('/admin/quotes')}>
            ← Back to List
          </button>
        </div>
      </div>

      {error && <div className="login-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Submitted By</label>
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>{submission.designerName}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{submission.designerEmail}</div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Project Name</label>
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>{submission.projectName}</div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Designer Target Budget</label>
            <div style={{ fontWeight: 600, color: '#16a34a', fontSize: 14 }}>
              {submission.designerBudget ? `₹${submission.designerBudget.toLocaleString('en-IN')}` : 'No Budget Set'}
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Submitted Date</label>
            <div>{formatDate(submission.createdAt)}</div>
          </div>
        </div>

        <ReferenceImageGallery referenceImage={submission.referenceImage} />

        {/* Item Specifications */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 20, backgroundColor: '#fafafa' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase' }}>
            Project Specifications ({submission.itemsCount} Items) — Admin Editable Descriptions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {submission.items.map((item, idx) => {
              const isEditing = editingItemId === item.id
              return (
                <div key={item.id || idx} style={{ display: 'flex', flexDirection: 'column', gap: 8, background: '#fff', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                      {item.image && (
                        <img src={item.image} alt={`${item.itemType || 'Unit'} reference`} style={{ width: 84, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)', flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{item.description}</div>
                        {item.notes && <div style={{ fontSize: 12, color: '#16a34a', marginTop: 4, fontWeight: 500 }}>Description / Spec: {item.notes}</div>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 500, whiteSpace: 'nowrap', fontSize: 12 }}>
                        {item.sft ? `${item.sft} SFT × ` : ''}Qty {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ fontSize: 11.5, padding: '4px 10px', borderRadius: 4 }}
                        onClick={() => {
                          if (isEditing) {
                            setEditingItemId(null)
                          } else {
                            setEditingItemId(item.id)
                            setEditNoteValue(item.notes || '')
                          }
                        }}
                      >
                        {isEditing ? 'Cancel' : '✏ Edit Description'}
                      </button>
                    </div>
                  </div>

                  {/* Inline Description Editor for Admin */}
                  {isEditing && (
                    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 10, marginTop: 4, display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        className="form-input"
                        style={{ flex: 1, fontSize: 12.5, padding: '6px 10px', borderRadius: 4 }}
                        placeholder="Enter sub item description (e.g. Providing & fixing full height unit in HDHMR)..."
                        value={editNoteValue}
                        onChange={(e) => setEditNoteValue(e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ background: '#000', color: '#fff', fontSize: 12, padding: '6px 14px', borderRadius: 4 }}
                        disabled={savingItemId === item.id}
                        onClick={async () => {
                          setSavingItemId(item.id)
                          try {
                            const res = await fetch(`/api/admin/items/${item.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ notes: editNoteValue }),
                            })
                            if (res.ok) {
                              await fetchDetail()
                              setEditingItemId(null)
                            } else {
                              alert('Failed to update description')
                            }
                          } catch (e) {
                            console.error(e)
                          } finally {
                            setSavingItemId(null)
                          }
                        }}
                      >
                        {savingItemId === item.id ? 'Saving…' : 'Save Spec Description'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Brand Matchmaking & Estimation */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 18, marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Brand Budget Suitability & Matrix Calculations
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {submission.brandEstimations.map((b) => {
              const matchesBudget = b.totalCost !== null && submission.designerBudget && b.totalCost <= submission.designerBudget
              const isChecked = selectedBrands.includes(b.brandId)

              return (
                <div 
                  key={b.brandId} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '10px 14px', 
                    background: isChecked ? 'rgba(0,0,0,0.02)' : '#fff', 
                    border: `1px solid ${isChecked ? 'var(--text-primary)' : 'var(--border)'}`, 
                    borderRadius: 8, 
                    cursor: 'pointer' 
                  }}
                  onClick={() => toggleBrand(b.brandId)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input 
                      type="checkbox" 
                      checked={isChecked} 
                      onChange={() => {}} // Handled by outer click
                      onClick={(e) => e.stopPropagation()} 
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ fontWeight: 600 }}>{b.brandName}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {b.totalCost !== null ? (
                      <>
                        <span style={{ fontWeight: 600, fontSize: 13.5 }}>₹{b.totalCost.toLocaleString('en-IN')}</span>
                        {submission.designerBudget && (
                          <span 
                            style={{ 
                              fontSize: 10.5, 
                              fontWeight: 600, 
                              padding: '3px 8px', 
                              borderRadius: 4, 
                              backgroundColor: matchesBudget ? '#dcfce7' : '#fee2e2', 
                              color: matchesBudget ? '#15803d' : '#b91c1c' 
                            }}
                          >
                            {matchesBudget ? 'Within Budget' : 'Over Budget'}
                          </span>
                        )}
                      </>
                    ) : (
                      <span 
                        style={{ 
                          fontSize: 10.5, 
                          fontWeight: 500, 
                          padding: '3px 8px', 
                          borderRadius: 4, 
                          backgroundColor: '#fef3c7', 
                          color: '#b45309' 
                        }}
                      >
                        ⚠️ Matrix Incomplete
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="form-actions" style={{ borderTop: '1px solid var(--border)', paddingTop: 18, justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" className="btn btn-secondary" onClick={() => router.push('/admin/quotes')} disabled={actionLoading}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ background: '#000', color: '#fff' }}
            disabled={actionLoading}
            onClick={handleDistribute}
          >
            {actionLoading ? 'Distributing…' : `Distribute to Selected Brands (${selectedBrands.length})`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <ReviewDistributeDetail id={id} />
}
