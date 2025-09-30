'use client'

import { useState } from 'react'

interface Clinic {
  id: number
  name: string
  star: number | null
  user_review_count: number
  geo: any
  prefecture: string
  area: string
}

interface ClinicsClientProps {
  clinics: Clinic[]
}

export default function ClinicsClient({ clinics }: ClinicsClientProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  return (
    <div style={{
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{
        marginBottom: '30px',
        color: '#111827',
        fontSize: '32px',
        fontWeight: 'bold'
      }}>
        クリニック一覧
      </h1>

      <div style={{
        backgroundColor: '#f9fafb',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #e5e7eb'
      }}>
        <p style={{ margin: 0, color: '#6b7280' }}>
          登録件数1: <strong style={{ color: '#111827' }}>{clinics.length}</strong>件
        </p>
      </div>

      <div style={{
        display: 'grid',
        gap: '20px',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))'
      }}>
        {clinics.map((clinic: Clinic) => (
          <div
            key={clinic.id}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: hoveredCard === clinic.id
                ? '0 4px 12px rgba(0, 0, 0, 0.15)'
                : '0 1px 3px rgba(0, 0, 0, 0.1)',
              transform: hoveredCard === clinic.id
                ? 'translateY(-2px)'
                : 'translateY(0px)',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={() => setHoveredCard(clinic.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <h2 style={{
              margin: '0 0 16px 0',
              color: '#111827',
              fontSize: '20px',
              fontWeight: '600'
            }}>
              {clinic.name}
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '8px',
                gap: '8px'
              }}>
                <span style={{
                  fontSize: '16px',
                  marginTop: '2px',
                  color: '#6b7280'
                }}>📍</span>
                <span style={{
                  color: '#4b5563',
                  lineHeight: '1.5'
                }}>
                  {clinic.prefecture} {clinic.area}
                </span>
              </div>

              {clinic.star !== null && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '8px',
                  gap: '8px'
                }}>
                  <span style={{
                    fontSize: '16px',
                    color: '#6b7280'
                  }}>⭐</span>
                  <span style={{
                    color: '#f59e0b',
                    fontWeight: '600'
                  }}>
                    {clinic.star}
                  </span>
                  <span style={{
                    color: '#6b7280',
                    fontSize: '14px'
                  }}>
                    ({clinic.user_review_count}件のレビュー)
                  </span>
                </div>
              )}

              {clinic.star === null && clinic.user_review_count === 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '8px',
                  gap: '8px'
                }}>
                  <span style={{
                    fontSize: '16px',
                    color: '#6b7280'
                  }}>⭐</span>
                  <span style={{
                    color: '#9ca3af',
                    fontSize: '14px'
                  }}>
                    レビューなし
                  </span>
                </div>
              )}
            </div>

            <div style={{
              paddingTop: '16px',
              borderTop: '1px solid #f3f4f6',
              fontSize: '12px',
              color: '#9ca3af'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>ID: {clinic.id}</span>
                <span>
                  {clinic.user_review_count > 0 ? (
                    `${clinic.user_review_count}件のレビュー`
                  ) : (
                    'レビューなし'
                  )}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}