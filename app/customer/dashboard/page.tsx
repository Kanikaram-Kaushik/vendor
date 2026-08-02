'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=80',
    prefix: 'Transform your home into a',
    highlight: 'Masterpiece',
    subtext: 'Bespoke interior design and execution tailored to your lifestyle and budget.',
  },
  {
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2000&q=80',
    prefix: 'Experience the pinnacle of',
    highlight: 'Luxury Living',
    subtext: 'Curated material palettes, premium hardware, and precision engineering.',
  },
  {
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=2000&q=80',
    prefix: 'Design spaces filled with',
    highlight: 'Warmth & Elegance',
    subtext: 'Smart storage, ambient lighting, and flawless craftsmanship.',
  },
  {
    image: 'https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?auto=format&fit=crop&w=2000&q=80',
    prefix: 'Redefining interiors through',
    highlight: 'Modern Innovation',
    subtext: 'Instant rate-matrix estimates and direct matchmaking with top studios.',
  },
]

const ROOM_SHOWCASES = [
  {
    id: 'living',
    category: 'Living Room',
    title: 'Contemporary Open-Plan Living & TV Console',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    specs: 'HDHMR Core | Hettich Soft-Close | Fluted PU Panel & LED Backlight',
    estPrice: '₹2,40,000 - ₹3,80,000',
  },
  {
    id: 'kitchen',
    category: 'Modular Kitchen',
    title: 'German-Spec Parallel Kitchen with Pantry Unit',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
    specs: 'BWP Boiling Waterproof Ply | Hafele Tandem Drawers | Acrylic Finish',
    estPrice: '₹3,20,000 - ₹5,50,000',
  },
  {
    id: 'bedroom',
    category: 'Master Bedroom',
    title: 'Floor-to-Ceiling Sliding Wardrobe & Dressing Vanity',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
    specs: 'MR Ply | Ebco Heavy Duty Track | Tinted Glass & Matt Laminate',
    estPrice: '₹1,90,000 - ₹3,10,000',
  },
  {
    id: 'dining',
    category: 'Dining & Puja',
    title: 'Sacred Puja Shrine & Floating Glass Crockery Cabinet',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80',
    specs: 'Brass Inlay Teak Finish | Warm LED Profile | CNC Carved Doors',
    estPrice: '₹1,20,000 - ₹2,10,000',
  },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Explore & Save References',
    description: 'Browse curated interior room showcases, material palettes, and rate cards to build your project brief.',
  },
  {
    step: '02',
    title: 'AI Studio Estimation',
    description: 'Our matrix engine calculates real-time cost estimates based on hardware (Hafele/Hettich/Ebco) and core materials.',
  },
  {
    step: '03',
    title: 'Match with Top Vendors',
    description: 'Receive verified quotes from vetted design studios and manufacturers guaranteed within budget.',
  },
]

const TESTIMONIALS = [
  {
    quote: 'DesignBHK translated our reference images into a warm, calm layout that works perfectly for our daily life.',
    name: 'Ananya & Vikram Sharma',
    location: '3BHK Apartment, Bangalore',
    rating: 5,
  },
  {
    quote: 'The rate matrix transparency gave us total confidence. Zero hidden costs and executed right on schedule!',
    name: 'Rohan Mehta',
    location: 'Penthouse Villa, Hyderabad',
    rating: 5,
  },
]

