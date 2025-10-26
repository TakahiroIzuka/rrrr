import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import FacilitiesList from '@/components/management/FacilitiesList'

export default async function FacilitiesPage() {
  const supabase = await createClient()

  const [
    { data: services },
    { data: facilities, error }
  ] = await Promise.all([
    supabase.from('services').select('*').order('id'),
    supabase
      .from('facilities')
      .select(`
        *,
        service:services(name),
        prefecture:prefectures(name),
        area:areas(name),
        genre:genres(name),
        detail:facility_details!facility_id(name)
      `)
      .order('id', { ascending: false })
  ])

  if (error) {
    console.error('Error fetching facilities:', error)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">施設一覧</h1>
        <Link
          href="/management/facilities/new"
          className="px-4 py-2 bg-[#2271b1] text-white rounded text-sm hover:bg-[#135e96] transition-colors font-medium"
        >
          新規追加
        </Link>
      </div>

      <FacilitiesList
        services={services || []}
        facilities={facilities || []}
      />
    </div>
  )
}
