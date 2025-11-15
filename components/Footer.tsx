'use client'

import { REVIEW_RANKING_CONFIG } from '@/lib/constants/services'
import { useServiceCode } from '@/contexts/ServiceCodeContext'

interface FooterProps {
  pageType?: 'top' | 'list' | 'detail' | 'genre-top'
}

export default function Footer({ pageType = 'top' }: FooterProps) {
  const serviceCode = useServiceCode()

  const config = REVIEW_RANKING_CONFIG[serviceCode as keyof typeof REVIEW_RANKING_CONFIG]

  if (!config) {
    console.error(`No config found for service code: ${serviceCode}`)
    return null
  }

  const { footerImagePath, buttonText, serviceName } = config

  return (
    <div className="bg-white">
      <footer className="bg-[#eae3db] mx-0 md:mx-[15px] mb-0 md:mb-[15px] mt-0 md:mt-[15px] pt-[30px] pb-6 text-center md:rounded-lg">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={footerImagePath} alt="Medical Review Ranking" className="h-28 md:h-36" />
        </div>

        {/* Request Button */}
        <div className="flex justify-center mb-6">
          <button
            className="bg-[#a69a7e] text-white px-7 py-3.5 md:px-9 md:py-4 rounded-full border-0 text-sm md:text-base font-normal cursor-pointer transition-all duration-300 hover:bg-[#666] group flex items-center justify-center gap-2"
            onClick={() => {
              // TODO: 掲載リクエストページへのリンクまたはフォーム表示
              alert('掲載リクエストフォームを実装予定です')
            }}
          >
          <span className="transition-transform duration-300 group-hover:scale-x-105 inline-block">{buttonText}</span>
          </button>
        </div>

        {/* Copyright */}
        <div>
          <p className="m-0 text-xs md:text-[10px]" style={{ color: '#999' }}>
            <span className="md:hidden">
              Copyright © {serviceName}<br />
              All Rights Reserved.
            </span>
            <span className="hidden md:inline">
              Copyright © {serviceName} All Rights Reserved.
            </span>
          </p>
        </div>
      </footer>
    </div>
  )
}