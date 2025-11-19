'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Service {
  id: number
  name: string
}

interface Facility {
  id: number
  service_id: number
  detail?: { name: string }[]
}

interface ReviewCheckData {
  id?: number
  facility_id?: number
  reviewer_name?: string
  google_account_name?: string
  email?: string
  review_url?: string
  review_star?: number
  is_sent?: boolean
  is_approved?: boolean
  is_giftcode_sent?: boolean
}

interface ReviewCheckFormProps {
  services: Service[]
  facilities: Facility[]
  initialData?: ReviewCheckData
  defaultServiceId?: number
}

export default function ReviewCheckForm({
  services,
  facilities,
  initialData,
  defaultServiceId
}: ReviewCheckFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get initial service_id from facility if editing, or from defaultServiceId
  const getInitialServiceId = () => {
    if (initialData?.facility_id) {
      const facility = facilities.find(f => f.id === initialData.facility_id)
      return facility?.service_id || services[0]?.id || ''
    }
    if (defaultServiceId) {
      return defaultServiceId
    }
    return services[0]?.id || ''
  }

  // Form fields
  const [serviceId, setServiceId] = useState<number | string>(getInitialServiceId())
  const [facilityId, setFacilityId] = useState(initialData?.facility_id || '')
  const [reviewerName, setReviewerName] = useState(initialData?.reviewer_name || '')
  const [googleAccountName, setGoogleAccountName] = useState(initialData?.google_account_name || '')
  const [email, setEmail] = useState(initialData?.email || '')
  const [reviewUrl, setReviewUrl] = useState(initialData?.review_url || '')
  const [reviewStar, setReviewStar] = useState(initialData?.review_star || '')
  const [isSent, setIsSent] = useState(initialData?.is_sent || false)
  const [isApproved, setIsApproved] = useState(initialData?.is_approved || false)
  const [isGiftcodeSent, setIsGiftcodeSent] = useState(initialData?.is_giftcode_sent || false)

  // Filter facilities by selected service
  const filteredFacilities = facilities.filter(f => f.service_id === Number(serviceId))

  // Reset facility selection when service changes
  useEffect(() => {
    if (serviceId && facilityId) {
      const selectedFacility = facilities.find(f => f.id === Number(facilityId))
      if (selectedFacility && selectedFacility.service_id !== Number(serviceId)) {
        setFacilityId('')
      }
    }
  }, [serviceId, facilityId, facilities])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()

      const reviewData = {
        facility_id: parseInt(String(facilityId)),
        reviewer_name: reviewerName || null,
        google_account_name: googleAccountName || null,
        email: email || null,
        review_url: reviewUrl || null,
        review_star: reviewStar ? parseFloat(String(reviewStar)) : null,
        is_sent: isSent,
        is_approved: isApproved,
        is_giftcode_sent: isGiftcodeSent
      }

      if (initialData?.id) {
        // Update existing
        const { error } = await supabase
          .from('review_checks')
          .update(reviewData)
          .eq('id', initialData.id)

        if (error) throw error
        alert('クチコミを更新しました')
      } else {
        // Insert new
        const { error } = await supabase
          .from('review_checks')
          .insert(reviewData)

        if (error) throw error
        alert('クチコミを登録しました')
      }

      router.push('/management/reviews')
      router.refresh()
    } catch (error) {
      console.error('Error saving review check:', error)
      alert('保存に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded shadow border border-gray-200 p-6 max-w-2xl">
      <div className="space-y-6">
        {/* Facility Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            施設 <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={facilityId}
            onChange={(e) => setFacilityId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">選択してください</option>
            {filteredFacilities.map((facility) => (
              <option key={facility.id} value={facility.id}>
                {facility.detail?.[0]?.name || `施設ID: ${facility.id}`}
              </option>
            ))}
          </select>
        </div>

        {/* Reviewer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              投稿者名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Googleアカウント名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={googleAccountName}
              onChange={(e) => setGoogleAccountName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Review Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              レビューURL
            </label>
            <input
              type="url"
              value={reviewUrl}
              onChange={(e) => setReviewUrl(e.target.value)}
              placeholder="https://..."
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
              value={reviewStar}
              onChange={(e) => setReviewStar(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Status Checkboxes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            ステータス
          </label>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isSent}
                onChange={(e) => setIsSent(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">送信済み</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isApproved}
                onChange={(e) => setIsApproved(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">承認済み</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isGiftcodeSent}
                onChange={(e) => setIsGiftcodeSent(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">ギフトコード送付済み</span>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-[#2271b1] text-white rounded text-sm hover:bg-[#135e96] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSubmitting ? '保存中...' : (initialData?.id ? '更新' : '登録')}
          </button>
          <button
            type="button"
            onClick={() => router.push('/management/reviews')}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors font-medium"
          >
            キャンセル
          </button>
        </div>
      </div>
    </form>
  )
}
