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

interface ReviewCheckTaskData {
  id: number
  status: string
}

interface ReviewCheckData {
  id?: number
  facility_id?: number
  reviewer_name?: string
  google_account_name?: string
  email?: string
  review_url?: string
  review_star?: number
  is_approved?: boolean
  is_giftcode_sent?: boolean
}

// 投稿確認ステータスの選択肢
const CONFIRMATION_STATUS_OPTIONS = [
  { value: 'pending', label: '確認中' },
  { value: 'confirmed', label: '成功' },
  { value: 'already_confirmed', label: '既出' },
  { value: 'failed', label: '失敗' },
] as const

type ConfirmationStatusValue = typeof CONFIRMATION_STATUS_OPTIONS[number]['value']

// tasksから投稿確認ステータスを計算
function getConfirmationStatusFromTasks(tasks?: ReviewCheckTaskData[]): ConfirmationStatusValue {
  if (!tasks || tasks.length === 0) {
    return 'pending'
  }

  const statuses = tasks.map(t => t.status)

  // どちらかがconfirmedの場合 => 成功
  if (statuses.some(s => s === 'confirmed')) {
    return 'confirmed'
  }

  // 両方がalready_confirmedの場合 => 既出
  if (statuses.length >= 2 && statuses.every(s => s === 'already_confirmed')) {
    return 'already_confirmed'
  }

  // 両方がfailedの場合 => 失敗
  if (statuses.length >= 2 && statuses.every(s => s === 'failed')) {
    return 'failed'
  }

  // 上記以外 => 確認中
  return 'pending'
}

interface ReviewCheckFormProps {
  services: Service[]
  facilities: Facility[]
  initialData?: ReviewCheckData
  defaultServiceId?: number
  tasks?: ReviewCheckTaskData[]
}

export default function ReviewCheckForm({
  services,
  facilities,
  initialData,
  defaultServiceId,
  tasks
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
  const [serviceId] = useState<number | string>(getInitialServiceId())
  const [facilityId, setFacilityId] = useState(initialData?.facility_id || '')
  const [reviewerName, setReviewerName] = useState(initialData?.reviewer_name || '')
  const [googleAccountName, setGoogleAccountName] = useState(initialData?.google_account_name || '')
  const [email, setEmail] = useState(initialData?.email || '')
  const [reviewUrl, setReviewUrl] = useState(initialData?.review_url || '')
  const [reviewStar, setReviewStar] = useState(initialData?.review_star || '')
  const [isApproved, setIsApproved] = useState(initialData?.is_approved || false)
  const [isGiftcodeSent, setIsGiftcodeSent] = useState(initialData?.is_giftcode_sent || false)
  const [confirmationStatus, setConfirmationStatus] = useState<ConfirmationStatusValue>(
    getConfirmationStatusFromTasks(tasks)
  )

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

        // Update tasks status if tasks exist
        if (tasks && tasks.length > 0) {
          const { error: tasksError } = await supabase
            .from('review_check_tasks')
            .update({ status: confirmationStatus })
            .eq('review_check_id', initialData.id)

          if (tasksError) {
            console.error('Error updating tasks:', tasksError)
          }
        }

        alert('クチコミを更新しました')
      } else {
        // Insert new
        const { error } = await supabase
          .from('review_checks')
          .insert(reviewData)

        if (error) throw error
        alert('クチコミを登録しました')
      }

      router.push(`/management/reviews?service=${serviceId}`)
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

        {/* Confirmation Status (edit only) */}
        {initialData?.id && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              投稿確認
            </label>
            <select
              value={confirmationStatus}
              onChange={(e) => setConfirmationStatus(e.target.value as ConfirmationStatusValue)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CONFIRMATION_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {(!tasks || tasks.length === 0) && (
              <p className="mt-1 text-xs text-gray-500">
                ※ タスクが未作成のため、保存しても反映されません
              </p>
            )}
          </div>
        )}

        {/* Status Checkboxes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            ステータス
          </label>
          <div className="space-y-3">
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
            onClick={() => router.push(`/management/reviews?service=${serviceId}`)}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors font-medium"
          >
            キャンセル
          </button>
        </div>
      </div>
    </form>
  )
}
