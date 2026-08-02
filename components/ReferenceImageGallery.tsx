'use client'

import { useState, useEffect } from 'react'
import { parseReferenceImages } from '@/lib/reference-image'

interface ReferenceImageGalleryProps {
  referenceImage?: string | null
  title?: string
}

export function ReferenceImageGallery({ referenceImage, title = 'Reference Images' }: ReferenceImageGalleryProps) {
  const images = parseReferenceImages(referenceImage)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return
      if (e.key === 'Escape') setSelectedIndex(null)
      if (e.key === 'ArrowRight') setSelectedIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0))
      if (e.key === 'ArrowLeft') setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1))
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex, images.length])

  if (!images || images.length === 0) {
    return null
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>{title}</span>
        <span style={{ background: '#e2e8f0', color: '#475569', borderRadius: 12, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
          {images.length} {images.length === 1 ? 'image' : 'images'}
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 14,
      }}>
        {images.map((imgSrc, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedIndex(idx)}
            style={{
              position: 'relative',
              borderRadius: 10,
              overflow: 'hidden',
              border: '1px solid var(--border)',
              backgroundColor: '#f8fafc',
              cursor: 'pointer',
              aspectRatio: '4 / 3',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <img
              src={imgSrc}
              alt={`Reference ${idx + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: 6,
              right: 6,
              background: 'rgba(0,0,0,0.65)',
              color: '#fff',
              fontSize: 11,
              padding: '2px 8px',
              borderRadius: 4,
              backdropFilter: 'blur(4px)',
            }}>
              #{idx + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            backdropFilter: 'blur(6px)',
          }}
          onClick={() => setSelectedIndex(null)}
        >
          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setSelectedIndex(null)
            }}
            style={{
              position: 'absolute',
              top: 20,
              right: 24,
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#fff',
              fontSize: 24,
              width: 44,
              height: 44,
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            title="Close (Esc)"
          >
            ✕
          </button>

          {/* Header indicator */}
          <div
            style={{
              position: 'absolute',
              top: 24,
              color: '#94a3b8',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Image {selectedIndex + 1} of {images.length}
          </div>

          {/* Main preview image container */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '80vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={images[selectedIndex]}
              alt={`Reference view ${selectedIndex + 1}`}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: 8,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
              }}
            />

            {/* Navigation arrows if multiple images */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1))
                  }}
                  style={{
                    position: 'absolute',
                    left: -60,
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    color: '#fff',
                    fontSize: 22,
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Previous"
                >
                  ‹
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0))
                  }}
                  style={{
                    position: 'absolute',
                    right: -60,
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    color: '#fff',
                    fontSize: 22,
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Next"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
