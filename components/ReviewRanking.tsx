'use client'

import { REVIEW_RANKING_CONFIG } from '@/lib/constants/services'
import { useServiceCode, useServiceName } from '@/contexts/ServiceContext'

interface ReviewRankingProps {
  variant?: 'mobile' | 'desktop'
}

export default function ReviewRanking({
  variant = 'desktop'
}: ReviewRankingProps) {
  const serviceCode = useServiceCode()
  const serviceName = useServiceName()
  const config = REVIEW_RANKING_CONFIG[serviceCode as keyof typeof REVIEW_RANKING_CONFIG]
  const iconImagePath = `${serviceCode}/icon.png`

  if (!config) {
    console.error(`No review ranking config found for service code: ${serviceCode}`)
    return null
  }

  const { buttonText } = config
  const isMobile = variant === 'mobile'

  const containerClass = isMobile
    ? 'md:hidden w-full bg-white rounded-2xl md:rounded-lg px-[5px] py-5 shadow-none md:shadow-md relative overflow-hidden'
    : 'bg-white rounded-lg pt-12 px-5 pb-5 shadow-md relative overflow-hidden'

  const buttonHoverClass = isMobile
    ? 'hover:bg-[#666]'
    : 'hover:bg-black'

  const buttonScaleClass = isMobile
    ? 'group-hover:scale-x-105'
    : 'group-hover:scale-x-110'

  return (
    <div className={containerClass}>
      {/* Background Image */}
      <div className="absolute top-0 left-0 w-full h-[33%] overflow-hidden rounded-t-lg">
        <img src="/common/icon-background.png" alt="" className="w-full h-full object-cover object-top" />
      </div>

      <img
        src={iconImagePath}
        alt="プロフィール"
        className="w-[95px] h-[95px] object-contain relative z-10 mx-auto mb-3"
      />

      <h3 className="text-base font-bold text-gray-700 mb-3 text-center">
        {serviceName}クチコミランキング
      </h3>

      <p className="text-xs text-gray-600 mb-4 leading-relaxed">
        {serviceName}クチコミランキングの評価基準は、Googleマップのクチコミ情報の数値（評価平均×評価人数=Ｘ）を算出して、ランキング順位を表示しております。 ※Googleマップのクチコミ情報は、ページを読み込む度に最新情報が同期されます。
      </p>

      <button className={`w-full py-3 px-4 bg-[#a59878] text-white text-xs font-bold rounded-full ${buttonHoverClass} transition-all duration-300 group flex items-center justify-center gap-2 relative`}>
        <span className={`transition-transform duration-300 ${buttonScaleClass} inline-block`}>
          {buttonText}
        </span>
        <span className="flex items-center justify-center w-4 h-4 bg-white rounded-full transition-all duration-300 group-hover:translate-x-2 flex-shrink-0">
          <span className="text-[#a59878] font-bold text-xl leading-none inline-block" style={{ transform: 'translate(0.5px, -2px)' }}>›</span>
        </span>
      </button>
    </div>
  )
}
