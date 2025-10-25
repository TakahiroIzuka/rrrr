'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminHeader() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <header className="bg-white border-b border-gray-200 h-14 flex items-center justify-end px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={handleLogout}
          className="px-4 py-1.5 text-sm text-gray-700 hover:text-gray-900 transition-colors"
        >
          ログアウト
        </button>
      </div>
    </header>
  )
}
