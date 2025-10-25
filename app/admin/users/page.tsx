import { createClient } from '@/lib/supabase/server'

export default async function UsersPage() {
  const supabase = await createClient()

  // Fetch all users
  const { data, error } = await supabase.auth.admin.listUsers()

  if (error) {
    console.error('Error fetching users:', error)
  }

  const users = data?.users || []

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">ユーザー管理</h1>

      <div className="bg-white rounded shadow border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            登録ユーザー数: <span className="font-semibold text-gray-900">{users.length}</span>
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  メールアドレス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  作成日時
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最終ログイン
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {user.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.created_at ? new Date(user.created_at).toLocaleString('ja-JP') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('ja-JP') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.email_confirmed_at ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        確認済み
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        未確認
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            登録ユーザーがいません
          </div>
        )}
      </div>
    </div>
  )
}
