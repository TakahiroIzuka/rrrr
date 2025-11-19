'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import * as XLSX from 'xlsx'

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

interface UpdateData {
  name: string
  code?: string
}

interface InsertData {
  name: string
  code?: string
  service_id?: number
  prefecture_id?: number
}

interface PrefectureData {
  id: number
  name: string
}

interface MasterManagerProps {
  masterType: 'genres' | 'regions'
  services: ServiceData[]
  genres: MasterData[]
  prefectures: MasterData[]
  areas: MasterData[]
}

const masterLabels = {
  genres: 'ジャンル',
  regions: '都道府県・地域'
}

export default function MasterManager({
  masterType,
  services,
  genres,
  prefectures,
  areas
}: MasterManagerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = masterType

  // Get service ID from URL or use first service
  const serviceIdFromUrl = searchParams.get('service')
  const initialServiceId = serviceIdFromUrl
    ? parseInt(serviceIdFromUrl)
    : services[0]?.id || 1

  const [selectedServiceId, setSelectedServiceId] = useState<number>(initialServiceId)
  const [isUpdating, setIsUpdating] = useState(false)

  // Update selectedServiceId when URL changes
  useEffect(() => {
    if (serviceIdFromUrl) {
      const parsedId = parseInt(serviceIdFromUrl)
      if (services.some(s => s.id === parsedId)) {
        setSelectedServiceId(parsedId)
      }
    }
  }, [serviceIdFromUrl, services])

  const handleServiceChange = (serviceId: number) => {
    setSelectedServiceId(serviceId)
    setEditingId(null)
    setIsAdding(false)
    router.push(`/management/masters/genres?service=${serviceId}`, { scroll: false })
  }

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

  // File import state
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

      const updateData: UpdateData = { name: editName.trim() }
      if (hasCodeField) {
        updateData.code = editCode.trim()
      }

      let tableName: string = activeTab
      if (activeTab === 'regions') {
        tableName = editingType === 'prefecture' ? 'prefectures' : 'areas'

        // Check for duplicate name when editing
        if (editingType === 'prefecture') {
          const { data: existingPrefecture } = await supabase
            .from('prefectures')
            .select('id')
            .eq('name', editName.trim())
            .neq('id', editingId)
            .single()

          if (existingPrefecture) {
            alert('既に同じ名前の都道府県が存在します')
            setIsUpdating(false)
            return
          }
        } else {
          // For areas, get the prefecture_id of the current area being edited
          const { data: currentArea } = await supabase
            .from('areas')
            .select('prefecture_id')
            .eq('id', editingId)
            .single()

          if (currentArea) {
            const { data: existingArea } = await supabase
              .from('areas')
              .select('id')
              .eq('name', editName.trim())
              .eq('prefecture_id', currentArea.prefecture_id)
              .neq('id', editingId)
              .single()

            if (existingArea) {
              alert('この都道府県には既に同じ名前の地域が存在します')
              setIsUpdating(false)
              return
            }
          }
        }
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

      let tableName: string = activeTab
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

    if (hasCodeField && !newCode.trim()) {
      alert('コードを入力してください')
      return
    }

    setIsUpdating(true)

    try {
      const supabase = createClient()

      const insertData: InsertData = { name: newName.trim() }
      if (hasCodeField) {
        insertData.code = newCode.trim()
      }
      if (activeTab === 'genres') {
        insertData.service_id = selectedServiceId
      }

      let tableName: string = activeTab
      if (activeTab === 'regions') {
        if (addingType === 'area') {
          tableName = 'areas'
          insertData.prefecture_id = addingPrefectureId ?? undefined

          // Check for duplicate area name within the same prefecture
          const { data: existingArea } = await supabase
            .from('areas')
            .select('id')
            .eq('name', newName.trim())
            .eq('prefecture_id', addingPrefectureId)
            .single()

          if (existingArea) {
            alert('この都道府県には既に同じ名前の地域が存在します')
            setIsUpdating(false)
            return
          }
        } else {
          tableName = 'prefectures'

          // Check for duplicate prefecture name
          const { data: existingPrefecture } = await supabase
            .from('prefectures')
            .select('id')
            .eq('name', newName.trim())
            .single()

          if (existingPrefecture) {
            alert('既に同じ名前の都道府県が存在します')
            setIsUpdating(false)
            return
          }
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

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)

    try {
      const supabase = createClient()

      // Read file
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: ['prefecture', 'area'], defval: '' })

      // Skip header row if exists
      const rows = jsonData.slice(1) as { prefecture: string; area: string }[]

      let addedPrefectures = 0
      let addedAreas = 0
      let skippedAreas = 0
      let currentPrefecture: PrefectureData | null = null
      let currentPrefectureName = ''

      for (const row of rows) {
        let prefectureName = String(row.prefecture || '').trim()
        const areaName = String(row.area || '').trim()

        // If prefecture column is empty, use the last prefecture
        if (!prefectureName && currentPrefectureName) {
          prefectureName = currentPrefectureName
          currentPrefecture = currentPrefecture // Keep using the same prefecture object
        } else if (prefectureName) {
          // New prefecture name found
          currentPrefectureName = prefectureName

          // Check if prefecture exists in database
          const { data: existingPrefecture } = await supabase
            .from('prefectures')
            .select('*')
            .eq('name', prefectureName)
            .single()

          currentPrefecture = existingPrefecture

          if (!currentPrefecture) {
            // Add new prefecture
            const { data: newPrefecture, error: prefError } = await supabase
              .from('prefectures')
              .insert({ name: prefectureName })
              .select()
              .single()

            if (prefError) {
              console.error('Error adding prefecture:', prefError)
              continue
            }

            currentPrefecture = newPrefecture
            addedPrefectures++
          }
        }

        // Add area if provided and we have a current prefecture
        if (areaName && currentPrefecture) {
          // Check if area already exists for this prefecture in database
          const { data: existingArea } = await supabase
            .from('areas')
            .select('*')
            .eq('name', areaName)
            .eq('prefecture_id', currentPrefecture.id)
            .single()

          if (!existingArea) {
            const { error: areaError } = await supabase
              .from('areas')
              .insert({
                name: areaName,
                prefecture_id: currentPrefecture.id
              })

            if (areaError) {
              console.error('Error adding area:', areaError)
              continue
            }

            addedAreas++
          } else {
            skippedAreas++
          }
        }
      }

      alert(`インポート完了\n都道府県: ${addedPrefectures}件追加\n地域: ${addedAreas}件追加\n地域: ${skippedAreas}件スキップ`)
      router.refresh()
    } catch (error) {
      console.error('Error importing file:', error)
      alert('ファイルの読み込みに失敗しました')
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const data = getCurrentData()

  return (
    <div className="space-y-6">
      {/* Service Tabs (only for genres) */}
      {activeTab === 'genres' && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => handleServiceChange(service.id)}
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
              ? `${masterLabels[activeTab]}一覧 (都道府県: ${prefectures.length}件、地域: ${areas.length}件)`
              : `${masterLabels[activeTab]}一覧 (${data.length}件)`
            }
          </h2>
          {activeTab === 'regions' ? (
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx,.xls"
                onChange={handleFileImport}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 font-medium"
              >
                {isImporting ? 'インポート中...' : 'Excelでインポート'}
              </button>
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
            </div>
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

        {/* Add Form for Prefecture (only shown at top when adding prefecture) */}
        {isAdding && addingType === 'prefecture' && activeTab === 'regions' && (
          <div className="mb-4 p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              都道府県を追加
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

        {/* Add Form for Genres */}
        {isAdding && activeTab === 'genres' && (
          <div className="mb-4 p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              新規追加
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
                    コード <span className="text-red-500">*</span>
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
                            onClick={() => togglePrefecture(prefecture.id)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            {isExpanded ? '▼' : '▶'}
                          </button>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-48 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
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
                            onClick={() => handleEdit(prefecture, 'prefecture')}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => togglePrefecture(prefecture.id)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            {isExpanded ? '▼' : '▶'}
                          </button>
                          <span className="font-medium text-gray-900">{prefecture.name}</span>
                          <span className="text-xs text-gray-500">({prefectureAreas.length}地域)</span>
                          <button
                            onClick={() => {
                              setIsAdding(true)
                              setAddingType('area')
                              setAddingPrefectureId(prefecture.id)
                              // Expand the prefecture to show areas
                              const newExpanded = new Set(expandedPrefectures)
                              newExpanded.add(prefecture.id)
                              setExpandedPrefectures(newExpanded)
                            }}
                            className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            地域追加
                          </button>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!isEditing && (
                        <button
                          onClick={() => handleDelete(prefecture.id, prefecture.name, 'prefecture')}
                          disabled={isUpdating}
                          className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50"
                        >
                          削除
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Areas under this prefecture */}
                  {isExpanded && (
                    <div className="bg-white divide-y divide-gray-100">
                      {/* Add Area Form (shown when adding area for this prefecture) */}
                      {isAdding && addingType === 'area' && addingPrefectureId === prefecture.id && (
                        <div className="px-4 py-3 pl-12 bg-green-50 border border-green-200">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">
                            地域を追加
                          </h4>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                              placeholder="地域名を入力"
                              className="w-64 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <button
                              onClick={handleAdd}
                              disabled={isUpdating}
                              className="px-4 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50"
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

                      {prefectureAreas.map((area) => {
                        const isEditingArea = editingId === area.id && editingType === 'area'

                        return (
                          <div key={area.id} className="px-4 py-2 pl-12 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center gap-2 flex-1">
                              {isEditingArea ? (
                                <>
                                  <button
                                    onClick={handleSaveEdit}
                                    disabled={isUpdating}
                                    className="text-blue-600 hover:text-blue-900 text-sm font-medium disabled:opacity-50"
                                  >
                                    保存
                                  </button>
                                  <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-48 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
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
                                  <span className="text-sm text-gray-700">{area.name}</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {!isEditingArea && (
                                <button
                                  onClick={() => handleDelete(area.id, area.name, 'area')}
                                  disabled={isUpdating}
                                  className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50"
                                >
                                  削除
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                      {prefectureAreas.length === 0 && (
                        <div className="px-4 py-3 pl-12 text-sm text-gray-500">
                          地域がありません
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
                  編集
                </th>
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
                  削除
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((item) => (
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
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.name}
                      </td>
                      {hasCodeField && (
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {item.code || '-'}
                        </td>
                      )}
                      <td className="px-4 py-3 text-right">
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
