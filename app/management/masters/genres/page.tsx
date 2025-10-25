import { createClient } from '@/lib/supabase/server'
import MasterManager from '@/components/management/MasterManager'

export default async function GenresPage() {
  const supabase = await createClient()

  // Fetch master data
  const [
    { data: services },
    { data: genres }
  ] = await Promise.all([
    supabase.from('services').select('*').order('id'),
    supabase.from('genres').select('*').order('service_id, id')
  ])

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">マスタ管理 - ジャンル</h1>
      <MasterManager
        masterType="genres"
        services={services || []}
        genres={genres || []}
        prefectures={[]}
        areas={[]}
      />
    </div>
  )
}
