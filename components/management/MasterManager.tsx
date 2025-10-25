'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface MasterData {
  id: number
  name: string
  code?: string
  service_id?: number
  prefecture_id?: number
}

interface ServiceData {
  id: number
  name: string
}

interface MasterManagerProps {
  services: ServiceData[]
  genres: MasterData[]
  prefectures: MasterData[]
  areas: MasterData[]
}

type MasterType = 'genres' | 'regions'

const masterLabels = {
  genres: 'ジャンル',
  regions: '都道府県・エリア'
}

export default function MasterManager({
  services,
  genres,
  prefectures,
  areas
}: MasterManagerProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<MasterType>('genres')
  const [selectedServiceId, setSelectedServiceId] = useState<number>(services[0]?.id || 1)
  const [isUpdating, setIsUpdating] = useState(false)

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingType, setEditingType] = useState<'prefecture' | 'area' | null>(null)
  const [editName, setEditName] = useState('')
  const [editCode, setEditCode] = useState('')

  // Add state
  const [isAdding, setIsAdding] = useState(false)
  const [addingType, setAddingType] = useState<'prefecture' | 'area' | null>(null)
  const [addingPrefectureId, setAddingPrefectureId] = useState<number | null>(null)
  const [newName, setNewName] = useState('')
  const [newCode, setNewCode] = useState('')

  // Prefecture expansion state
  const [expandedPrefectures, setExpandedPrefectures] = useState<Set<number>>(new Set())

  const getCurrentData = (): MasterData[] => {
    switch (activeTab) {
      case 'genres':
        return genres.filter(g => g.service_id === selectedServiceId)
      case 'regions':
        return prefectures
    }
  }

  const hasCodeField = activeTab === 'genres'

  const togglePrefecture = (prefectureId: number) => {
    const newExpanded = new Set(expandedPrefectures)
    if (newExpanded.has(prefectureId)) {
      newExpanded.delete(prefectureId)
    } else {
      newExpanded.add(prefectureId)
    }
    setExpandedPrefectures(newExpanded)
  }

  const handleEdit = (item: MasterData, type?: 'prefecture' | 'area') => {
    setEditingId(item.id)
    setEditingType(type || null)
    setEditName(item.name)
    setEditCode(item.code || '')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingType(null)
    setEditName('')
    setEditCode('')
  }

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      alert('名前を入力してください')
      return
    }

    setIsUpdating(true)

    try {
      const supabase = createClient()

      const updateData: any = { name: editName.trim() }
      if (hasCodeField) {
        updateData.code = editCode.trim()
      }

      let tableName = activeTab
      if (activeTab === 'regions') {
        tableName = editingType === 'prefecture' ? 'prefectures' : 'areas'
      }

      const { error } = await supabase
        .from(tableName as string)
        .update(updateData)
        .eq('id', editingId)

      if (error) throw error

      alert('更新しました')
      setEditingId(null)
      setEditingType(null)
      setEditName('')
      setEditCode('')
      router.refresh()
    } catch (error) {
      console.error('Error updating:', error)
      alert('更新に失敗しました')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (id: number, name: string, type?: 'prefecture' | 'area') => {
    if (!confirm(`「${name}」を削除してもよろしいですか？\n\n注意: このマスタを使用している施設がある場合、削除できません。`)) {
      return
    }

    setIsUpdating(true)

    try {
      const supabase = createClient()

      let tableName = activeTab
      if (activeTab === 'regions') {
        tableName = type === 'prefecture' ? 'prefectures' : 'areas'
      }

      const { error } = await supabase
        .from(tableName as string)
        .delete()
        .eq('id', id)

      if (error) {
        if (error.code === '23503') {
          alert('このマスタは使用されているため削除できません')
        } else {
          throw error
        }
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
    if (!newName.trim()) {
      alert('名前を入力してください')
      return
    }

    setIsUpdating(true)

    try {
      const supabase = createClient()

      const insertData: any = { name: newName.trim() }
      if (hasCodeField) {
        insertData.code = newCode.trim()
      }
      if (activeTab === 'genres') {
        insertData.service_id = selectedServiceId
      }

      let tableName = activeTab
      if (activeTab === 'regions') {
        if (addingType === 'area') {
          tableName = 'areas'
          insertData.prefecture_id = addingPrefectureId
        } else {
          tableName = 'prefectures'
        }
      }

      const { error } = await supabase
        .from(tableName as string)
        .insert(insertData)

      if (error) throw error

      alert('追加しました')
      setIsAdding(false)
      setAddingType(null)
      setAddingPrefectureId(null)
      setNewName('')
      setNewCode('')
      router.refresh()
    } catch (error) {
      console.error('Error adding:', error)
      alert('追加に失敗しました')
    } finally {
      setIsUpdating(false)
    }
  }

  const data = getCurrentData()

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {(Object.keys(masterLabels) as MasterType[]).map((type) => (
            <button
              key={type}
              onClick={() => {
                setActiveTab(type)
                setEditingId(null)
                setIsAdding(false)
              }}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === type
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {masterLabels[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Service Tabs (only for genres) */}
      {activeTab === 'genres' && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => {
                  setSelectedServiceId(service.id)
                  setEditingId(null)
                  setIsAdding(false)
                }}
                className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedServiceId === service.id
                    ? 'bg-[#2271b1] text-white border-b-2 border-[#135e96]'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {service.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {activeTab === 'genres'
              ? `${services.find(s => s.id === selectedServiceId)?.name} - ${masterLabels[activeTab]}一覧 (${data.length}件)`
              : activeTab === 'regions'
              ? `${masterLabels[activeTab]}一覧 (都道府県: ${prefectures.length}件、エリア: ${areas.length}件)`
              : `${masterLabels[activeTab]}一覧 (${data.length}件)`
            }
          </h2>
          {activeTab === 'regions' ? (
            <button
              onClick={() => {
                setIsAdding(true)
                setAddingType('prefecture')
              }}
              disabled={isAdding}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 font-medium"
            >
              都道府県を追加
            </button>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              disabled={isAdding}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 font-medium"
            >
              新規追加
            </button>
          )}
        </div>

        {/* Add Form */}
        {isAdding && (
          <div className="mb-4 p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              {activeTab === 'regions'
                ? addingType === 'prefecture'
                  ? '都道府県を追加'
                  : `エリアを追加（${prefectures.find(p => p.id === addingPrefectureId)?.name}）`
                : '新規追加'
              }
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  名前 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {hasCodeField && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    コード
                  </label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                  setAddingType(null)
                  setAddingPrefectureId(null)
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

        {/* Regions Hierarchical View */}
        {activeTab === 'regions' && (
          <div className="space-y-2">
            {prefectures.map((prefecture) => {
              const prefectureAreas = areas.filter(a => a.prefecture_id === prefecture.id)
              const isExpanded = expandedPrefectures.has(prefecture.id)
              const isEditing = editingId === prefecture.id && editingType === 'prefecture'

              return (
                <div key={prefecture.id} className="border border-gray-200 rounded">
                  {/* Prefecture Row */}
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => togglePrefecture(prefecture.id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        {isExpanded ? '▼' : '▶'}
                      </button>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="font-medium text-gray-900">{prefecture.name}</span>
                      )}
                      <span className="text-xs text-gray-500">({prefectureAreas.length}エリア)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
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
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setIsAdding(true)
                              setAddingType('area')
                              setAddingPrefectureId(prefecture.id)
                            }}
                            className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            エリア追加
                          </button>
                          <button
                            onClick={() => handleEdit(prefecture, 'prefecture')}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDelete(prefecture.id, prefecture.name, 'prefecture')}
                            disabled={isUpdating}
                            className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50"
                          >
                            削除
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Areas under this prefecture */}
                  {isExpanded && (
                    <div className="bg-white divide-y divide-gray-100">
                      {prefectureAreas.map((area) => {
                        const isEditingArea = editingId === area.id && editingType === 'area'

                        return (
                          <div key={area.id} className="px-4 py-2 pl-12 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center gap-2 flex-1">
                              {isEditingArea ? (
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              ) : (
                                <span className="text-sm text-gray-700">{area.name}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {isEditingArea ? (
                                <>
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
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleEdit(area, 'area')}
                                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                                  >
                                    編集
                                  </button>
                                  <button
                                    onClick={() => handleDelete(area.id, area.name, 'area')}
                                    disabled={isUpdating}
                                    className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50"
                                  >
                                    削除
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        )
                      })}
                      {prefectureAreas.length === 0 && (
                        <div className="px-4 py-3 pl-12 text-sm text-gray-500">
                          エリアがありません
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Table (for genres) */}
        {activeTab === 'genres' && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  名前
                </th>
                {hasCodeField && (
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
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {editingId === item.id ? (
                    <>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.id}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      {hasCodeField && (
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={editCode}
                            onChange={(e) => setEditCode(e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                      )}
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
                        {item.id}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.name}
                      </td>
                      {hasCodeField && (
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {item.code || '-'}
                        </td>
                      )}
                      <td className="px-4 py-3 text-right space-x-3">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
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
        )}
      </div>
    </div>
  )
}
