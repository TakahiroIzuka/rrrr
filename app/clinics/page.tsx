import { createClient } from '@/utils/supabase/server'
import ClinicsClient from './ClinicsClient'

interface Clinic {
  id: number
  name: string
  star: number | null
  user_review_count: number
  geo: any
  prefecture: string
  area: string
}

export default async function ClinicsPage() {
  const supabase = await createClient()
  const { data: clinics, error } = await supabase
    .from('clinics')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    return (
      <div style={{
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <h1 style={{ color: '#dc2626', marginBottom: '20px' }}>エラーが発生しました</h1>
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
    )
  }

  if (!clinics || clinics.length === 0) {
    return (
      <div style={{
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        textAlign: 'center'
      }}>
        <h1 style={{ marginBottom: '20px' }}>クリニック一覧</h1>
        <div style={{
          backgroundColor: '#f3f4f6',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          padding: '40px',
          color: '#6b7280'
        }}>
          <p style={{ fontSize: '18px', margin: 0 }}>登録されているクリニックはありません。</p>
        </div>
      </div>
    )
  }

  return <ClinicsClient clinics={clinics} />
}