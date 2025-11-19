import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import FacilitiesList from '@/components/management/FacilitiesList'

interface FacilitiesPageProps {
  searchParams: Promise<{ service?: string }>
}

export default async function FacilitiesPage({ searchParams }: FacilitiesPageProps) {
  const { service } = await searchParams
  const supabase = await createClient()

  // Get current logged-in user
  const { data: { user: authUser } } = await supabase.auth.getUser()

  // Fetch current user's data from users table
  const { data: currentUser } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', authUser?.id)
    .single()

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
        {currentUser?.type === 'admin' && (
          <Link
            href={`/management/facilities/new${service ? `?service=${service}` : ''}`}
            className="px-4 py-2 bg-[#2271b1] text-white rounded text-sm hover:bg-[#135e96] transition-colors font-medium"
          >
            新規追加
          </Link>
        )}
      </div>

      <FacilitiesList
        services={services || []}
        facilities={facilities || []}
        currentUserType={currentUser?.type || 'user'}
        currentUserCompanyId={currentUser?.company_id || null}
      />
    </div>
  )
}
