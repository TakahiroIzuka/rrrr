'use client'

import { useState, useEffect } from 'react'
import type { Facility } from '@/types/facility'
import { getStarImage } from '@/lib/utils/starRating'

interface Review {
  reviewerName: string
  text: string
  stars: number
  publishedAt: string
  reviewImageUrls: string[]
  reviewUrl: string | null
  reviewerPhotoUrl: string | null
  reviewerUrl: string | null
}

interface ReviewSectionProps {
  facility: Facility
  genreColor: string
}

// ReviewCard for facility summary (first card)
function FacilitySummaryCard({ facility }: { facility: Facility }) {
  return (
    <div className="bg-white rounded p-3 h-52 flex flex-col shadow-md">
      <div className="flex gap-3 mb-3 relative">
        <img
          src="https://placehold.co/100x100/e3d5ca/000000?text=User"
          alt="ユーザー画像"
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0 self-center">
          <p className="font-medium text-sm">{facility.name}</p>
        </div>
        <img src="/common/google-logo.svg" alt="Google" className="h-4 flex-shrink-0 self-start" />
      </div>
      <div>
        <img
          src={facility.star !== null ? getStarImage(facility.star) : '/common/star_0.5.png'}
          alt={facility.star !== null ? `${facility.star}星評価` : '評価なし'}
          className="w-23 h-4 mb-2"
        />
        <div className="text-sm text-gray-700 font-bold">
          評価平均 <span className="text-lg font-bold" style={{ color: 'rgb(166, 154, 126)' }}>{facility.star ?? ''}</span> / 評価人数 <span className="text-lg font-bold" style={{ color: 'rgb(166, 154, 126)' }}>{facility.user_review_count}</span>人
        </div>
      </div>
      {facility.google_map_url ? (
        <a
          href={facility.google_map_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full mt-3 px-4 py-2 rounded text-white text-sm font-medium flex items-center justify-center gap-2"
          style={{ backgroundColor: 'rgb(10, 108, 255)' }}
        >
          クチコミ投稿はこちらから
          <span className="flex items-center justify-center w-5 h-5 bg-white rounded-full flex-shrink-0">
            <span className="font-bold text-base leading-none" style={{ color: 'rgb(10, 108, 255)', transform: 'translate(0.5px, -1px)' }}>›</span>
          </span>
        </a>
      ) : (
        <button
          className="w-full mt-3 px-4 py-2 rounded text-white text-sm font-medium flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
          style={{ backgroundColor: 'rgb(10, 108, 255)' }}
        >
          クチコミ投稿はこちらから
          <span className="flex items-center justify-center w-5 h-5 bg-white rounded-full flex-shrink-0">
            <span className="font-bold text-base leading-none" style={{ color: 'rgb(10, 108, 255)', transform: 'translate(0.5px, -1px)' }}>›</span>
          </span>
        </button>
      )}
    </div>
  )
}

// ReviewCard for individual reviews
function UserReviewCard({ review }: { review: Review }) {
  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
    } catch {
      return dateStr
    }
  }

  // Truncate text
  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  // Reviewer avatar with optional link
  const avatarContent = review.reviewerPhotoUrl ? (
    <img
      src={review.reviewerPhotoUrl}
      alt={review.reviewerName}
      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
    />
  ) : (
    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 text-gray-600 font-bold">
      {review.reviewerName.charAt(0).toUpperCase()}
    </div>
  )

  return (
    <div className="bg-white rounded p-3 h-52 flex flex-col shadow-md">
      <div className="flex gap-3 mb-3 relative">
        {review.reviewerUrl ? (
          <a href={review.reviewerUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            {avatarContent}
          </a>
        ) : (
          avatarContent
        )}
        <div className="flex-1 min-w-0 self-start">
          <p className="font-medium text-sm mb-1">{review.reviewerName}</p>
          <p className="text-xs text-gray-500">{formatDate(review.publishedAt)}</p>
        </div>
        <img src="/common/google-logo.svg" alt="Google" className="h-4 flex-shrink-0 self-start" />
      </div>
      <div className="flex-1 overflow-hidden">
        <img
          src={review.stars ? getStarImage(review.stars) : '/common/star_0.5.png'}
          alt={`${review.stars}星評価`}
          className="w-23 h-4 mb-2"
        />
        <div className="text-xs text-gray-700 overflow-hidden">
          {truncateText(review.text)}
        </div>
      </div>
    </div>
  )
}

// Loading skeleton
function ReviewCardSkeleton() {
  return (
    <div className="bg-white rounded p-3 h-52 flex flex-col shadow-md animate-pulse">
      <div className="flex gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="h-3 bg-gray-200 rounded w-4/6" />
      </div>
    </div>
  )
}

export default function ReviewSection({ facility, genreColor }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true)
        setError(null)

        // Phase 1: Google Places APIから高速に5件取得
        const placesResponse = await fetch(`/api/facilities/${facility.id}/reviews?source=places`)
        if (placesResponse.ok) {
          const placesData = await placesResponse.json()
          if (placesData.reviews && placesData.reviews.length > 0) {
            setReviews(placesData.reviews)
          }
        }
        setLoading(false)

        // Phase 2: Apifyから追加レビューを取得（バックグラウンド）
        setLoadingMore(true)
        const apifyResponse = await fetch(`/api/facilities/${facility.id}/reviews?source=apify`)
        if (apifyResponse.ok) {
          const apifyData = await apifyResponse.json()
          if (apifyData.reviews && apifyData.reviews.length > 0) {
            setReviews(apifyData.reviews)
          }
        }
        setLoadingMore(false)
      } catch (err) {
        console.error('Error fetching reviews:', err)
        setError('クチコミの取得に失敗しました')
        setLoading(false)
        setLoadingMore(false)
      }
    }

    fetchReviews()
  }, [facility.id])

  return (
    <div id="review-section" className="mb-2 p-4 rounded-lg" style={{ backgroundColor: 'rgb(255, 249, 240)', marginLeft: '3px', marginRight: '3px' }}>
      {/* バー */}
      <div className="relative mb-4">
        <div className="w-full px-4 py-2 text-sm border-2 rounded text-center bg-white" style={{ borderColor: genreColor, color: genreColor }}>
          {facility.name}のクチコミ一覧はこちら！
        </div>
        {/* 下向き三角形 */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[12px] border-l-transparent border-r-transparent" style={{ borderTopColor: genreColor }}></div>
      </div>

      {/* カードグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5 mt-6 p-0 md:px-[15px]">
        {/* First card: Facility summary */}
        <FacilitySummaryCard facility={facility} />

        {/* Review cards */}
        {loading ? (
          // Loading skeletons (show 8 while loading)
          Array.from({ length: 8 }).map((_, index) => (
            <ReviewCardSkeleton key={index} />
          ))
        ) : error ? (
          // Error state
          <div className="md:col-span-2 flex items-center justify-center text-gray-500">
            {error}
          </div>
        ) : reviews.length > 0 ? (
          // Actual reviews (show all up to 50)
          reviews.map((review, index) => (
            <UserReviewCard key={index} review={review} />
          ))
        ) : (
          // No reviews
          <div className="md:col-span-2 flex items-center justify-center text-gray-500 py-8">
            クチコミはまだありません
          </div>
        )}
      </div>

      {/* Apify読み込み中のスピナー */}
      {loadingMore && (
        <div className="flex items-center justify-center gap-2 py-4 text-gray-500">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm">追加のクチコミを読み込み中...</span>
        </div>
      )}
    </div>
  )
}
