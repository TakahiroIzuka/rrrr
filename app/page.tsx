import { createClient } from '@/utils/supabase/server'
import ClinicsListPanel from '@/components/ClinicsListPanel'
import MapPanel from '@/components/MapPanel'
import ClinicsGridSection from '@/components/ClinicsGridSection'

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
      <div className="flex h-screen items-center justify-center bg-gray-100 text-red-600 text-base text-center">
        <div>
          <h1 className="mb-5">エラーが発生しました</h1>
          <div className="bg-red-50 border border-red-300 rounded-lg p-4 text-red-800">
            <strong>データベースエラー:</strong> {error.message}
          </div>
        </div>
      </div>
    )
  }

  const clinicsData = clinics || []

  return (
    <div className="flex flex-col w-full">
      {/* Map Section */}
      <div className="flex h-[calc(60vh-80px)] w-full overflow-hidden">
        <div className="w-1/4 min-w-[300px]">
          <ClinicsListPanel clinics={clinicsData} />
        </div>
        <div className="w-3/4 flex-1">
          <MapPanel clinics={clinicsData} />
        </div>
      </div>

      {/* Clinics Grid Section */}
      <ClinicsGridSection clinics={clinicsData} />
    </div>
  )
}