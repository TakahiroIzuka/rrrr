'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { uploadFacilityImageComplete } from '@/lib/utils/imageUpload'
import Image from 'next/image'

interface MasterData {
  id: number
  name: string
  code?: string
  prefecture_id?: number
  service_id?: number
}

interface FacilityDetail {
  name?: string
  star?: number | null
  user_review_count?: number
  lat?: number
  lng?: number
  site_url?: string
  portfolio_url?: string
  event_url?: string
  youtube_url?: string
  postal_code?: string
  address?: string
  tel?: string
  google_map_url?: string
  google_place_id?: string
}

interface InitialFacilityData {
  id?: number
  service_id?: number
  genre_id?: number
  prefecture_id?: number
  area_id?: number
  company_id?: number
  uuid?: string
  detail?: FacilityDetail | FacilityDetail[]
}

interface DetailUpdateData {
  name: string
  star: number | null
  user_review_count: number
  lat: number
  lng: number
  site_url?: string
  portfolio_url?: string
  event_url?: string
  youtube_url?: string
  postal_code?: string
  address?: string
  tel?: string
  google_map_url?: string
  google_place_id?: string
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

interface FacilityFormProps {
  genres: MasterData[]
  prefectures: MasterData[]
  areas: MasterData[]
  companies: MasterData[]
  initialData?: InitialFacilityData
  currentUserType?: 'admin' | 'user'
  images?: FacilityImage[]
  defaultServiceId?: number
}

export default function FacilityForm({
  genres,
  prefectures,
  areas,
  companies,
  initialData,
  currentUserType = 'admin',
  images = [],
  defaultServiceId
}: FacilityFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingImages, setUploadingImages] = useState<Record<number, boolean>>({})
  const [facilityImages, setFacilityImages] = useState<FacilityImage[]>(images)
  const [pendingImageFiles, setPendingImageFiles] = useState<Record<number, File>>({})

  // Facility fields
  const [serviceId] = useState(initialData?.service_id || defaultServiceId || '')
  const [genreId, setGenreId] = useState(initialData?.genre_id || '')
  const [prefectureId, setPrefectureId] = useState(initialData?.prefecture_id || '')
  const [areaId, setAreaId] = useState(initialData?.area_id || '')
  const [companyId, setCompanyId] = useState(initialData?.company_id || '')
  const [companyCodeInput, setCompanyCodeInput] = useState('')
  const [companyCodeFocused, setCompanyCodeFocused] = useState(false)

