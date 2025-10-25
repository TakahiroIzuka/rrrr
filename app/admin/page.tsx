import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch statistics
  const [
    { count: facilitiesCount },
    { count: imagesCount },
    { count: genresCount },
    { count: usersCount }
  ] = await Promise.all([
    supabase.from('facilities').select('*', { count: 'exact', head: true }),
    supabase.from('facility_images').select('*', { count: 'exact', head: true }),
    supabase.from('genres').select('*', { count: 'exact', head: true }),
    supabase.auth.admin.listUsers().then(res => ({ count: res.data.users.length }))
  ])

  const stats = [
    {
      label: '施設数',
      value: facilitiesCount || 0,
    },
    {
      label: '画像数',
      value: imagesCount || 0,
    },
    {
      label: 'ジャンル数',
      value: genresCount || 0,
    },
    {
      label: 'ユーザー数',
      value: usersCount || 0,
    }
  ]

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">ダッシュボード</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded shadow border border-gray-200 p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs uppercase tracking-wide mb-2">{stat.label}</p>
                <p className="text-3xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded shadow border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">クイックアクション</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <a
            href="/admin/facilities/new"
            className="px-4 py-2.5 bg-[#2271b1] text-white rounded text-sm hover:bg-[#135e96] transition-colors text-center font-medium"
          >
            施設を追加
          </a>
          <a
            href="/admin/facilities"
            className="px-4 py-2.5 bg-[#2271b1] text-white rounded text-sm hover:bg-[#135e96] transition-colors text-center font-medium"
          >
            施設一覧
          </a>
          <a
            href="/admin/images"
            className="px-4 py-2.5 bg-[#2271b1] text-white rounded text-sm hover:bg-[#135e96] transition-colors text-center font-medium"
          >
            画像管理
          </a>
          <a
            href="/admin/masters"
            className="px-4 py-2.5 bg-[#2271b1] text-white rounded text-sm hover:bg-[#135e96] transition-colors text-center font-medium"
          >
            マスタ管理
          </a>
        </div>
      </div>
    </div>
  )
}
