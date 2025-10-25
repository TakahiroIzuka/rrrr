import { createClient } from '@/lib/supabase/server'
import MasterManager from '@/components/admin/MasterManager'

export default async function MastersPage() {
  const supabase = await createClient()

  // Fetch all master data
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
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">マスタ管理</h1>
      <MasterManager
        services={services || []}
        genres={genres || []}
        prefectures={prefectures || []}
        areas={areas || []}
        companies={companies || []}
      />
    </div>
  )
}
