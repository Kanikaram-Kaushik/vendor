'use client'

import { useState, useEffect, useCallback } from 'react'

interface Brand {
  id: string
  name: string
  email: string
  logo: string | null
}

interface HiringPost {
  id: string
  brandId: string
  title: string
  description: string
  role: string
  location: string | null
  salary: string | null
  contactInfo: string | null
  createdAt: string
  brand: Brand
}

export default function VendorHiringPage() {
  const [posts, setPosts] = useState<HiringPost[]>([])
  const [currentVendorId, setCurrentVendorId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Modal & form state
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState('')
  const [role, setRole] = useState('Interior Designer')
  const [location, setLocation] = useState('')
  const [salary, setSalary] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [description, setDescription] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Fetch current vendor profile to identify post owner and pre-fill contact info
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/vendor/profile')
        if (res.ok) {
          const data = await res.json()
          if (data.brand) {
            setCurrentVendorId(data.brand.id)
            setContactInfo(data.brand.email || '')
          }
        }
      } catch (err) {
        console.error('Error loading vendor profile:', err)
      }
    }
    loadProfile()
  }, [])

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/vendor/hiring')
      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts || [])
      }
    } catch (err) {
      console.error('Error fetching hiring posts:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !description.trim() || !role.trim()) {
      setFormError('Please fill in Job Title, Category/Role, and Description.')
      return
    }
    setFormError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/vendor/hiring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          role,
          location: location.trim() || null,
          salary: salary.trim() || null,
          contactInfo: contactInfo.trim() || null,
          description,
        }),
      })

      if (res.ok) {
        // Reset and close
        setTitle('')
        setLocation('')
        setSalary('')
        setDescription('')
        setShowModal(false)
        fetchPosts()
      } else {
        const data = await res.json()
        setFormError(data.error || 'Failed to create job post.')
      }
    } catch {
      setFormError('Network error.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeletePost(id: string, titleStr: string) {
    if (!confirm(`Are you sure you want to delete the job opening for "${titleStr}"?`)) return

    try {
      const res = await fetch(`/api/vendor/hiring?id=${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchPosts()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete job post.')
      }
    } catch {
      alert('Network error.')
    }
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Hiring & Job Openings</h1>
          <p className="page-subtitle">Find resources, hire people, and view posts from other brands</p>
        </div>
        <button
          className="btn btn-primary"
          style={{ background: '#111', color: '#fff', fontWeight: 600, padding: '10px 20px', borderRadius: 6 }}
          onClick={() => setShowModal(true)}
        >
          + Post a Job
        </button>
      </div>

      <div className="page-body">
        {loading ? (
          <div className="empty-state">
            <div className="empty-state-text">Loading job posts…</div>
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💼</div>
            <div className="empty-state-text">No job openings posted yet</div>
            <div className="empty-state-sub">Be the first to list a job posting for designers and other professionals!</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {posts.map((post) => {
              const isOwner = post.brandId === currentVendorId
              return (
                <div
                  key={post.id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: 24,
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow)',
                    borderRadius: 12,
                    position: 'relative',
                  }}
                >
                  <div>
                    {/* Brand Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          backgroundColor: '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 16,
                          color: '#555',
                          overflow: 'hidden',
                          border: '1px solid #e5e7eb',
                        }}
                      >
                        {post.brand.logo ? (
                          <img src={post.brand.logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          post.brand.name.substring(0, 1).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-primary)' }}>
                          {post.brand.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          Posted on {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                      
                      {/* Owner indicator / Delete button */}
                      {isOwner && (
                        <button
                          onClick={() => handleDeletePost(post.id, post.title)}
                          style={{
                            marginLeft: 'auto',
                            color: '#dc2626',
                            fontSize: 12,
                            fontWeight: 600,
                            padding: '4px 8px',
                            border: '1px solid #fecaca',
                            borderRadius: 4,
                            background: '#fef2f2',
                            cursor: 'pointer',
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>

                    {/* Job Title and Role Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#111' }}>{post.title}</h3>
                      <span
                        style={{
                          backgroundColor: '#f3f4f6',
                          color: '#374151',
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: 12,
                        }}
                      >
                        {post.role}
                      </span>
                    </div>

                    {/* Description */}
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16, whiteSpace: 'pre-line' }}>
                      {post.description}
                    </p>
                  </div>

                  {/* Metadata Footer */}
                  <div
                    style={{
                      borderTop: '1px solid var(--border-light)',
                      paddingTop: 12,
                      marginTop: 12,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', gap: 16 }}>
                      {post.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
                          📍 {post.location}
                        </div>
                      )}
                      {post.salary && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
                          💰 {post.salary}
                        </div>
                      )}
                    </div>

                    {post.contactInfo && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        Contact: <strong style={{ color: '#111' }}>{post.contactInfo}</strong>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Creation Modal Overlay */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title" style={{ fontSize: 18, marginBottom: 16 }}>Post a New Job Opening</h2>
            
            {formError && (
              <div className="login-error" style={{ marginBottom: 14, padding: '10px 12px', fontSize: 12.5 }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreatePost}>
              <div className="form-group">
                <label className="form-label">Job Title</label>
                <input
                  className="form-input"
                  placeholder="e.g. Senior 3D Designer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Category / Role</label>
                  <select
                    className="form-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="Interior Designer">Interior Designer</option>
                    <option value="3D Visualizer">3D Visualizer</option>
                    <option value="Architect">Architect</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Site Engineer">Site Engineer</option>
                    <option value="Draftsman">Draftsman</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Job Location</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Remote / Bangalore"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Salary / Compensation</label>
                  <input
                    className="form-input"
                    placeholder="e.g. ₹50k - ₹70k / month"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Email / Info</label>
                  <input
                    className="form-input"
                    placeholder="e.g. jobs@yourbrand.com"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Job Description</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: 100, resize: 'vertical' }}
                  placeholder="Describe details, roles, requirements, and qualifications..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="form-actions" style={{ marginTop: 20 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ background: '#111', color: '#fff' }}
                  disabled={submitting}
                >
                  {submitting ? 'Posting…' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
