import { createClient } from '@/lib/supabase/server'
import UserManager from '@/components/management/UserManager'

export default async function UsersPage() {
  const supabase = await createClient()

  // Fetch all users from custom users table
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('id')

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">ユーザー一覧</h1>
      <UserManager users={users || []} />
    </div>
  )
}
