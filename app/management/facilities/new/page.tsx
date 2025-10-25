import { createClient } from '@/lib/supabase/server'
import FacilityForm from '@/components/management/FacilityForm'

export default async function NewFacilityPage() {
  const supabase = await createClient()

  // Fetch master data
  const [
    { data: services },
    { data: genres },
    { data: prefectures },
    { data: areas },
    { data: companies }
  ] = await Promise.all([
    supabase.from('services').select('*').order('id'),
    supabase.from('genres').select('*').order('id'),
    supabase.from('prefectures').select('*').order('id'),
    supabase.from('areas').select('*').order('id'),
    supabase.from('companies').select('*').order('id')
  ])

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">施設を追加</h1>
      <FacilityForm
        services={services || []}
        genres={genres || []}
        prefectures={prefectures || []}
        areas={areas || []}
        companies={companies || []}
      />
    </div>
  )
}
