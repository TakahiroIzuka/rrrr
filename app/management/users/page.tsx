import { createClient } from '@/lib/supabase/server'
import UserManager from '@/components/management/UserManager'

export default async function UsersPage() {
  const supabase = await createClient()

  // Get current logged-in user
  const { data: { user: authUser } } = await supabase.auth.getUser()

  // Fetch current user's data from users table
  const { data: currentUser } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', authUser?.id)
    .single()

  // Fetch all users and companies
  const [
    { data: users },
    { data: companies }
  ] = await Promise.all([
    supabase.from('users').select('*').order('id'),
    supabase.from('companies').select('*').order('name')
  ])

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">ユーザー一覧</h1>
      <UserManager
        users={users || []}
        companies={companies || []}
        currentUserType={currentUser?.type || 'user'}
        currentUserCompanyId={currentUser?.company_id || null}
      />
    </div>
  )
}