export default function CustomerDashboardPage() {
  const router = useRouter()
  const [activeSlide, setActiveSlide] = useState(0)
  const [activeTab, setActiveTab] = useState<'home' | 'showcase' | 'how' | 'services'>('home')

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  async function handleLogout() {
    await fetch('/api/customer/logout', { method: 'POST' })
    router.push('/customer/login')
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Top Customer Portal Navbar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '14px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #e2e8f0 0%, #ffffff 100%)',
            color: '#0f172a',
            fontWeight: 800,
            fontSize: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(255,255,255,0.15)',
          }}>
            BHK
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px', color: '#fff' }}>DesignBHK</div>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>Customer Portal</div>
          </div>
        </div>

        {/* Center Nav Items */}
        <nav style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <button
            onClick={() => setActiveTab('home')}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'home' ? '#fff' : '#94a3b8',
              fontWeight: activeTab === 'home' ? 600 : 400,
              fontSize: 14,
              cursor: 'pointer',
              borderBottom: activeTab === 'home' ? '2px solid #fff' : '2px solid transparent',
              paddingBottom: 4,
              transition: 'all 0.2s',
            }}
          >
            Showcase
          </button>
          <button
            onClick={() => setActiveTab('showcase')}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'showcase' ? '#fff' : '#94a3b8',
              fontWeight: activeTab === 'showcase' ? 600 : 400,
              fontSize: 14,
              cursor: 'pointer',
              borderBottom: activeTab === 'showcase' ? '2px solid #fff' : '2px solid transparent',
              paddingBottom: 4,
              transition: 'all 0.2s',
            }}
          >
            AI Studio Rooms
          </button>
          <button
            onClick={() => setActiveTab('how')}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'how' ? '#fff' : '#94a3b8',
              fontWeight: activeTab === 'how' ? 600 : 400,
              fontSize: 14,
              cursor: 'pointer',
              borderBottom: activeTab === 'how' ? '2px solid #fff' : '2px solid transparent',
              paddingBottom: 4,
              transition: 'all 0.2s',
            }}
          >
            How It Works
          </button>
          <button
            onClick={() => setActiveTab('services')}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'services' ? '#fff' : '#94a3b8',
              fontWeight: activeTab === 'services' ? 600 : 400,
              fontSize: 14,
              cursor: 'pointer',
              borderBottom: activeTab === 'services' ? '2px solid #fff' : '2px solid transparent',
              paddingBottom: 4,
              transition: 'all 0.2s',
            }}
          >
            Services & Rate Cards
          </button>
        </nav>

        {/* Right User Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 999,
            padding: '6px 14px',
            fontSize: 12.5,
            color: '#e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }}></span>
            <span>Demo Customer</span>
          </div>

          <button
            onClick={handleLogout}
            style={{
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '7px 16px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main Website Hero Section */}
      <section style={{ position: 'relative', width: '100%', minHeight: '75vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Background Image Carousel */}
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: idx === activeSlide ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
              backgroundImage: `linear-gradient(to bottom, rgba(9,9,11,0.4), rgba(9,9,11,0.85)), url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ))}

        {/* Hero Content Overlay */}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: 900, textAlign: 'center', padding: '0 24px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)',
            padding: '6px 16px',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 500,
            marginBottom: 20,
            color: '#f1f5f9',
          }}>
            ✨ Premium Interior Design & Execution Portal
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-1px', marginBottom: 16 }}>
            {HERO_SLIDES[activeSlide].prefix} <br />
            <span style={{
              background: 'linear-gradient(135deg, #fef08a 0%, #f59e0b 50%, #d97706 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {HERO_SLIDES[activeSlide].highlight}
            </span>
          </h1>

          <p style={{ fontSize: 18, color: '#cbd5e1', maxWidth: 640, margin: '0 auto 32px auto', lineHeight: 1.6 }}>
            {HERO_SLIDES[activeSlide].subtext}
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('showcase')}
              style={{
                background: '#fff',
                color: '#0f172a',
                border: 'none',
                padding: '14px 28px',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 10px 25px rgba(255,255,255,0.2)',
              }}
            >
              Explore AI Studio Rooms →
            </button>

            <button
              onClick={() => setActiveTab('services')}
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.25)',
                padding: '14px 28px',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
              }}
            >
              View Rate Cards
            </button>
          </div>

          {/* Slide Indicators */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 40 }}>
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                style={{
                  width: idx === activeSlide ? 32 : 10,
                  height: 8,
                  borderRadius: 4,
                  background: idx === activeSlide ? '#f59e0b' : 'rgba(255,255,255,0.3)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* AI Studio Room Showcase */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: 1.5 }}>
            Interactive AI Studio Showcase
          </span>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginTop: 8 }}>Explore Curated Room Concepts</h2>
          <p style={{ color: '#94a3b8', fontSize: 16, marginTop: 8 }}>
            Real material specifications, hardware options, and instant budget estimations.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {ROOM_SHOWCASES.map((room) => (
            <div
              key={room.id}
              style={{
                borderRadius: 16,
                overflow: 'hidden',
                background: '#18181b',
                border: '1px solid rgba(255,255,255,0.08)',
                transition: 'transform 0.3s ease, border-color 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ position: 'relative', width: '100%', height: 220, overflow: 'hidden' }}>
                <img
                  src={room.image}
                  alt={room.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fef08a',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 6,
                  backdropFilter: 'blur(4px)',
                  textTransform: 'uppercase',
                }}>
                  {room.category}
                </div>
              </div>

              <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: '#fff' }}>{room.title}</h3>
                  <p style={{ fontSize: 13, color: '#a1a1aa', lineHeight: 1.5, marginBottom: 16 }}>{room.specs}</p>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#71717a' }}>Estimated Range</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#22c55e' }}>{room.estPrice}</div>
                  </div>
                  <button style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 14px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}>
                    Select Spec
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ background: '#121215', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '60px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: 1.5 }}>
              Simple 3-Step Journey
            </span>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginTop: 8 }}>How DesignBHK Works</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32 }}>
            {HOW_IT_WORKS.map((hw) => (
              <div key={hw.step} style={{ background: '#18181b', borderRadius: 16, padding: 28, border: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: 'rgba(255,255,255,0.15)', marginBottom: 12 }}>{hw.step}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: '#fff' }}>{hw.title}</h3>
                <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6 }}>{hw.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Testimonials & Reviews */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#ec4899', textTransform: 'uppercase', letterSpacing: 1.5 }}>
            Client Stories
          </span>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginTop: 8 }}>Loved by Homeowners</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} style={{ background: '#18181b', borderRadius: 16, padding: 28, border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ color: '#f59e0b', fontSize: 16, marginBottom: 12 }}>★★★★★</div>
              <p style={{ fontSize: 15, color: '#e2e8f0', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 20 }}>
                "{t.quote}"
              </p>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>{t.name}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{t.location}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Customer Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '32px 24px', textAlign: 'center', color: '#71717a', fontSize: 13 }}>
        © 2026 DesignBHK. All rights reserved. Registered Customer Portal.
      </footer>
    </div>
  )
}