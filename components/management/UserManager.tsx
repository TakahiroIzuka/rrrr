'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { hashPassword } from '@/lib/utils/password'

interface User {
  id: number
  email: string
  created_at: string
  updated_at: string
}

interface UserManagerProps {
  users: User[]
}

export default function UserManager({ users: initialUsers }: UserManagerProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editEmail, setEditEmail] = useState('')
  const [editPassword, setEditPassword] = useState('')

  // Add state
  const [isAdding, setIsAdding] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const handleEdit = (user: User) => {
    setEditingId(user.id)
    setEditEmail(user.email)
    setEditPassword('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditEmail('')
    setEditPassword('')
  }

  const handleSaveEdit = async () => {
    if (!editEmail.trim()) {
      alert('メールアドレスを入力してください')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(editEmail)) {
      alert('有効なメールアドレスを入力してください')
      return
    }

    setIsUpdating(true)

    try {
      const supabase = createClient()
      const updateData: { email: string; password?: string; updated_at: string } = {
        email: editEmail.trim(),
        updated_at: new Date().toISOString()
      }

      // Only update password if provided
      if (editPassword.trim()) {
        updateData.password = await hashPassword(editPassword.trim())
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', editingId)

      if (error) throw error

      alert('更新しました')
      setEditingId(null)
      setEditEmail('')
      setEditPassword('')
      router.refresh()
    } catch (error: any) {
      console.error('Error updating:', error)
      if (error.code === '23505') {
        alert('このメールアドレスは既に使用されています')
      } else {
        alert('更新に失敗しました')
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (id: number, email: string) => {
    if (!confirm(`「${email}」を削除してもよろしいですか？`)) {
      return
    }

    setIsUpdating(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)

      if (error) throw error

      alert('削除しました')
      router.refresh()
    } catch (error) {
      console.error('Error deleting:', error)
      alert('削除に失敗しました')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAdd = async () => {
    if (!newEmail.trim()) {
      alert('メールアドレスを入力してください')
      return
    }

    if (!newPassword.trim()) {
      alert('パスワードを入力してください')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      alert('有効なメールアドレスを入力してください')
      return
    }

    // Validate password length
    if (newPassword.length < 6) {
      alert('パスワードは6文字以上で入力してください')
      return
    }

    setIsUpdating(true)

    try {
      const supabase = createClient()

      const hashedPassword = await hashPassword(newPassword.trim())

      const { error } = await supabase
        .from('users')
        .insert({
          email: newEmail.trim(),
          password: hashedPassword
        })

      if (error) throw error

      alert('追加しました')
      setIsAdding(false)
      setNewEmail('')
      setNewPassword('')
      router.refresh()
    } catch (error: any) {
      console.error('Error adding:', error)
      if (error.code === '23505') {
        alert('このメールアドレスは既に使用されています')
      } else {
        alert('追加に失敗しました')
      }
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            ユーザー一覧 ({initialUsers.length}件)
          </h2>
          <button
            onClick={() => setIsAdding(true)}
            disabled={isAdding}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 font-medium"
          >
            新規追加
          </button>
        </div>

        {/* Add Form */}
        {isAdding && (
          <div className="mb-4 p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              ユーザーを追加
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  パスワード <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="6文字以上"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleAdd}
                disabled={isUpdating}
                className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
              >
                追加
              </button>
              <button
                onClick={() => {
                  setIsAdding(false)
                  setNewEmail('')
                  setNewPassword('')
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  メールアドレス
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  パスワード
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  作成日時
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {initialUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  {editingId === user.id ? (
                    <>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {user.id}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          placeholder="user@example.com"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="password"
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          placeholder="変更する場合のみ入力"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleString('ja-JP')}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={handleSaveEdit}
                          disabled={isUpdating}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium disabled:opacity-50"
                        >
                          保存
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                        >
                          キャンセル
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {user.id}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        ••••••••
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleString('ja-JP')}
                      </td>
                      <td className="px-4 py-3 text-right space-x-3">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.email)}
                          disabled={isUpdating}
                          className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50"
                        >
                          削除
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {initialUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            ユーザーが登録されていません
          </div>
        )}
      </div>
    </div>
  )
}
