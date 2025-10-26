import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MasterManager from '@/components/management/MasterManager'

export default async function RegionsPage() {
  const supabase = await createClient()

  // Get current logged-in user
  const { data: { user: authUser } } = await supabase.auth.getUser()

  // Fetch current user's data from users table
  const { data: currentUser } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', authUser?.id)
    .single()

  // Only allow admin users to access this page
  if (currentUser?.type !== 'admin') {
    redirect('/management/companies')
  }

  // Fetch master data
  const [
    { data: prefectures },
    { data: areas }
  ] = await Promise.all([
    supabase.from('prefectures').select('*').order('id'),
    supabase.from('areas').select('*').order('id')
  ])

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">マスタ管理 - 都道府県・地域</h1>
      <MasterManager
        masterType="regions"
        services={[]}
        genres={[]}
        prefectures={prefectures || []}
        areas={areas || []}
      />
    </div>
  )
}
