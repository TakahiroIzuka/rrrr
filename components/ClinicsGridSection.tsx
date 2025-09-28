'use client'

import { useState } from 'react'

interface Clinic {
  id: number
  name: string
  star: number | null
  user_review_count: number
  lat: number
  lng: number
  prefecture: string
  area: string
  genre_id: number
}

interface ClinicsGridSectionProps {
  clinics: Clinic[]
}

export default function ClinicsGridSection({ clinics }: ClinicsGridSectionProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  return (
    <section style={{
      backgroundColor: '#f8fafc',
      padding: '4rem 2rem',
      borderTop: '1px solid #e2e8f0'
    }}>
      <style jsx>{`
        .clinics-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1.5rem;
          max-width: 100%;
        }

        @media (max-width: 1200px) {
          .clinics-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (max-width: 900px) {
          .clinics-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 700px) {
          .clinics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 500px) {
          .clinics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Section Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#2d3748',
            margin: '0 0 1rem 0',
            fontFamily: "'Kosugi Maru', sans-serif"
          }}>
            リストで絞り込み検索結果一覧はこちら
          </h2>
        </div>

        {/* Clinics Grid */}
        <div className="clinics-grid">
          {clinics.map((clinic) => (
            <div
              key={clinic.id}
              style={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: hoveredCard === clinic.id
                  ? '0 8px 25px rgba(0, 0, 0, 0.15)'
                  : '0 2px 8px rgba(0, 0, 0, 0.06)',
                transform: hoveredCard === clinic.id
                  ? 'translateY(-3px)'
                  : 'translateY(0px)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={() => setHoveredCard(clinic.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Genre Badge */}
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                backgroundColor: clinic.genre_id === 1 ? '#e0e7ff' : clinic.genre_id === 2 ? '#f0fff4' : '#fef7e0',
                color: clinic.genre_id === 1 ? '#5b21b6' : clinic.genre_id === 2 ? '#166534' : '#92400e',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                {clinic.genre_id === 1 ? 'ピラティス' : clinic.genre_id === 2 ? '内科' : '皮膚科'}
              </div>

              {/* Clinic Name */}
              <h3 style={{
                margin: '0 0 0.75rem 0',
                color: '#2d3748',
                fontSize: '1.1rem',
                fontWeight: '600',
                lineHeight: '1.4',
                paddingRight: '60px' // Badge space
              }}>
                {clinic.name}
              </h3>

              {/* Location */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '0.75rem',
                gap: '0.5rem'
              }}>
                <span style={{
                  fontSize: '0.9rem',
                  color: '#718096'
                }}>📍</span>
                <span style={{
                  color: '#4a5568',
                  fontSize: '0.9rem'
                }}>
                  {clinic.prefecture} {clinic.area}
                </span>
              </div>

              {/* Rating */}
              {clinic.star !== null ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  gap: '0.5rem'
                }}>
                  <span style={{
                    fontSize: '0.9rem',
                    color: '#718096'
                  }}>⭐</span>
                  <span style={{
                    color: '#f6ad55',
                    fontWeight: '700',
                    fontSize: '1rem'
                  }}>
                    {clinic.star}
                  </span>
                  <span style={{
                    color: '#718096',
                    fontSize: '0.85rem'
                  }}>
                    ({clinic.user_review_count}件)
                  </span>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  gap: '0.5rem'
                }}>
                  <span style={{
                    fontSize: '0.9rem',
                    color: '#718096'
                  }}>⭐</span>
                  <span style={{
                    color: '#a0aec0',
                    fontSize: '0.85rem'
                  }}>
                    レビューなし
                  </span>
                </div>
              )}

              {/* Action Button */}
              <div style={{
                borderTop: '1px solid #f1f5f9',
                paddingTop: '1rem',
                textAlign: 'center'
              }}>
                <button style={{
                  backgroundColor: hoveredCard === clinic.id ? '#667eea' : '#e2e8f0',
                  color: hoveredCard === clinic.id ? 'white' : '#4a5568',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  width: '100%'
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  // TODO: クリニック詳細ページへのリンク
                  alert(`${clinic.name}の詳細を表示（実装予定）`)
                }}
                >
                  詳細を見る
                </button>
              </div>

              {/* ID Info */}
              <div style={{
                position: 'absolute',
                bottom: '8px',
                left: '12px',
                fontSize: '0.7rem',
                color: '#cbd5e0'
              }}>
                ID: {clinic.id}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}