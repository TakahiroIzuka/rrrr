'use client'

export default function Header() {
  return (
    <header style={{
      backgroundColor: 'white',
      color: '#333',
      padding: '1rem 2rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      position: 'relative',
      zIndex: 1000,
      borderBottom: '1px solid #e5e7eb'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 'bold',
            fontFamily: "'Kosugi Maru', sans-serif",
            color: '#2d3748'
          }}>
            🏥 メディカルクチコミランキング
          </h1>
        </div>

        <nav style={{
          display: 'flex',
          gap: '2rem',
          alignItems: 'center'
        }}>
          <a href="/" style={{
            color: '#4a5568',
            textDecoration: 'none',
            fontSize: '0.9rem',
            transition: 'color 0.2s',
            fontWeight: '500'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#2d3748'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#4a5568'}
          >
            ホーム
          </a>
          <a href="/clinics" style={{
            color: '#4a5568',
            textDecoration: 'none',
            fontSize: '0.9rem',
            transition: 'color 0.2s',
            fontWeight: '500'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#2d3748'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#4a5568'}
          >
            クリニック一覧
          </a>
        </nav>
      </div>
    </header>
  )
}