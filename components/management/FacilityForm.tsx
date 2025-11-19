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
  postal_code?: string
  address?: string
  tel?: string
  google_map_url?: string
}

interface InitialFacilityData {
  id?: number
  service_id?: number
  genre_id?: number
  prefecture_id?: number
  area_id?: number
  company_id?: number
  detail?: FacilityDetail | FacilityDetail[]
}

interface DetailUpdateData {
  name: string
  star: number | null
  user_review_count: number
  lat: number
  lng: number
  site_url?: string
  postal_code?: string
  address?: string
  tel?: string
  google_map_url?: string
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
  services: MasterData[]
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
  services,
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
  const [serviceId, setServiceId] = useState(initialData?.service_id || defaultServiceId || '')
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

  // Reset genreId when serviceId changes
  useEffect(() => {
    if (serviceId && genreId) {
      // Check if current genre belongs to selected service
      const selectedGenre = genres.find(g => g.id === Number(genreId))
      if (selectedGenre && selectedGenre.service_id !== Number(serviceId)) {
        setGenreId('')
      }
    }
  }, [serviceId, genreId, genres])

  // Detail fields
  const detail: Partial<FacilityDetail> = ((initialData?.detail && Array.isArray(initialData.detail) ? initialData.detail[0] : initialData?.detail) || {}) as Partial<FacilityDetail>
  const [name, setName] = useState(detail.name || '')
  const [star, setStar] = useState(detail.star || '')
  const [userReviewCount, setUserReviewCount] = useState(detail.user_review_count || '')
  const [lat, setLat] = useState(detail.lat || '')
  const [lng, setLng] = useState(detail.lng || '')
  const [siteUrl, setSiteUrl] = useState(detail.site_url || '')
  const [postalCode, setPostalCode] = useState(detail.postal_code || '')
  const [address, setAddress] = useState(detail.address || '')
  const [tel, setTel] = useState(detail.tel || '')
  const [googleMapUrl, setGoogleMapUrl] = useState(detail.google_map_url || '')

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
          postal_code: postalCode || undefined,
          address: address || undefined,
          tel: tel || undefined
        }

        // Only update google_map_url if user is admin
        if (currentUserType === 'admin') {
          detailUpdateData.google_map_url = googleMapUrl
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
            postal_code: postalCode || undefined,
            address: address || undefined,
            tel: tel || undefined,
            google_map_url: googleMapUrl
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                サービス <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ジャンル <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={genreId}
                onChange={(e) => setGenreId(e.target.value)}
                disabled={!serviceId}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {serviceId ? '選択してください' : 'サービスを先に選択してください'}
                </option>
                {serviceId && genres
                  .filter((genre) => genre.service_id === Number(serviceId))
                  .map((genre) => (
                    <option key={genre.id} value={genre.id}>
                      {genre.name}
                    </option>
                  ))}
              </select>
            </div>

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

            <div className="md:col-span-2 relative" ref={companyDropdownRef}>
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
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={star}
                onChange={(e) => setStar(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                レビュー数
              </label>
              <input
                type="number"
                min="0"
                value={userReviewCount}
                onChange={(e) => setUserReviewCount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
                          <Image
                            src={existingImage.publicUrl}
                            alt={`画像 ${displayOrder}`}
                            fill
                            className="object-cover"
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
