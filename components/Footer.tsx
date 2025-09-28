'use client'

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#eae3db',
      color: '#4a5568',
      padding: '2rem 2rem 1rem',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        {/* Request Button */}
        <div style={{
          marginBottom: '2rem'
        }}>
          <button style={{
            backgroundColor: '#667eea',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            fontFamily: "'Kosugi Maru', sans-serif"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#5a67d8'
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#667eea'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
          }}
          onClick={() => {
            // TODO: 掲載リクエストページへのリンクまたはフォーム表示
            alert('掲載リクエストフォームを実装予定です')
          }}
          >
            クリニック・施設の掲載リクエストはこちら
          </button>
        </div>

        {/* Copyright */}
        <div style={{
          borderTop: '1px solid #d1d5db',
          paddingTop: '1rem'
        }}>
          <p style={{
            margin: 0,
            fontSize: '0.9rem',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            Copyright © Medical Review Ranking All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}