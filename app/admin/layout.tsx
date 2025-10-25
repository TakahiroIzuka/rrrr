import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // TODO: Add admin role check here
  // For now, any authenticated user can access admin panel
  // You can add role-based access control by checking user metadata or a separate admins table

  return (
    <div className="flex min-h-screen bg-[#f0f0f1]">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <AdminHeader />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
