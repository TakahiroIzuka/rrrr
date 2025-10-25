'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Facility {
  id: number
  detail: { name: string }[]
}

interface FacilityImage {
  id: number
  facility_id: number
  image_path: string
  thumbnail_path: string | null
  display_order: number
  publicUrl: string
  thumbnailUrl: string | null
}

interface ImageManagerProps {
  facilities: Facility[]
  images: FacilityImage[]
}

export default function ImageManager({ facilities, images: initialImages }: ImageManagerProps) {
  const router = useRouter()
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(null)
  const [facilityImages, setFacilityImages] = useState<FacilityImage[]>([])
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (selectedFacilityId) {
      const filtered = initialImages.filter(img => img.facility_id === selectedFacilityId)
      setFacilityImages(filtered)
    } else {
      setFacilityImages([])
    }
  }, [selectedFacilityId, initialImages])

  const handleDeleteImage = async (imageId: number, imagePath: string, thumbnailPath: string | null) => {
    if (!confirm('この画像を削除してもよろしいですか？')) {
      return
    }

    setIsUpdating(true)

    try {
      const supabase = createClient()

      // Delete from storage
      const pathsToDelete = [imagePath]
      if (thumbnailPath) {
        pathsToDelete.push(thumbnailPath)
      }

      const { error: storageError } = await supabase.storage
        .from('facility-images')
        .remove(pathsToDelete)

      if (storageError) {
        console.error('Storage error:', storageError)
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('facility_images')
        .delete()
        .eq('id', imageId)

      if (dbError) throw dbError

      alert('画像を削除しました')
      router.refresh()
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('画像の削除に失敗しました')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdateDisplayOrder = async (imageId: number, newOrder: number) => {
    if (newOrder < 1 || newOrder > 5) {
      alert('表示順は1〜5の範囲で指定してください')
      return
    }

    setIsUpdating(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('facility_images')
        .update({ display_order: newOrder })
        .eq('id', imageId)

      if (error) throw error

      alert('表示順を更新しました')
      router.refresh()
    } catch (error) {
      console.error('Error updating display order:', error)
      alert('表示順の更新に失敗しました')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Facility selector */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          施設を選択
        </label>
        <select
          value={selectedFacilityId || ''}
          onChange={(e) => setSelectedFacilityId(e.target.value ? Number(e.target.value) : null)}
          className="w-full md:w-96 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">施設を選択してください</option>
          {facilities.map((facility) => {
            const detail = Array.isArray(facility.detail) ? facility.detail[0] : facility.detail
            const name = detail?.name || '(名前なし)'
            return (
              <option key={facility.id} value={facility.id}>
                [{facility.id}] {name}
              </option>
            )
          })}
        </select>
      </div>

      {/* Images grid */}
      {selectedFacilityId && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            画像一覧 ({facilityImages.length}枚)
          </h2>

          {facilityImages.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              この施設には画像がありません
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {facilityImages.map((image) => (
                <div key={image.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="aspect-video bg-gray-100 relative">
                    <img
                      src={image.publicUrl}
                      alt={`画像 ${image.display_order}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-sm font-semibold">
                      表示順: {image.display_order}
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        表示順を変更
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          max="5"
                          defaultValue={image.display_order}
                          className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const newOrder = parseInt((e.target as HTMLInputElement).value)
                              handleUpdateDisplayOrder(image.id, newOrder)
                            }
                          }}
                        />
                        <button
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement
                            const newOrder = parseInt(input.value)
                            handleUpdateDisplayOrder(image.id, newOrder)
                          }}
                          disabled={isUpdating}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                          更新
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteImage(image.id, image.image_path, image.thumbnail_path)}
                      disabled={isUpdating}
                      className="w-full px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50 transition-colors"
                    >
                      削除
                    </button>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p className="truncate">ID: {image.id}</p>
                      <p className="truncate" title={image.image_path}>パス: {image.image_path}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
