'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface GiftCodeAmount {
  id: number
  amount: number
}

interface GiftCode {
  id: number
  code: string
  gift_code_amount_id: number
  used: boolean
  expires_at: string | null
  created_at: string
  updated_at: string
  gift_code_amounts: GiftCodeAmount
}

interface GiftCodesListProps {
  giftCodes: GiftCode[]
  giftCodeAmounts: GiftCodeAmount[]
}

export default function GiftCodesList({ giftCodes, giftCodeAmounts }: GiftCodesListProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedAmountId, setSelectedAmountId] = useState<number | null>(
    giftCodeAmounts.length > 0 ? giftCodeAmounts[0].id : null
  )

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editCode, setEditCode] = useState('')
  const [editAmountId, setEditAmountId] = useState<number | null>(null)
  const [editUsed, setEditUsed] = useState(false)
  const [editExpiresAt, setEditExpiresAt] = useState('')

  // Add state
  const [isAdding, setIsAdding] = useState(false)
  const [newCode, setNewCode] = useState('')
  const [newAmountId, setNewAmountId] = useState<number | null>(
    giftCodeAmounts.length > 0 ? giftCodeAmounts[0].id : null
  )
  const [newExpiresAt, setNewExpiresAt] = useState('')

  // CSV Import state
  const [isCsvDialogOpen, setIsCsvDialogOpen] = useState(false)
  const [csvImporting, setCsvImporting] = useState(false)
  const [csvResult, setCsvResult] = useState<{ success: number; errors: { row: number; code: string; message: string }[] } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  // Filter codes by selected amount
  const filteredCodes = selectedAmountId
    ? giftCodes.filter(c => c.gift_code_amount_id === selectedAmountId)
    : giftCodes

  // Count stats
  const totalCount = filteredCodes.length
  const usedCount = filteredCodes.filter(c => c.used).length
  const unusedCount = totalCount - usedCount

  const handleEdit = (item: GiftCode) => {
    setEditingId(item.id)
    setEditCode(item.code)
    setEditAmountId(item.gift_code_amount_id)
    setEditUsed(item.used)
    setEditExpiresAt(item.expires_at || '')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditCode('')
    setEditAmountId(null)
    setEditUsed(false)
    setEditExpiresAt('')
  }

  const handleSaveEdit = async () => {
    if (!editCode.trim()) {
      alert('コードを入力してください')
      return
    }

    setIsUpdating(true)

    try {
      const response = await fetch(`/api/gift-codes/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: editCode.trim(),
          gift_code_amount_id: editAmountId,
          used: editUsed,
          expires_at: editExpiresAt || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || '更新に失敗しました')
        return
      }

      alert('更新しました')
      handleCancelEdit()
      router.refresh()
    } catch (error) {
      console.error('Error updating:', error)
      alert('更新に失敗しました')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (id: number, code: string) => {
    if (!confirm(`「${code}」を削除してもよろしいですか？`)) {
      return
    }

    setIsUpdating(true)

    try {
      const response = await fetch(`/api/gift-codes/${id}`, {
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
    if (!newCode.trim()) {
      alert('コードを入力してください')
      return
    }

    if (!newAmountId) {
      alert('金額を選択してください')
      return
    }

    setIsUpdating(true)

    try {
      const response = await fetch('/api/gift-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCode.trim(),
          gift_code_amount_id: newAmountId,
          expires_at: newExpiresAt || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || '追加に失敗しました')
        return
      }

      alert('追加しました')
      setIsAdding(false)
      setNewCode('')
      setNewExpiresAt('')
      router.refresh()
    } catch (error) {
      console.error('Error adding:', error)
      alert('追加に失敗しました')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCsvImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setCsvImporting(true)
    setCsvResult(null)

    try {
      // BOM（Byte Order Mark）を除去してからパース
      const text = (await file.text()).replace(/^\uFEFF/, '')
      const lines = text.split(/\r?\n/).filter(line => line.trim())

      if (lines.length < 2) {
        alert('データがありません（ヘッダー行のみ）')
        return
      }

      // Parse CSV (skip header)
      const rows: { code: string; amount: number }[] = []
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim())
        if (cols.length >= 2) {
          rows.push({
            code: cols[0],
            amount: parseInt(cols[1])
          })
        }
      }

      const response = await fetch('/api/gift-codes/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows })
      })

      const result = await response.json()

      if (!response.ok) {
        alert(result.error || 'インポートに失敗しました')
        return
      }

      setCsvResult(result)
      router.refresh()
    } catch (error) {
      console.error('Error importing CSV:', error)
      alert('CSVの読み込みに失敗しました')
    } finally {
      setCsvImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            ギフトコード一覧
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setIsAdding(true)}
              disabled={isAdding || giftCodeAmounts.length === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 font-medium"
            >
              新規追加
            </button>
            <button
              onClick={() => setIsCsvDialogOpen(true)}
              disabled={giftCodeAmounts.length === 0}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 font-medium"
            >
              CSV一括登録
            </button>
          </div>
        </div>

        {giftCodeAmounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            先にギフトコード額マスタを登録してください
          </div>
        ) : (
          <>
            {/* Amount Tabs */}
            <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
              {giftCodeAmounts.map((amount) => {
                const count = giftCodes.filter(c => c.gift_code_amount_id === amount.id).length
                return (
                  <button
                    key={amount.id}
                    onClick={() => setSelectedAmountId(amount.id)}
                    className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                      selectedAmountId === amount.id
                        ? 'bg-[#2271b1] text-white border-b-2 border-[#135e96]'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {formatAmount(amount.amount)} ({count})
                  </button>
                )
              })}
            </div>

            {/* Stats */}
            <div className="flex gap-4 mb-4 text-sm">
              <span className="text-gray-600">
                合計: <span className="font-semibold">{totalCount}件</span>
              </span>
              <span className="text-green-600">
                未使用: <span className="font-semibold">{unusedCount}件</span>
              </span>
              <span className="text-gray-500">
                使用済み: <span className="font-semibold">{usedCount}件</span>
              </span>
            </div>

            {/* Add Form */}
            {isAdding && (
              <div className="mb-4 p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  新規追加
                </h3>
                <div className="flex items-end gap-3 flex-wrap">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      コード <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      placeholder="例: GIFT-ABC-12345"
                      className="w-48 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      金額 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newAmountId || ''}
                      onChange={(e) => setNewAmountId(parseInt(e.target.value))}
                      className="w-32 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {giftCodeAmounts.map((amount) => (
                        <option key={amount.id} value={amount.id}>
                          {formatAmount(amount.amount)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      有効期限
                    </label>
                    <input
                      type="date"
                      value={newExpiresAt}
                      onChange={(e) => setNewExpiresAt(e.target.value)}
                      className="w-36 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
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
                        setNewCode('')
                        setNewExpiresAt('')
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
                      コード
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      金額
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      有効期限
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      使用状態
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      削除
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCodes.map((item) => (
                    <tr
                      key={item.id}
                      className={item.used ? 'bg-gray-100' : 'hover:bg-gray-50'}
                    >
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
                            <input
                              type="text"
                              value={editCode}
                              onChange={(e) => setEditCode(e.target.value)}
                              className="w-40 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={editAmountId || ''}
                              onChange={(e) => setEditAmountId(parseInt(e.target.value))}
                              className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {giftCodeAmounts.map((amount) => (
                                <option key={amount.id} value={amount.id}>
                                  {formatAmount(amount.amount)}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="date"
                              value={editExpiresAt}
                              onChange={(e) => setEditExpiresAt(e.target.value)}
                              className="w-32 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={editUsed ? 'used' : 'unused'}
                              onChange={(e) => setEditUsed(e.target.value === 'used')}
                              className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="unused">未使用</option>
                              <option value="used">使用済み</option>
                            </select>
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
                          <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                            {item.code}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {formatAmount(item.gift_code_amounts.amount)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {item.expires_at || '-'}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                                item.used
                                  ? 'bg-gray-200 text-gray-600'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {item.used ? '使用済み' : '未使用'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDelete(item.id, item.code)}
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
                  {filteredCodes.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        ギフトコードが登録されていません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* CSV Import Dialog */}
      {isCsvDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">CSV一括登録</h3>
              <button
                onClick={() => {
                  setIsCsvDialogOpen(false)
                  setCsvResult(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              {csvResult ? (
                <div className="space-y-4">
                  <div className="text-sm">
                    <p className="text-green-600 font-medium">成功: {csvResult.success}件</p>
                    {csvResult.errors.length > 0 && (
                      <p className="text-red-600 font-medium">エラー: {csvResult.errors.length}件</p>
                    )}
                  </div>
                  {csvResult.errors.length > 0 && (
                    <div className="max-h-48 overflow-y-auto">
                      <p className="text-sm font-medium text-gray-700 mb-2">エラー詳細:</p>
                      <ul className="text-sm text-red-600 space-y-1">
                        {csvResult.errors.map((err, i) => (
                          <li key={i}>
                            行{err.row}: {err.message} ({err.code})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setIsCsvDialogOpen(false)
                      setCsvResult(null)
                    }}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    閉じる
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2">CSVファイル形式:</p>
                    <pre className="bg-gray-100 p-2 rounded text-xs">
                      gift_code,gift_code_amount{'\n'}
                      GIFT-ABC-12345,500{'\n'}
                      GIFT-DEF-67890,1000
                    </pre>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".csv"
                      onChange={handleCsvImport}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={csvImporting}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                      {csvImporting ? 'インポート中...' : 'ファイルを選択'}
                    </button>
                  </div>
                  <button
                    onClick={() => setIsCsvDialogOpen(false)}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    キャンセル
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
