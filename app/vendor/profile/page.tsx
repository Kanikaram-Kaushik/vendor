'use client'

import { useState, useEffect } from 'react'

interface Project {
  id: string
  name: string
  isOpen: boolean
}

export default function VendorProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Form Fields
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [coverImage, setCoverImage] = useState('/living-room-placeholder.jpg') // fallback/placeholder
  const [logo, setLogo] = useState('')
  
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [locality, setLocality] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [city2, setCity2] = useState('') // right of State
  const [pincode, setPincode] = useState('')
  const [city3, setCity3] = useState('') // right of Pincode
  const [latitude, setLatitude] = useState('')
  const [city4, setCity4] = useState('') // right of Latitude

  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')

  const [linkedin, setLinkedin] = useState('')
  const [facebook, setFacebook] = useState('')
  const [twitter, setTwitter] = useState('')
  const [instagram, setInstagram] = useState('')

  const [projects, setProjects] = useState<Project[]>([
    { id: '1', name: 'Project 1', isOpen: false },
    { id: '2', name: 'Project 2', isOpen: false },
  ])

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/vendor/profile')
        if (res.ok) {
          const data = await res.json()
          const b = data.brand
          if (b) {
            setName(b.name || '')
            setDescription(b.description || '')
            setCoverImage(b.coverImage || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80')
            setLogo(b.logo || '')
            setAddressLine1(b.addressLine1 || '')
            setAddressLine2(b.addressLine2 || '')
            setLocality(b.locality || '')
            setCity(b.city || '')
            setState(b.state || '')
            setCity2(b.city2 || b.city || '')
            setPincode(b.pincode || '')
            setCity3(b.city3 || b.city || '')
            setLatitude(b.latitude || '')
            setCity4(b.city4 || b.city || '')
            setEmail(b.email || '')
            setPhone(b.phone || '')
            setWebsite(b.website || '')
            setLinkedin(b.linkedin || '')
            setFacebook(b.facebook || '')
            setTwitter(b.twitter || '')
            setInstagram(b.instagram || '')
            
            if (b.portfolio) {
              try {
                const parsed = JSON.parse(b.portfolio)
                if (Array.isArray(parsed)) {
                  setProjects(parsed)
                }
              } catch {
                // fallback
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  // Portfolio actions
  function addProject() {
    if (projects.length >= 5) return
    const nextNum = projects.length + 1
    setProjects([...projects, { id: Date.now().toString(), name: `Project ${nextNum}`, isOpen: false }])
  }

  function removeProject(id: string) {
    setProjects(projects.filter(p => p.id !== id))
  }

  function updateProjectName(id: string, newName: string) {
    setProjects(projects.map(p => p.id === id ? { ...p, name: newName } : p))
  }

  function toggleProjectOpen(id: string) {
    setProjects(projects.map(p => p.id === id ? { ...p, isOpen: !p.isOpen } : p))
  }

  async function handleSave() {
    setSaving(true)
    setMessage('')
    setError('')

    try {
      const res = await fetch('/api/vendor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          coverImage,
          logo,
          addressLine1,
          addressLine2,
          locality,
          city,
          state,
          pincode,
          latitude,
          website,
          linkedin,
          facebook,
          twitter,
          instagram,
          portfolio: projects,
        }),
      })

      if (res.ok) {
        setMessage('Profile updated successfully!')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to update profile')
      }
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Manage your brand information</p>
        </div>
        <div className="page-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
          <div style={{ color: '#999', fontSize: 14 }}>Loading profile information…</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Manage your brand information</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {message && <span style={{ color: '#16a34a', fontSize: 13, fontWeight: 500, alignSelf: 'center' }}>{message}</span>}
          {error && <span style={{ color: '#dc2626', fontSize: 13, fontWeight: 500, alignSelf: 'center' }}>{error}</span>}
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ background: '#000', color: '#fff', padding: '8px 24px', borderRadius: 4, fontWeight: 600 }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="page-body" style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* 1. Brand Identity */}
        <div className="card">
          <div className="card-header" style={{ background: '#fafafa' }}>
            <div>
              <span className="card-title" style={{ fontSize: 14, fontWeight: 600 }}>Brand Identity</span>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Your brand's core details and identity visible to platform users.</div>
            </div>
          </div>
          <div className="card-body" style={{ padding: 24 }}>
            {/* Banner Cover Wrapper */}
            <div style={{ position: 'relative', height: 260, borderRadius: 8, overflow: 'visible', marginBottom: 50 }}>
              <img
                src={coverImage}
                alt="Brand Cover"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
              />
              {/* Cover Upload Trigger */}
              <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: 11, padding: '4px 10px', background: 'rgba(255,255,255,0.9)' }}
                  onClick={() => {
                    const url = prompt('Enter cover image URL:', coverImage)
                    if (url) setCoverImage(url)
                  }}
                >
                  Change Cover
                </button>
              </div>

              {/* Circle Logo Overlay */}
              <div
                style={{
                  position: 'absolute',
                  bottom: -40,
                  left: 32,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  border: '4px solid #fff',
                  background: '#e5e7eb',
                  boxShadow: 'var(--shadow)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  const url = prompt('Enter logo image URL:', logo)
                  if (url) setLogo(url)
                }}
              >
                {logo ? (
                  <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: 8 }}>Upload logo</div>
                )}
              </div>
            </div>

            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 32, marginBottom: 20 }}>
              Upload brand logo <br /> Recommended 1:1, 5mb max
            </div>

            <div className="form-group">
              <label className="form-label">Brand Name</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Enter Brand Name" />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                style={{ minHeight: 100, resize: 'vertical' }}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brand description"
              />
            </div>
          </div>
        </div>

        {/* 2. Business Address */}
        <div className="card">
          <div className="card-header" style={{ background: '#fafafa' }}>
            <div>
              <span className="card-title" style={{ fontSize: 14, fontWeight: 600 }}>Business Address</span>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Provide your complete business address with location details</div>
            </div>
          </div>
          <div className="card-body" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Address line 1 *</label>
              <input className="form-input" value={addressLine1} onChange={e => setAddressLine1(e.target.value)} placeholder="Line 1" />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Address line 2</label>
              <input className="form-input" value={addressLine2} onChange={e => setAddressLine2(e.target.value)} placeholder="Line 2" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Locality/Area</label>
                <input className="form-input" value={locality} onChange={e => setLocality(e.target.value)} placeholder="Line 1" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">City</label>
                <input className="form-input" value={city} onChange={e => setCity(e.target.value)} placeholder="Line 1" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">State</label>
                <input className="form-input" value={state} onChange={e => setState(e.target.value)} placeholder="Line 1" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">City</label>
                <input className="form-input" value={city2} onChange={e => setCity2(e.target.value)} placeholder="Line 1" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Pincode</label>
                <input className="form-input" value={pincode} onChange={e => setPincode(e.target.value)} placeholder="Line 1" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">City</label>
                <input className="form-input" value={city3} onChange={e => setCity3(e.target.value)} placeholder="Line 1" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Lattitude</label>
                <input className="form-input" value={latitude} onChange={e => setLatitude(e.target.value)} placeholder="Line 1" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">City</label>
                <input className="form-input" value={city4} onChange={e => setCity4(e.target.value)} placeholder="Line 1" />
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Location on map</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Click on the map to pin your location and set</div>
              
              {/* Dummy Map Container for UI excellence */}
              <div style={{ height: 180, background: '#e5e7eb', borderRadius: 6, marginTop: 10, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.4, backgroundImage: 'radial-gradient(#9ca3af 1px, transparent 0), radial-gradient(#9ca3af 1px, transparent 0)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }} />
                <div style={{ zIndex: 1, textAlign: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="3" style={{ marginBottom: 6 }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: '#374151' }}>Map Pin Set (Lat: {latitude || '0.00'})</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Contact Information */}
        <div className="card">
          <div className="card-header" style={{ background: '#fafafa' }}>
            <div>
              <span className="card-title" style={{ fontSize: 14, fontWeight: 600 }}>Contact Information</span>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>How platform users can reach you</div>
            </div>
          </div>
          <div className="card-body" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email</label>
                <input className="form-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="Line 1" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone</label>
                <input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Line 1" />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">Website</label>
              <input className="form-input" value={website} onChange={e => setWebsite(e.target.value)} placeholder="Line 2" />
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '4px 0' }} />

            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.3 }}>Social Media Handles</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">LinkedIn</label>
                <input className="form-input" value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="Line 1" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Facebook</label>
                <input className="form-input" value={facebook} onChange={e => setFacebook(e.target.value)} placeholder="Line 1" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Twitter</label>
                <input className="form-input" value={twitter} onChange={e => setTwitter(e.target.value)} placeholder="Line 2" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Instagram</label>
                <input className="form-input" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="Line 2" />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Portfolio Projects */}
        <div className="card">
          <div className="card-header" style={{ background: '#fafafa' }}>
            <div>
              <span className="card-title" style={{ fontSize: 14, fontWeight: 600 }}>Portfolio Projects</span>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Showcase your best work, add upto 5 projects</div>
            </div>
          </div>
          <div className="card-body" style={{ padding: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 16px',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    background: '#fff',
                  }}
                >
                  {/* Reorder dots icon representation */}
                  <div style={{ cursor: 'grab', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ display: 'flex', gap: 2 }}><span style={{ width: 4, height: 4, borderRadius: '50%', background: '#9ca3af' }} /><span style={{ width: 4, height: 4, borderRadius: '50%', background: '#9ca3af' }} /></div>
                    <div style={{ display: 'flex', gap: 2 }}><span style={{ width: 4, height: 4, borderRadius: '50%', background: '#9ca3af' }} /><span style={{ width: 4, height: 4, borderRadius: '50%', background: '#9ca3af' }} /></div>
                    <div style={{ display: 'flex', gap: 2 }}><span style={{ width: 4, height: 4, borderRadius: '50%', background: '#9ca3af' }} /><span style={{ width: 4, height: 4, borderRadius: '50%', background: '#9ca3af' }} /></div>
                  </div>

                  <input
                    className="form-input"
                    style={{ flex: 1, border: 'none', padding: 4, background: 'transparent', fontWeight: 500 }}
                    value={proj.name}
                    onChange={e => updateProjectName(proj.id, e.target.value)}
                  />

                  {/* Expand dropdown chevron */}
                  <button type="button" onClick={() => toggleProjectOpen(proj.id)} style={{ color: 'var(--text-muted)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: proj.isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {/* Delete trash button */}
                  <button type="button" onClick={() => removeProject(proj.id)} style={{ color: '#dc2626' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                    </svg>
                  </button>
                </div>
              ))}
              
              {projects.length < 5 && (
                <button type="button" className="btn btn-secondary" onClick={addProject} style={{ borderStyle: 'dashed', borderColor: '#ccc', alignSelf: 'flex-start', marginTop: 4 }}>
                  + Add Project
                </button>
              )}
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Additional portfolio media</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Add general portfolio images</div>
              
              {/* Click to upload images zone */}
              <div
                style={{
                  height: 120,
                  border: '2px dashed var(--border)',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#fafafa',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  fontSize: 13,
                  transition: 'background 0.2s'
                }}
                onClick={() => alert('Feature to upload general portfolio images simulated successfully')}
              >
                Click to upload Images
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
