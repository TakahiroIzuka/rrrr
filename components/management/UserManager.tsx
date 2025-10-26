'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface User {
  id: number
  email: string
  type: 'admin' | 'user'
  company_id: number | null
  created_at: string
  updated_at: string
}

interface Company {
  id: number
  name: string
  code: string
}

interface UserManagerProps {
  users: User[]
  companies: Company[]
  currentUserType: 'admin' | 'user'
  currentUserCompanyId: number | null
}

export default function UserManager({ users: initialUsers, companies, currentUserType, currentUserCompanyId }: UserManagerProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editEmail, setEditEmail] = useState('')
  const [editType, setEditType] = useState<'admin' | 'user'>('user')
  const [editCompanyId, setEditCompanyId] = useState<number | null>(null)
  const [editCompanyCodeInput, setEditCompanyCodeInput] = useState('')
  const [editCompanyCodeFocused, setEditCompanyCodeFocused] = useState(false)

  // Add state
  const [isAdding, setIsAdding] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newType, setNewType] = useState<'admin' | 'user'>('user')
  const [newCompanyId, setNewCompanyId] = useState<number | null>(null)
  const [newCompanyCodeInput, setNewCompanyCodeInput] = useState('')
  const [newCompanyCodeFocused, setNewCompanyCodeFocused] = useState(false)
  const [newPassword, setNewPassword] = useState('')

  // Sort state
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)

  // Filter state
  const [filterCompanyId, setFilterCompanyId] = useState<number | null>(null)

  // Refs for dropdown click outside detection
  const newCompanyDropdownRef = useRef<HTMLDivElement>(null)
  const editCompanyDropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (newCompanyDropdownRef.current && !newCompanyDropdownRef.current.contains(event.target as Node)) {
        setNewCompanyCodeFocused(false)
      }
      if (editCompanyDropdownRef.current && !editCompanyDropdownRef.current.contains(event.target as Node)) {
        setEditCompanyCodeFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Filter and sort users
  const filteredAndSortedUsers = [...initialUsers]
    .filter((user) => {
      // If current user is 'user' type, only show users with same company_id
      if (currentUserType === 'user') {
        return user.company_id === currentUserCompanyId
      }

      // Filter by company code (admin only)
      if (filterCompanyId === null) return true
      return user.company_id === filterCompanyId
    })
    .sort((a, b) => {
      // Sort by company code
      if (sortOrder === null) return 0

      const aCode = a.company_id ? companies.find(c => c.id === a.company_id)?.code || '' : ''
      const bCode = b.company_id ? companies.find(c => c.id === b.company_id)?.code || '' : ''

      if (sortOrder === 'asc') {
        return aCode.localeCompare(bCode)
      } else {
        return bCode.localeCompare(aCode)
      }
    })

  const handleSortByCompanyCode = () => {
    if (sortOrder === null) {
      setSortOrder('asc')
    } else if (sortOrder === 'asc') {
      setSortOrder('desc')
    } else {
      setSortOrder(null)
    }
  }

  const handleEdit = (user: User) => {
    setEditingId(user.id)
    setEditEmail(user.email)
    setEditType(user.type)
    setEditCompanyId(user.company_id)
    setEditCompanyCodeInput('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditEmail('')
    setEditType('user')
    setEditCompanyId(null)
    setEditCompanyCodeInput('')
    setEditCompanyCodeFocused(false)
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

    // Validate type and company_id relationship
    if (editType === 'admin' && editCompanyId !== null) {
      alert('管理者ユーザーは会社を選択できません')
      return
    }

    if (editType === 'user' && editCompanyId === null) {
      alert('一般ユーザーは会社を選択する必要があります')
      return
    }

    setIsUpdating(true)

    try {
      const supabase = createClient()
      const updateData = {
        email: editEmail.trim(),
        type: editType,
        company_id: editCompanyId,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', editingId)

      if (error) throw error

      alert('更新しました')
      setEditingId(null)
      setEditEmail('')
      setEditType('user')
      setEditCompanyId(null)
      setEditCompanyCodeInput('')
      setEditCompanyCodeFocused(false)
      router.refresh()
    } catch (error) {
      console.error('Error updating:', error)
      if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
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
    // Check if current user is allowed to add users
    if (currentUserType === 'user') {
      alert('権限がありません')
      return
    }

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

    // Validate type and company_id relationship
    if (newType === 'admin' && newCompanyId !== null) {
      alert('管理者ユーザーは会社を選択できません')
      return
    }

    if (newType === 'user' && newCompanyId === null) {
      alert('一般ユーザーは会社を選択する必要があります')
      return
    }

    setIsUpdating(true)

    try {
      const supabase = createClient()

      // Create Supabase Auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newEmail.trim(),
        password: newPassword.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('ユーザーの作成に失敗しました')

      // Insert into users table
      const { error } = await supabase
        .from('users')
        .insert({
          email: newEmail.trim(),
          type: newType,
          company_id: newCompanyId,
          auth_user_id: authData.user.id
        })

      if (error) throw error

      alert('追加しました')
      setIsAdding(false)
      setNewEmail('')
      setNewType('user')
      setNewCompanyId(null)
      setNewCompanyCodeInput('')
      setNewCompanyCodeFocused(false)
      setNewPassword('')
      router.refresh()
    } catch (error) {
      console.error('Error adding:', error)
      if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
        alert('このメールアドレスは既に使用されています')
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            ユーザー一覧 ({filteredAndSortedUsers.length}件 / 全{initialUsers.length}件)
          </h2>
          {currentUserType === 'admin' && (
            <button
              onClick={() => setIsAdding(true)}
              disabled={isAdding}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 font-medium"
            >
              新規追加
            </button>
          )}
        </div>

        {/* Filter */}
        {currentUserType === 'admin' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              会社コードで絞り込み
            </label>
            <select
              value={filterCompanyId || ''}
              onChange={(e) => setFilterCompanyId(e.target.value ? Number(e.target.value) : null)}
              className="w-full md:w-64 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全て</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.code} - {company.name}
                </option>
              ))}
            </select>
          </div>
        )}

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
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  ユーザータイプ <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4 items-center h-[38px]">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="admin"
                      checked={newType === 'admin'}
                      onChange={(e) => {
                        setNewType(e.target.value as 'admin' | 'user')
                        setNewCompanyId(null)
                        setNewCompanyCodeInput('')
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">管理者</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="user"
                      checked={newType === 'user'}
                      onChange={(e) => setNewType(e.target.value as 'admin' | 'user')}
                      className="mr-2"
                    />
                    <span className="text-sm">一般ユーザー</span>
                  </label>
                </div>
              </div>
              {newType === 'user' && (
                <div className="relative" ref={newCompanyDropdownRef}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    会社コード <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewCompanyCodeFocused(!newCompanyCodeFocused)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-left flex items-center justify-between"
                  >
                    <span className={newCompanyId ? 'text-gray-900' : 'text-gray-500'}>
                      {newCompanyId
                        ? companies.find(c => c.id === newCompanyId)?.code || '選択してください'
                        : '選択してください'
                      }
                    </span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {newCompanyCodeFocused && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg">
                      <div className="p-2 border-b border-gray-200">
                        <input
                          type="text"
                          value={newCompanyCodeInput}
                          onChange={(e) => setNewCompanyCodeInput(e.target.value)}
                          placeholder="会社コードで検索..."
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {companies
                          .filter((company) =>
                            company.code.toLowerCase().includes(newCompanyCodeInput.toLowerCase())
                          )
                          .map((company) => (
                            <div
                              key={company.id}
                              onClick={() => {
                                setNewCompanyId(company.id)
                                setNewCompanyCodeInput('')
                                setNewCompanyCodeFocused(false)
                              }}
                              className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                            >
                              {company.code} - {company.name}
                            </div>
                          ))}
                        {companies.filter((company) =>
                          company.code.toLowerCase().includes(newCompanyCodeInput.toLowerCase())
                        ).length === 0 && (
                          <div className="px-3 py-2 text-sm text-gray-500">
                            該当する会社が見つかりません
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
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
                  setNewType('user')
                  setNewCompanyId(null)
                  setNewCompanyCodeInput('')
                  setNewCompanyCodeFocused(false)
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
                  編集
                </th>
                {currentUserType === 'admin' && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ID
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  メールアドレス
                </th>
                {currentUserType === 'admin' && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    タイプ
                  </th>
                )}
                {currentUserType === 'admin' && (
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 select-none"
                    onClick={handleSortByCompanyCode}
                  >
                    <div className="flex items-center gap-1">
                      <span>会社コード</span>
                      {sortOrder === 'asc' && <span>▲</span>}
                      {sortOrder === 'desc' && <span>▼</span>}
                    </div>
                  </th>
                )}
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSortedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  {editingId === user.id ? (
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
                          {user.id}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          placeholder="user@example.com"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      {currentUserType === 'admin' && (
                        <td className="px-4 py-3">
                          <select
                            value={editType}
                            onChange={(e) => {
                              const newTypeValue = e.target.value as 'admin' | 'user'
                              setEditType(newTypeValue)
                              if (newTypeValue === 'admin') {
                                setEditCompanyId(null)
                                setEditCompanyCodeInput('')
                              }
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="admin">管理者</option>
                            <option value="user">一般ユーザー</option>
                          </select>
                        </td>
                      )}
                      {currentUserType === 'admin' && (
                        <td className="px-4 py-3">
                          {editType === 'user' ? (
                            <div className="relative" ref={editCompanyDropdownRef}>
                            <button
                              type="button"
                              onClick={() => setEditCompanyCodeFocused(!editCompanyCodeFocused)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-left flex items-center justify-between"
                            >
                              <span className={editCompanyId ? 'text-gray-900' : 'text-gray-500'}>
                                {editCompanyId
                                  ? companies.find(c => c.id === editCompanyId)?.code || '選択してください'
                                  : '選択してください'
                                }
                              </span>
                              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            {editCompanyCodeFocused && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg left-0">
                                <div className="p-2 border-b border-gray-200">
                                  <input
                                    type="text"
                                    value={editCompanyCodeInput}
                                    onChange={(e) => setEditCompanyCodeInput(e.target.value)}
                                    placeholder="会社コードで検索..."
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                  />
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                  {companies
                                    .filter((company) =>
                                      company.code.toLowerCase().includes(editCompanyCodeInput.toLowerCase())
                                    )
                                    .map((company) => (
                                      <div
                                        key={company.id}
                                        onClick={() => {
                                          setEditCompanyId(company.id)
                                          setEditCompanyCodeInput('')
                                          setEditCompanyCodeFocused(false)
                                        }}
                                        className="px-2 py-1 text-sm hover:bg-blue-50 cursor-pointer"
                                      >
                                        {company.code} - {company.name}
                                      </div>
                                    ))}
                                  {companies.filter((company) =>
                                    company.code.toLowerCase().includes(editCompanyCodeInput.toLowerCase())
                                  ).length === 0 && (
                                    <div className="px-2 py-1 text-sm text-gray-500">
                                      該当する会社が見つかりません
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                          )}
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
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          編集
                        </button>
                      </td>
                      {currentUserType === 'admin' && (
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {user.id}
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {user.email}
                      </td>
                      {currentUserType === 'admin' && (
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            user.type === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {user.type === 'admin' ? '管理者' : '一般ユーザー'}
                          </span>
                        </td>
                      )}
                      {currentUserType === 'admin' && (
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {user.company_id ? companies.find(c => c.id === user.company_id)?.code || '-' : '-'}
                        </td>
                      )}
                      <td className="px-4 py-3 text-right">
                        {currentUserType === 'admin' && (
                          <button
                            onClick={() => handleDelete(user.id, user.email)}
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

        {filteredAndSortedUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {filterCompanyId !== null ? '該当するユーザーが見つかりません' : 'ユーザーが登録されていません'}
          </div>
        )}
      </div>
    </div>
  )
}
