import type { Facility } from '@/types/facility'
import { getStarImage } from '@/lib/utils/starRating'

interface ReviewCardProps {
  facility: Facility
  userImage: string
  showDate?: boolean
}

export default function ReviewCard({ facility, userImage, showDate = false }: ReviewCardProps) {
  return (
    <div className="bg-white rounded p-3 h-52 flex flex-col shadow-md">
      {/* 上段：画像、施設名、Googleロゴ */}
      <div className="flex gap-3 mb-3 relative">
        <img src={userImage} alt="ユーザー画像" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
        <div className={`flex-1 min-w-0 ${showDate ? 'self-start' : 'self-center'}`}>
          <p className={`font-medium text-sm ${showDate ? 'mb-1' : ''}`}>{showDate ? 'userA' : facility.name}</p>
          {showDate && (
            <p className="text-xs text-gray-500">{new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          )}
        </div>
        <img src="/common/google-logo.svg" alt="Google" className="h-4 flex-shrink-0 self-start" />
      </div>
      {/* 下段：星と評価情報 */}
      <div>
        <img
          src={facility.star !== null ? getStarImage(facility.star) : '/common/star_0.5.png'}
          alt={facility.star !== null ? `${facility.star}星評価` : '評価なし'}
          className="w-23 h-4 mb-2"
        />
        {!showDate && (
          <div className="text-sm text-gray-700 font-bold">
            評価平均 <span className="text-lg font-bold" style={{ color: 'rgb(166, 154, 126)' }}>{facility.star ?? ''}</span> / 評価人数 <span className="text-lg font-bold" style={{ color: 'rgb(166, 154, 126)' }}>{facility.user_review_count}</span>人
          </div>
        )}
        {showDate && (
          <div className="text-xs text-gray-700">
            テキストテキストテキストテキストテキストテキストテキストテキストテキスト
          </div>
        )}
      </div>
      {!showDate && (
        facility.google_map_url ? (
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
          <button className="w-full mt-3 px-4 py-2 rounded text-white text-sm font-medium flex items-center justify-center gap-2 opacity-50 cursor-not-allowed" style={{ backgroundColor: 'rgb(10, 108, 255)' }}>
            クチコミ投稿はこちらから
            <span className="flex items-center justify-center w-5 h-5 bg-white rounded-full flex-shrink-0">
              <span className="font-bold text-base leading-none" style={{ color: 'rgb(10, 108, 255)', transform: 'translate(0.5px, -1px)' }}>›</span>
            </span>
          </button>
        )
      )}
    </div>
  )
}
