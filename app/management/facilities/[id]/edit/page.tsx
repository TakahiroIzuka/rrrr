import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import FacilityForm from '@/components/management/FacilityForm'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditFacilityPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Get current logged-in user
  const { data: { user: authUser } } = await supabase.auth.getUser()

  // Fetch current user's data from users table
  const { data: currentUser } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', authUser?.id)
    .single()

  // Fetch facility data
  const { data: facility, error } = await supabase
    .from('facilities')
    .select(`
      *,
      detail:facility_details!facility_id(*)
    `)
    .eq('id', id)
    .single()

  if (error || !facility) {
    notFound()
  }

  // Fetch master data
  const [
    { data: services },
    { data: genres },
    { data: prefectures },
    { data: areas },
    { data: companies }
  ] = await Promise.all([
    supabase.from('services').select('*').order('id'),
    supabase.from('genres').select('*, service_id').order('id'),
    supabase.from('prefectures').select('*').order('id'),
    supabase.from('areas').select('*, prefecture_id').order('id'),
    supabase.from('companies').select('*').order('id')
  ])

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">施設を編集</h1>
      <FacilityForm
        services={services || []}
        genres={genres || []}
        prefectures={prefectures || []}
        areas={areas || []}
        companies={companies || []}
        initialData={facility}
        currentUserType={currentUser?.type || 'user'}
      />
    </div>
  )
}
