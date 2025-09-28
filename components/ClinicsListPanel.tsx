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

interface ClinicsListPanelProps {
  clinics: Clinic[]
}

export default function ClinicsListPanel({ clinics }: ClinicsListPanelProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  return (
    <div style={{
      height: '100vh',
      overflow: 'auto',
      padding: '20px',
      backgroundColor: '#f9fafb',
      borderRight: '1px solid #e5e7eb'
    }}>
      <h2 style={{
        margin: '0 0 20px 0',
        color: '#111827',
        fontSize: '24px',
        fontWeight: 'bold'
      }}>
        クリニック一覧
      </h2>

      <div style={{
        backgroundColor: '#ffffff',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #e5e7eb'
      }}>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
          登録件数: <strong style={{ color: '#111827' }}>{clinics.length}</strong>件
        </p>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {clinics.map((clinic: Clinic) => (
          <div
            key={clinic.id}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              boxShadow: hoveredCard === clinic.id
                ? '0 4px 12px rgba(0, 0, 0, 0.15)'
                : '0 1px 3px rgba(0, 0, 0, 0.1)',
              transform: hoveredCard === clinic.id
                ? 'translateY(-1px)'
                : 'translateY(0px)',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={() => setHoveredCard(clinic.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <h3 style={{
              margin: '0 0 12px 0',
              color: '#111827',
              fontSize: '16px',
              fontWeight: '600',
              lineHeight: '1.4'
            }}>
              {clinic.name}
            </h3>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px',
              gap: '6px'
            }}>
              <span style={{
                fontSize: '14px',
                color: '#6b7280'
              }}>📍</span>
              <span style={{
                color: '#4b5563',
                fontSize: '14px'
              }}>
                {clinic.prefecture} {clinic.area}
              </span>
            </div>

            {clinic.star !== null && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{
                  fontSize: '14px',
                  color: '#6b7280'
                }}>⭐</span>
                <span style={{
                  color: '#f59e0b',
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  {clinic.star}
                </span>
                <span style={{
                  color: '#6b7280',
                  fontSize: '12px'
                }}>
                  ({clinic.user_review_count}件)
                </span>
              </div>
            )}

            {clinic.star === null && clinic.user_review_count === 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{
                  fontSize: '14px',
                  color: '#6b7280'
                }}>⭐</span>
                <span style={{
                  color: '#9ca3af',
                  fontSize: '12px'
                }}>
                  レビューなし
                </span>
              </div>
            )}

            <div style={{
              paddingTop: '12px',
              marginTop: '12px',
              borderTop: '1px solid #f3f4f6',
              fontSize: '11px',
              color: '#9ca3af'
            }}>
              ID: {clinic.id}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}