  // Ref for dropdown click outside detection
  const companyDropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target as Node)) {
        setCompanyCodeFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Reset areaId when prefectureId changes
  useEffect(() => {
    if (prefectureId && areaId) {
      // Check if current area belongs to selected prefecture
      const selectedArea = areas.find(a => a.id === Number(areaId))
      if (selectedArea && selectedArea.prefecture_id !== Number(prefectureId)) {
        setAreaId('')
      }
    }
  }, [prefectureId, areaId, areas])


  // Detail fields
  const detail: Partial<FacilityDetail> = ((initialData?.detail && Array.isArray(initialData.detail) ? initialData.detail[0] : initialData?.detail) || {}) as Partial<FacilityDetail>
  const [name, setName] = useState(detail.name || '')
  const [star, setStar] = useState(detail.star || '')
  const [userReviewCount, setUserReviewCount] = useState(detail.user_review_count || '')
  const [lat, setLat] = useState(detail.lat || '')
  const [lng, setLng] = useState(detail.lng || '')
  const [siteUrl, setSiteUrl] = useState(detail.site_url || '')
  const [portfolioUrl, setPortfolioUrl] = useState(detail.portfolio_url || '')
  const [eventUrl, setEventUrl] = useState(detail.event_url || '')
  const [youtubeUrl, setYoutubeUrl] = useState(detail.youtube_url || '')
  const [postalCode, setPostalCode] = useState(detail.postal_code || '')

  // Helper function to extract YouTube video ID from URL
  const getYoutubeVideoId = (url: string): string | null => {
    if (!url) return null
    // Match youtube.com/watch?v=xxx
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.*&v=)([^&]+)/)
    if (watchMatch) return watchMatch[1]
    // Match youtu.be/xxx
    const shortMatch = url.match(/youtu\.be\/([^?&]+)/)
    if (shortMatch) return shortMatch[1]
    // Match youtube.com/embed/xxx
    const embedMatch = url.match(/youtube\.com\/embed\/([^?&]+)/)
    if (embedMatch) return embedMatch[1]
    return null
  }

  const youtubeVideoId = getYoutubeVideoId(youtubeUrl)
  const [address, setAddress] = useState(detail.address || '')
  const [tel, setTel] = useState(detail.tel || '')
  const [googleMapUrl, setGoogleMapUrl] = useState(detail.google_map_url || '')
  const [googlePlaceId, setGooglePlaceId] = useState(detail.google_place_id || '')

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(pendingImageFiles).forEach(file => {
        if (file) {
          URL.revokeObjectURL(URL.createObjectURL(file))
        }
      })
    }
  }, [pendingImageFiles])

  const handleImageUpload = async (displayOrder: number, file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください')
      return
    }

    // Validate supported image formats (JPEG, PNG, GIF, TIFF only)
    const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/tiff']
    if (!supportedTypes.includes(file.type)) {
      alert('サポートされていない画像形式です。JPEG、PNG、GIF、TIFF形式の画像を選択してください。')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('ファイルサイズは5MB以下にしてください')
      return
    }

    // If editing existing facility, upload immediately
    if (initialData?.id) {
      setUploadingImages(prev => ({ ...prev, [displayOrder]: true }))

      try {
        const uploadedImage = await uploadFacilityImageComplete(
          initialData.id,
          file,
          displayOrder
        )

        // Update local state
        setFacilityImages(prev => {
          const filtered = prev.filter(img => img.display_order !== displayOrder)
          return [...filtered, uploadedImage as FacilityImage].sort((a, b) => a.display_order - b.display_order)
        })

        alert('画像をアップロードしました')
        router.refresh()
      } catch (error) {
        console.error('Error uploading image:', error)
        alert('画像のアップロードに失敗しました')
      } finally {
        setUploadingImages(prev => ({ ...prev, [displayOrder]: false }))
      }
    } else {
      // If creating new facility, store file for later upload
      setPendingImageFiles(prev => ({ ...prev, [displayOrder]: file }))
    }
  }

  const handleRemovePendingImage = (displayOrder: number) => {
    setPendingImageFiles(prev => {
      const newFiles = { ...prev }
      delete newFiles[displayOrder]
      return newFiles
    })
  }

  const handleImageDelete = async (imageId: number, imagePath: string, thumbnailPath: string | null, displayOrder: number) => {
    if (!confirm('この画像を削除してもよろしいですか？')) {
      return
    }

    setUploadingImages(prev => ({ ...prev, [displayOrder]: true }))

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

      // Update local state
      setFacilityImages(prev => prev.filter(img => img.id !== imageId))

      alert('画像を削除しました')
      router.refresh()
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('画像の削除に失敗しました')
    } finally {
      setUploadingImages(prev => ({ ...prev, [displayOrder]: false }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate serviceId is set
    if (!serviceId) {
      alert('サービスが選択されていません')
      setIsSubmitting(false)
      return
    }

    try {
      const supabase = createClient()

      if (initialData) {
        // Update existing facility
        // Only update basic info if user is admin
        if (currentUserType === 'admin') {
          const { error: facilityError } = await supabase
            .from('facilities')
            .update({
              service_id: parseInt(String(serviceId)),
              genre_id: parseInt(String(genreId)),
              prefecture_id: parseInt(String(prefectureId)),
              area_id: areaId ? parseInt(String(areaId)) : null,
              company_id: companyId ? parseInt(String(companyId)) : null
            })
            .eq('id', initialData.id)

          if (facilityError) throw facilityError
        }

        // Update facility_details
        const detailUpdateData: DetailUpdateData = {
          name,
          star: star ? parseFloat(String(star)) : null,
          user_review_count: userReviewCount ? parseInt(String(userReviewCount)) : 0,
          lat: lat ? parseFloat(String(lat)) : 0,
          lng: lng ? parseFloat(String(lng)) : 0,
          site_url: siteUrl || undefined,
          portfolio_url: portfolioUrl || undefined,
          event_url: eventUrl || undefined,
          youtube_url: youtubeUrl || undefined,
          postal_code: postalCode || undefined,
          address: address || undefined,
          tel: tel || undefined
        }

        // Only update google_map_url and google_place_id if user is admin
        if (currentUserType === 'admin') {
          detailUpdateData.google_map_url = googleMapUrl
          detailUpdateData.google_place_id = googlePlaceId || undefined
        }

        const { error: detailError } = await supabase
          .from('facility_details')
          .update(detailUpdateData)
          .eq('facility_id', initialData.id)

        if (detailError) throw detailError

        alert('施設を更新しました')
        router.push(`/management/facilities?service=${serviceId}`)
        router.refresh()
        return
      } else {
        // Insert new facility
        const { data: facility, error: facilityError } = await supabase
          .from('facilities')
          .insert({
            service_id: parseInt(String(serviceId)),
            genre_id: parseInt(String(genreId)),
            prefecture_id: parseInt(String(prefectureId)),
            area_id: areaId ? parseInt(String(areaId)) : null,
            company_id: companyId ? parseInt(String(companyId)) : null
          })
          .select()
          .single()

        if (facilityError) throw facilityError

        // Insert facility_details
        const { error: detailError } = await supabase
          .from('facility_details')
          .insert({
            facility_id: facility.id,
            name,
            star: star ? parseFloat(String(star)) : null,
            user_review_count: userReviewCount ? parseInt(String(userReviewCount)) : 0,
            lat: lat ? parseFloat(String(lat)) : 0,
            lng: lng ? parseFloat(String(lng)) : 0,
            site_url: siteUrl || undefined,
            portfolio_url: portfolioUrl || undefined,
            event_url: eventUrl || undefined,
            youtube_url: youtubeUrl || undefined,
            postal_code: postalCode || undefined,
            address: address || undefined,
            tel: tel || undefined,
            google_map_url: googleMapUrl,
            google_place_id: googlePlaceId || undefined
          })

        if (detailError) throw detailError

        // Upload pending images if any
        const pendingImageEntries = Object.entries(pendingImageFiles)
        if (pendingImageEntries.length > 0) {
          let uploadedCount = 0
          let failedCount = 0

          for (const [displayOrderStr, file] of pendingImageEntries) {
            const displayOrder = parseInt(displayOrderStr)
            try {
              await uploadFacilityImageComplete(facility.id, file, displayOrder)
              uploadedCount++
            } catch (error) {
              console.error(`画像 ${displayOrder} のアップロードに失敗:`, error)
              failedCount++
            }
          }

          if (failedCount > 0) {
            alert(`施設を追加しました。画像: ${uploadedCount}枚成功、${failedCount}枚失敗`)
          } else {
            alert(`施設を追加しました。画像${uploadedCount}枚もアップロードしました。`)
          }
        } else {
          alert('施設を追加しました。')
        }

        router.push(`/management/facilities?service=${serviceId}`)
        router.refresh()
        return
      }
    } catch (error) {
      console.error('Error saving facility:', error)
      alert('施設の保存に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded shadow border border-gray-200 p-6 max-w-3xl">
      <div className="space-y-6">
        {/* Basic Info */}
        {currentUserType === 'admin' && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-4">基本情報</h2>

            <div className="space-y-4">
              {/* ジャンル - 1行目 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ジャンル <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={genreId}
                  onChange={(e) => setGenreId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">選択してください</option>
                  {genres
                    .filter((genre) => genre.service_id === Number(serviceId))
                    .map((genre) => (
                      <option key={genre.id} value={genre.id}>
                        {genre.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* 都道府県・地域 - 2行目（横並び） */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    都道府県 <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={prefectureId}
                    onChange={(e) => setPrefectureId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">選択してください</option>
                    {prefectures.map((prefecture) => (
                      <option key={prefecture.id} value={prefecture.id}>
                        {prefecture.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    地域
                  </label>
                  <select
                    value={areaId}
                    onChange={(e) => setAreaId(e.target.value)}
                    disabled={!prefectureId}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {prefectureId ? '選択してください' : '都道府県を先に選択してください'}
                    </option>
                    {prefectureId && areas
                      .filter((area) => area.prefecture_id === Number(prefectureId))
                      .map((area) => (
                        <option key={area.id} value={area.id}>
                          {area.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* 会社コード - 3行目 */}
              <div className="relative" ref={companyDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  会社コード
                </label>
                <button
                  type="button"
                  onClick={() => setCompanyCodeFocused(!companyCodeFocused)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-left flex items-center justify-between"
                >
                  <span className={companyId ? 'text-gray-900' : 'text-gray-500'}>
                    {companyId
                      ? companies.find(c => c.id === Number(companyId))?.code || '選択してください'
                      : '選択してください'
                    }
                  </span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {companyCodeFocused && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                    <div className="p-2 border-b border-gray-200">
                      <input
                        type="text"
                        value={companyCodeInput}
                        onChange={(e) => setCompanyCodeInput(e.target.value)}
                        placeholder="会社コードで検索..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {companies
                        .filter((company) =>
                          company.code?.toLowerCase().includes(companyCodeInput.toLowerCase())
                        )
                        .map((company) => (
                          <div
                            key={company.id}
                            onClick={() => {
                              setCompanyId(company.id.toString())
                              setCompanyCodeInput('')
                              setCompanyCodeFocused(false)
                            }}
                            className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                          >
                            <div className="text-sm font-medium text-gray-900">{company.code}</div>
                            <div className="text-xs text-gray-500">{company.name}</div>
                          </div>
                        ))}
                      {companies.filter((company) =>
                        company.code?.toLowerCase().includes(companyCodeInput.toLowerCase())
                      ).length === 0 && (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          該当する会社が見つかりません
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* UUID表示 - 編集時のみ */}
              {initialData?.uuid && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UUID
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 text-sm font-mono">
                    {initialData.uuid}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    この値は自動生成され、変更できません。アンケート画面を表示する場合はこの値を/サービス名/questionnaireの後に設定してください。
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Detail Info */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">詳細情報</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                施設名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                評価（星）
              </label>
              {initialData ? (
                <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                  {star || '-'}
                </div>
              ) : (
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={star}
                  onChange={(e) => setStar(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                レビュー数
              </label>
              {initialData ? (
                <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                  {userReviewCount || '-'}
                </div>
              ) : (
                <input
                  type="number"
                  min="0"
                  value={userReviewCount}
                  onChange={(e) => setUserReviewCount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                緯度 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                required
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                経度 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                required
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                サイトURL
              </label>
              <input
                type="url"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                実績紹介
              </label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                最新のイベント情報
              </label>
              <input
                type="url"
                value={eventUrl}
                onChange={(e) => setEventUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Youtube動画
              </label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {youtubeVideoId && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">プレビュー:</p>
                  <div className="aspect-video max-w-md">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                      title="YouTube video preview"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full rounded-lg border border-gray-200"
                    />
                  </div>
                </div>
              )}
              {youtubeUrl && !youtubeVideoId && (
                <p className="mt-1 text-xs text-red-500">
                  有効なYouTube URLを入力してください
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                郵便番号
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="1234567"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話番号
              </label>
              <input
                type="tel"
                value={tel}
                onChange={(e) => setTel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                住所
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {currentUserType === 'admin' && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Google Map URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={googleMapUrl}
                    onChange={(e) => setGoogleMapUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Google Place ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={googlePlaceId}
                    onChange={(e) => setGooglePlaceId(e.target.value)}
                    placeholder="ChIJ..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Place Details API用のPlace ID（例: ChIJN1t_tDeuEmsRUsoyG83frY4）
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Image Upload Section */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">施設画像（最大5枚）</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5].map((displayOrder) => {
              const existingImage = facilityImages.find(img => img.display_order === displayOrder)
              const pendingFile = pendingImageFiles[displayOrder]
              const isUploading = uploadingImages[displayOrder]

              return (
                <div key={displayOrder} className="border border-gray-300 rounded-lg p-4">
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700">画像 {displayOrder}</span>
                  </div>

                  {existingImage ? (
                      <div className="space-y-2">
                        <div className="aspect-video bg-gray-100 rounded overflow-hidden relative">
                          <img
                            src={existingImage.thumbnailUrl || existingImage.publicUrl}
                            alt={`画像 ${displayOrder}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex gap-2">
                          <label className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 cursor-pointer text-center disabled:opacity-50">
                            {isUploading ? '処理中...' : '差し替え'}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={isUploading}
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  handleImageUpload(displayOrder, file)
                                }
                                e.target.value = ''
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => handleImageDelete(
                              existingImage.id,
                              existingImage.image_path,
                              existingImage.thumbnail_path,
                              displayOrder
                            )}
                            disabled={isUploading}
                            className="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50"
                          >
                            削除
                          </button>
                        </div>
                        <div className="text-xs text-gray-500">
                          <p className="truncate">ID: {existingImage.id}</p>
                        </div>
                    </div>
                  ) : pendingFile ? (
                    <div className="space-y-2">
                      <div className="aspect-video bg-gray-100 rounded overflow-hidden relative">
                        <img
                          src={URL.createObjectURL(pendingFile)}
                          alt={`選択された画像 ${displayOrder}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex gap-2">
                        <label className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 cursor-pointer text-center">
                          差し替え
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                handleImageUpload(displayOrder, file)
                              }
                              e.target.value = ''
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemovePendingImage(displayOrder)}
                          className="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                        >
                          削除
                        </button>
                      </div>
                      <div className="text-xs text-gray-500">
                        <p className="truncate">選択済み: {pendingFile.name}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="aspect-video bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-gray-400 text-sm">画像なし</span>
                      </div>
                      <label className="block w-full px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 cursor-pointer text-center disabled:opacity-50">
                        {isUploading ? '処理中...' : 'アップロード'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleImageUpload(displayOrder, file)
                            }
                            e.target.value = ''
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <p className="mt-4 text-sm text-gray-600">
            ※ 画像は最大5MB、推奨サイズは600x400ピクセルです。自動的にリサイズされます（オリジナル: 600x400、サムネイル: 225x150）。
            {!initialData && ' 施設情報と一緒に保存されます。'}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-[#2271b1] text-white rounded text-sm hover:bg-[#135e96] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSubmitting ? '保存中...' : (initialData ? '更新' : '追加')}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/management/facilities?service=${serviceId}`)}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors font-medium"
          >
            キャンセル
          </button>
        </div>
      </div>
    </form>
  )
}
