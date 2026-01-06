'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface ServiceData {
  id: number
  name: string
}

interface ReviewCheckTaskData {
  id: number
  status: string
}

interface ReviewCheckData {
  id: number
  facility_id: number
  reviewer_name: string | null
  google_account_name: string | null
  email: string | null
  review_url: string | null
  review_star: number | null
  is_approved: boolean
  is_giftcode_sent: boolean
  gift_code_status?: string | null
  created_at: string
  facility?: {
    id: number
    service_id: number
    detail?: { name: string }[]
  }
  tasks?: ReviewCheckTaskData[]
}

// ギフトコードステータスを表示用に変換する関数
function getGiftCodeStatusDisplay(status: string | null | undefined, isGiftcodeSent: boolean): { label: string; color: string } {
  // 後方互換性: gift_code_statusがない場合はis_giftcode_sentを使用
  if (!status) {
    return isGiftcodeSent
      ? { label: '送信済', color: 'bg-green-100 text-green-800' }
      : { label: '未送信', color: 'bg-gray-100 text-gray-800' }
  }

  switch (status) {
    case 'sent':
      return { label: '送信済', color: 'bg-green-100 text-green-800' }
    case 'out_of_stock':
      return { label: '在庫無', color: 'bg-red-100 text-red-800' }
    case 'not_configured':
      return { label: '未設定', color: 'bg-orange-100 text-orange-800' }
    case 'unsent':
    default:
      return { label: '未送信', color: 'bg-gray-100 text-gray-800' }
  }
}

interface ReviewChecksListProps {
  services: ServiceData[]
  reviewChecks: ReviewCheckData[]
  showNewButton?: boolean
}

// 投稿確認ステータスを計算する関数
function getConfirmationStatus(tasks?: ReviewCheckTaskData[]): { label: string; color: string } {
  if (!tasks || tasks.length === 0) {
    return { label: '確認中', color: 'bg-yellow-100 text-yellow-800' }
  }

  const statuses = tasks.map(t => t.status)

  // どちらかがconfirmedの場合 => 成功
  if (statuses.some(s => s === 'confirmed')) {
    return { label: '成功', color: 'bg-green-100 text-green-800' }
  }

  // 両方がalready_confirmedの場合 => 既出
  if (statuses.length >= 2 && statuses.every(s => s === 'already_confirmed')) {
    return { label: '既出', color: 'bg-blue-100 text-blue-800' }
  }

  // 両方がfailedの場合 => 失敗
  if (statuses.length >= 2 && statuses.every(s => s === 'failed')) {
    return { label: '失敗', color: 'bg-red-100 text-red-800' }
  }

  // 上記以外 => 確認中
  return { label: '確認中', color: 'bg-yellow-100 text-yellow-800' }
}

export default function ReviewChecksList({ services, reviewChecks, showNewButton = false }: ReviewChecksListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get service ID from URL or use first service
  const serviceIdFromUrl = searchParams.get('service')
  const initialServiceId = serviceIdFromUrl
    ? parseInt(serviceIdFromUrl)
    : services[0]?.id || 1

  const [selectedServiceId, setSelectedServiceId] = useState<number>(initialServiceId)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Update selectedServiceId when URL changes
  useEffect(() => {
    if (serviceIdFromUrl) {
      const parsedId = parseInt(serviceIdFromUrl)
      if (services.some(s => s.id === parsedId)) {
        setSelectedServiceId(parsedId)
      }
    }
  }, [serviceIdFromUrl, services])

  // Update selectedServiceId when services changes
  useEffect(() => {
    if (services.length > 0 && !services.some(s => s.id === selectedServiceId)) {
      setSelectedServiceId(services[0]?.id || 1)
    }
  }, [services, selectedServiceId])

  const handleServiceChange = (serviceId: number) => {
    setSelectedServiceId(serviceId)
    router.push(`/management/reviews?service=${serviceId}`, { scroll: false })
  }

  const filteredReviewChecks = reviewChecks.filter(r => r.facility?.service_id === selectedServiceId)

  const handleDelete = async (id: number) => {
    if (!confirm('このクチコミを削除してもよろしいですか？')) {
      return
    }

    setDeletingId(id)
    try {
      const supabase = createClient()

      // 先に review_check_tasks から関連レコードを削除
      const { error: tasksError } = await supabase
        .from('review_check_tasks')
        .delete()
        .eq('review_check_id', id)

      if (tasksError) throw tasksError

      // その後 review_checks を削除
      const { error } = await supabase
        .from('review_checks')
        .delete()
        .eq('id', id)

      if (error) throw error

      alert('クチコミを削除しました')
      router.refresh()
    } catch (error) {
      console.error('Error deleting review check:', error)
      alert('削除に失敗しました')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Service Tabs */}
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

      {/* Review Checks Table */}
      <div className="bg-white rounded shadow border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-base font-semibold text-gray-900">
            クチコミ一覧 ({filteredReviewChecks.length}件)
          </h2>
          {showNewButton && (
            <Link
              href={`/management/reviews/new?serviceId=${selectedServiceId}`}
              className="px-4 py-2 bg-[#2271b1] text-white rounded text-sm hover:bg-[#135e96] transition-colors font-medium"
            >
              新規登録
            </Link>
          )}
        </div>

        {filteredReviewChecks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">編集</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">施設名</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">投稿者名</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Googleアカウント</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">メールアドレス</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">評価</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">投稿確認</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">施設承認</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">コード送信</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">登録日</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">削除</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReviewChecks.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/management/reviews/${review.id}/edit`}
                        className="text-[#2271b1] hover:text-[#135e96] font-medium"
                      >
                        編集
                      </Link>
                    </td>
                    <td className="px-4 py-3">{review.id}</td>
                    <td className="px-4 py-3">
                      {review.facility?.detail?.[0]?.name || '-'}
                    </td>
                    <td className="px-4 py-3">{review.reviewer_name || '-'}</td>
                    <td className="px-4 py-3">{review.google_account_name || '-'}</td>
                    <td className="px-4 py-3">{review.email || '-'}</td>
                    <td className="px-4 py-3">
                      {review.review_star ? `${review.review_star}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const status = getConfirmationStatus(review.tasks)
                        return (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        )
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        review.is_approved ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {review.is_approved ? '承認済み' : '未承認'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const status = getGiftCodeStatusDisplay(review.gift_code_status, review.is_giftcode_sent)
                        return (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        )
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(review.created_at).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(review.id)}
                        disabled={deletingId === review.id}
                        className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                      >
                        {deletingId === review.id ? '削除中...' : '削除'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-600">
              クチコミデータがありません。
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
