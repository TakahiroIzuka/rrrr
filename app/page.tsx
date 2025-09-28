import { createClient } from '@/utils/supabase/server'
import ClinicsListPanel from '@/components/ClinicsListPanel'
import MapPanel from '@/components/MapPanel'

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

export default async function HomePage() {
  const supabase = await createClient()
  const { data: clinics, error } = await supabase
    .from('clinics')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        color: '#dc2626',
        fontSize: '16px',
        textAlign: 'center'
      }}>
        <div>
          <h1 style={{ marginBottom: '20px' }}>エラーが発生しました</h1>
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            padding: '16px',
            color: '#991b1b'
          }}>
            <strong>データベースエラー:</strong> {error.message}
          </div>
        </div>
      </div>
    )
  }

  const clinicsData = clinics || []

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden'
    }}>
      <div style={{
        width: '25%',
        minWidth: '300px'
      }}>
        <ClinicsListPanel clinics={clinicsData} />
      </div>
      <div style={{
        width: '75%',
        flex: '1'
      }}>
        <MapPanel clinics={clinicsData} />
      </div>
    </div>
  )
}