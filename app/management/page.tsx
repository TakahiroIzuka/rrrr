import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GiftCodesList from '@/components/management/GiftCodesList'

export default async function ManagementPage() {
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

  // Fetch gift code amounts and gift codes
  const [
    { data: giftCodeAmounts },
    { data: giftCodes }
  ] = await Promise.all([
    supabase
      .from('gift_code_amounts')
      .select('id, amount')
      .order('amount', { ascending: true }),
    supabase
      .from('gift_codes')
      .select(`
        *,
        gift_code_amounts (
          id,
          amount
        )
      `)
      .order('created_at', { ascending: false })
  ])

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">ダッシュボード</h1>
      <GiftCodesList
        giftCodes={giftCodes || []}
        giftCodeAmounts={giftCodeAmounts || []}
      />
    </div>
  )
}
