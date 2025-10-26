'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Company {
  id: number
  name: string
  code: string
  created_at: string
  updated_at: string
}

interface CompanyManagerProps {
  companies: Company[]
  currentUserType: 'admin' | 'user'
  currentUserCompanyId: number | null
}

export default function CompanyManager({ companies: initialCompanies, currentUserType, currentUserCompanyId }: CompanyManagerProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editCode, setEditCode] = useState('')

  // Add state
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCode, setNewCode] = useState('')

  // Filter companies based on user type
  const filteredCompanies = currentUserType === 'user'
    ? initialCompanies.filter((company) => company.id === currentUserCompanyId)
    : initialCompanies

  const handleEdit = (company: Company) => {
    setEditingId(company.id)
    setEditName(company.name)
    setEditCode(company.code)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setEditCode('')
  }

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      alert('会社名を入力してください')
      return
    }

    if (!editCode.trim()) {
      alert('コードを入力してください')
      return
    }

    setIsUpdating(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('companies')
        .update({ name: editName.trim(), code: editCode.trim() })
        .eq('id', editingId)

      if (error) throw error

      alert('更新しました')
      setEditingId(null)
      setEditName('')
      setEditCode('')
      router.refresh()
    } catch (error) {
      console.error('Error updating:', error)
      if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
        alert('このコードは既に使用されています')
      } else {
        alert('更新に失敗しました')
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`「${name}」を削除してもよろしいですか？`)) {
      return
    }

    setIsUpdating(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('companies')
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
    // Check if current user is allowed to add companies
    if (currentUserType === 'user') {
      alert('権限がありません')
      return
    }

    if (!newName.trim()) {
      alert('会社名を入力してください')
      return
    }

    if (!newCode.trim()) {
      alert('コードを入力してください')
      return
    }

    setIsUpdating(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('companies')
        .insert({ name: newName.trim(), code: newCode.trim() })

      if (error) throw error

      alert('追加しました')
      setIsAdding(false)
      setNewName('')
      setNewCode('')
      router.refresh()
    } catch (error) {
      console.error('Error adding:', error)
      if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
        alert('このコードは既に使用されています')
      } else {
        const message = error && typeof error === 'object' && 'message' in error ? String(error.message) : '不明なエラー'
        alert(`追加に失敗しました: ${message}`)
      }
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        {currentUserType === 'admin' && (
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              会社一覧 ({filteredCompanies.length}件)
            </h2>
            <button
              onClick={() => setIsAdding(true)}
              disabled={isAdding}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 font-medium"
            >
              新規追加
            </button>
          </div>
        )}

        {/* Add Form */}
        {isAdding && (
          <div className="mb-4 p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              会社を追加
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  会社名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="会社名を入力"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  コード <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="一意のコードを入力"
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
                  setNewName('')
                  setNewCode('')
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
                  編集
                </th>
                {currentUserType === 'admin' && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ID
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  会社名
                </th>
                {currentUserType === 'admin' && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    コード
                  </th>
                )}
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  {editingId === company.id ? (
                    <>
                      <td className="px-4 py-3 text-left">
                        <button
                          onClick={handleSaveEdit}
                          disabled={isUpdating}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium disabled:opacity-50"
                        >
                          保存
                        </button>
                      </td>
                      {currentUserType === 'admin' && (
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {company.id}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="会社名を入力"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      {currentUserType === 'admin' && (
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={editCode}
                            onChange={(e) => setEditCode(e.target.value)}
                            placeholder="コードを入力"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                      )}
                      <td className="px-4 py-3 text-right">
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
                      <td className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleEdit(company)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          編集
                        </button>
                      </td>
                      {currentUserType === 'admin' && (
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {company.id}
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {company.name}
                      </td>
                      {currentUserType === 'admin' && (
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {company.code}
                        </td>
                      )}
                      <td className="px-4 py-3 text-right">
                        {currentUserType === 'admin' && (
                          <button
                            onClick={() => handleDelete(company.id, company.name)}
                            disabled={isUpdating}
                            className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50"
                          >
                            削除
                          </button>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCompanies.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            会社が登録されていません
          </div>
        )}
      </div>
    </div>
  )
}
