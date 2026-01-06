'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface GiftCodeAmount {
  id: number
  amount: number
  created_at: string
  updated_at: string
}

interface GiftCodeAmountManagerProps {
  giftCodeAmounts: GiftCodeAmount[]
}

export default function GiftCodeAmountManager({ giftCodeAmounts }: GiftCodeAmountManagerProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editAmount, setEditAmount] = useState('')

  // Add state
  const [isAdding, setIsAdding] = useState(false)
  const [newAmount, setNewAmount] = useState('')

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  const handleEdit = (item: GiftCodeAmount) => {
    setEditingId(item.id)
    setEditAmount(String(item.amount))
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditAmount('')
  }

  const handleSaveEdit = async () => {
    const amount = parseInt(editAmount)
    if (!amount || amount <= 0) {
      alert('金額は正の整数で入力してください')
      return
    }

    setIsUpdating(true)

    try {
      const response = await fetch(`/api/gift-code-amounts/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || '更新に失敗しました')
        return
      }

      alert('更新しました')
      setEditingId(null)
      setEditAmount('')
      router.refresh()
    } catch (error) {
      console.error('Error updating:', error)
      alert('更新に失敗しました')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (id: number, amount: number) => {
    if (!confirm(`${formatAmount(amount)} を削除してもよろしいですか？`)) {
      return
    }

    setIsUpdating(true)

    try {
      const response = await fetch(`/api/gift-code-amounts/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || '削除に失敗しました')
        return
      }

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
    const amount = parseInt(newAmount)
    if (!amount || amount <= 0) {
      alert('金額は正の整数で入力してください')
      return
    }

    setIsUpdating(true)

    try {
      const response = await fetch('/api/gift-code-amounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || '追加に失敗しました')
        return
      }

      alert('追加しました')
      setIsAdding(false)
      setNewAmount('')
      router.refresh()
    } catch (error) {
      console.error('Error adding:', error)
      alert('追加に失敗しました')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            ギフトコード額一覧 ({giftCodeAmounts.length}件)
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
              新規追加
            </h3>
            <div className="flex items-center gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  金額 <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">¥</span>
                  <input
                    type="number"
                    min="1"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="例: 500"
                    className="w-32 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-5">
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
                    setNewAmount('')
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                >
                  キャンセル
                </button>
              </div>
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  金額
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  登録日
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  更新日
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  削除
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {giftCodeAmounts.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {editingId === item.id ? (
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
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">¥</span>
                          <input
                            type="number"
                            min="1"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(item.updated_at)}
                      </td>
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
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          編集
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.id}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {formatAmount(item.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(item.updated_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(item.id, item.amount)}
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
              {giftCodeAmounts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    ギフトコード額が登録されていません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
