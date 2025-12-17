import { createClient } from '@/lib/supabase/server'
import ReviewChecksList from '@/components/management/ReviewChecksList'

export default async function ReviewsPage() {
  const supabase = await createClient()

  // Get current logged-in user
  const { data: { user: authUser } } = await supabase.auth.getUser()

  // Fetch current user's data from users table
  const { data: currentUser } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', authUser?.id)
    .single()

  // Fetch services and review_checks with facility info
  const [
    { data: services },
    { data: reviewChecks, error }
  ] = await Promise.all([
    supabase.from('services').select('*').order('id'),
    supabase
      .from('review_checks')
      .select(`
        *,
        facility:facilities(
          id,
          service_id,
          detail:facility_details!facility_id(name)
        ),
        tasks:review_check_tasks(id, status)
      `)
      .order('id', { ascending: false })
  ])

  if (error) {
    console.error('Error fetching review_checks:', error)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">クチコミ管理</h1>
      </div>

      <ReviewChecksList
        services={services || []}
        reviewChecks={reviewChecks || []}
        showNewButton={currentUser?.type === 'admin'}
      />
    </div>
  )
}
