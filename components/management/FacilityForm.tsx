'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface MasterData {
  id: number
  name: string
  code?: string
}

interface FacilityFormProps {
  services: MasterData[]
  genres: MasterData[]
  prefectures: MasterData[]
  areas: MasterData[]
  companies: MasterData[]
  initialData?: any
}

export default function FacilityForm({
  services,
  genres,
  prefectures,
  areas,
  companies,
  initialData
}: FacilityFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Facility fields
  const [serviceId, setServiceId] = useState(initialData?.service_id || '')
  const [genreId, setGenreId] = useState(initialData?.genre_id || '')
  const [prefectureId, setPrefectureId] = useState(initialData?.prefecture_id || '')
  const [areaId, setAreaId] = useState(initialData?.area_id || '')
  const [companyId, setCompanyId] = useState(initialData?.company_id || '')

  // Detail fields
  const detail = initialData?.detail?.[0] || initialData?.detail || {}
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()

      if (initialData) {
        // Update existing facility
        const { error: facilityError } = await supabase
          .from('facilities')
          .update({
            service_id: parseInt(serviceId),
            genre_id: parseInt(genreId),
            prefecture_id: parseInt(prefectureId),
            area_id: parseInt(areaId),
            company_id: companyId ? parseInt(companyId) : null
          })
          .eq('id', initialData.id)

        if (facilityError) throw facilityError

        // Update facility_details
        const { error: detailError } = await supabase
          .from('facility_details')
          .update({
            name,
            star: star ? parseFloat(star) : null,
            user_review_count: userReviewCount ? parseInt(userReviewCount) : 0,
            lat: lat ? parseFloat(lat) : 0,
            lng: lng ? parseFloat(lng) : 0,
            site_url: siteUrl || null,
            postal_code: postalCode || null,
            address: address || null,
            tel: tel || null,
            google_map_url: googleMapUrl || null
          })
          .eq('facility_id', initialData.id)

        if (detailError) throw detailError

        alert('施設を更新しました')
      } else {
        // Insert new facility
        const { data: facility, error: facilityError } = await supabase
          .from('facilities')
          .insert({
            service_id: parseInt(serviceId),
            genre_id: parseInt(genreId),
            prefecture_id: parseInt(prefectureId),
            area_id: parseInt(areaId),
            company_id: companyId ? parseInt(companyId) : null
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
            star: star ? parseFloat(star) : null,
            user_review_count: userReviewCount ? parseInt(userReviewCount) : 0,
            lat: lat ? parseFloat(lat) : 0,
            lng: lng ? parseFloat(lng) : 0,
            site_url: siteUrl || null,
            postal_code: postalCode || null,
            address: address || null,
            tel: tel || null,
            google_map_url: googleMapUrl || null
          })

        if (detailError) throw detailError

        alert('施設を追加しました')
      }

      router.push('/management/facilities')
      router.refresh()
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                {genres.map((genre) => (
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
                地域 <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={areaId}
                onChange={(e) => setAreaId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                会社
              </label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Google Map URL
              </label>
              <input
                type="url"
                value={googleMapUrl}
                onChange={(e) => setGoogleMapUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
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
            onClick={() => router.push('/management/facilities')}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors font-medium"
          >
            キャンセル
          </button>
        </div>
      </div>
    </form>
  )
}
