import { createClient } from '@/lib/supabase/server'
import CompanyManager from '@/components/management/CompanyManager'

export default async function CompaniesPage() {
  const supabase = await createClient()

  // Get current logged-in user
  const { data: { user: authUser } } = await supabase.auth.getUser()

  // Fetch current user's data from users table
  const { data: currentUser } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', authUser?.id)
    .single()

  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .order('id', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        {currentUser?.type === 'user' ? '会社管理' : '会社一覧'}
      </h1>
      <CompanyManager
        companies={companies || []}
        currentUserType={currentUser?.type || 'user'}
        currentUserCompanyId={currentUser?.company_id || null}
      />
    </div>
  )
}
