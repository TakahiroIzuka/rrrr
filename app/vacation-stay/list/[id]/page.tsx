import { notFound } from 'next/navigation'
import { getStarImage } from '@/lib/utils/starRating'
import Div2 from '@/components/facility/Div2'
import ReviewSection from '@/components/facility/ReviewSection'
import ScrollToReviewButton from '@/components/facility/ScrollToReviewButton'
import { fetchFacilityById, fetchFacilityImages } from '@/lib/data/facilities'
import { SERVICE_CODE } from '../../constants'
import { REVIEW_RANKING_CONFIG } from '@/lib/constants/services'

interface DetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function DetailPage({ params }: DetailPageProps) {
  const { id } = await params

  const { facility, error } = await fetchFacilityById(id, SERVICE_CODE)

  if (error || !facility) {
    notFound()
  }

  // Fetch facility images
  const { images } = await fetchFacilityImages(Number(id))

  // Get genre color from REVIEW_RANKING_CONFIG
  const config = REVIEW_RANKING_CONFIG[SERVICE_CODE]
  const genreCode = facility.genre?.code
  const genreColor = genreCode && config.genres && genreCode in config.genres
    ? (config.genres as Record<string, { color: string; lineColor: string }>)[genreCode].color
    : config.color

  return (
    <div className="mx-[10px] mb-[10px] pt-[10px] md:mx-20 md:pt-10 md:pb-24 md:mb-0">
      {/* コンテンツ */}
      <div className="bg-white rounded-xl shadow-lg p-[10px] md:p-[25px]">
        {/* div1 */}
        <div className="mb-2">
          <div className="flex flex-col md:flex-row gap-0 md:gap-4 pt-2 pb-0">
            {/* 左側 */}
            <div className="w-full md:w-[45%]">
              <h1 className="text-xl font-bold mb-3" style={{ fontFamily: 'Kosugi Maru, sans-serif' }}>{facility.name}</h1>

              <div className="flex items-center mb-2 gap-1.5 pb-2 border-b border-[#a59878]">
                <span className="text-gray-600 text-xs border border-gray-300 rounded px-2 py-0.5">
                  {facility.prefecture?.name}
                </span>
                <span className="text-gray-600 text-xs border border-gray-300 rounded px-2 py-0.5">
                  {facility.area?.name}
                </span>
              </div>

              <div className="mb-0 md:mb-3 pb-2 border-b border-[#a59878]">
                <div className="flex items-center gap-1.5 mb-1">
                  <img
                    src="/common/king-crown-icon.png"
                    alt="ランキング"
                    className="w-[18px] h-[18px]"
                  />
                  <span className="text-[#a69a7e] text-xs">クチコミ評価</span>
                  <img
                    src={facility.star !== null ? getStarImage(facility.star) : '/common/star_0.5.png'}
                    alt={facility.star !== null ? `${facility.star}星評価` : '評価なし'}
                    className="w-23 h-4"
                  />
                </div>
                <div className="text-black text-xs">
                  評価平均 <span className="text-[#a69a7e] font-normal text-2xl">{facility.star ?? ''}</span> / 評価人数 <span className="text-[#a69a7e] font-normal text-2xl">{facility.user_review_count}</span><span className="text-[#a69a7e] font-normal text-2xl">人</span>
                </div>
              </div>
            </div>
            {/* 右側 */}
            <div className="w-full md:w-[55%] flex flex-col">
              {/* バー */}
              <div className="relative mb-4 mt-2 hidden md:block">
                <div className="w-full px-4 py-2 text-sm border-2 rounded text-center" style={{ borderColor: genreColor, color: genreColor }}>
                  クチコミ投稿に是非ご協力ください！
                </div>
                {/* 下向き三角形 */}
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[12px] border-l-transparent border-r-transparent" style={{ borderTopColor: genreColor }}></div>
              </div>

              {/* ボタン */}
              <ScrollToReviewButton clinicName={facility.name} genreColor={genreColor} />
            </div>
          </div>

          {/* バー */}
          <div className="px-4 py-2 text-white text-sm rounded text-center" style={{ backgroundColor: 'rgb(163, 151, 125)' }}>
            Googleクチコミの情報は、常に最新情報が表示されています。
          </div>
        </div>

        {/* div2 */}
        <Div2 facility={facility} images={images || []} />

        {/* div3 */}
        <ReviewSection facility={facility} genreColor={genreColor} />

        {/* div4 */}
        <div className="p-4 flex justify-center">
          <a href={`/${SERVICE_CODE}`}>
            <button className="text-white text-sm w-64 md:w-[390px] h-12 md:h-[60px]" style={{ backgroundColor: 'rgb(163, 151, 125)' }}>
              戻る
            </button>
          </a>
        </div>
      </div>
    </div>
  )
}
