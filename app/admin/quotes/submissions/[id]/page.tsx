'use client'

import { useState, useEffect, use, useCallback } from 'react'
import { useRouter } from 'next/navigation'

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

  const fetchDetail = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/submissions')
      if (res.ok) {
        const data = await res.json()
        const found = (data.submissions || []).find((s: any) => s.id === id)
        if (found) {
          setSubmission(found)
          // Pre-select brands that are complete and within budget
          const recommended = found.brandEstimations
            .filter((b: any) => b.isComplete && b.totalCost !== null && found.designerBudget && b.totalCost <= found.designerBudget)
            .map((b: any) => b.brandId)
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
        <button className="btn btn-secondary" onClick={() => router.push('/admin/quotes')}>
          ← Back to List
        </button>
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

        {/* Item Specifications */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 20, backgroundColor: '#fafafa' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase' }}>
            Project Specifications ({submission.itemsCount} Items)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {submission.items.map((item, idx) => (
              <div key={item.id || idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid #eef2f6', paddingBottom: 6 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.description}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{item.sft} SFT × Qty {item.quantity}</span>
              </div>
            ))}
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
