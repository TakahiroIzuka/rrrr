'use client'

import { useState, useEffect } from 'react'
import { REVIEW_RANKING_CONFIG } from '@/lib/constants/services'
import { useServiceCode } from '@/contexts/ServiceContext'

interface FooterProps {
  pageType?: 'top' | 'list' | 'detail' | 'genre-top'
  genreCode?: string
}

export default function Footer({ pageType = 'top', genreCode }: FooterProps) {
  const serviceCode = useServiceCode()
  const [footerImagePath, setFooterImagePath] = useState<string>(`/${serviceCode}/default/logo_footer.png`)

  const config = REVIEW_RANKING_CONFIG[serviceCode as keyof typeof REVIEW_RANKING_CONFIG]
  const { buttonText, serviceName } = config

  // 画像の存在チェック
  useEffect(() => {
    // pageTypeがdetailまたはgenre-topで、genreCodeがある場合のみチェック
    if ((pageType === 'detail' || pageType === 'genre-top') && genreCode) {
      // REVIEW_RANKING_CONFIGのgenresにgenreCodeが定義されているかチェック
      const genreConfig = config.genres?.[genreCode as keyof typeof config.genres]
      if (genreConfig) {
        const genreSpecificPath = `/${serviceCode}/${genreCode}/logo_footer.png`

        // 画像の存在を確認
        const img = new Image()
        img.onload = () => {
          // 画像が存在する場合、ジャンル固有のパスを使用
          setFooterImagePath(genreSpecificPath)
        }
        img.onerror = () => {
          // 画像が存在しない場合、デフォルトのパスを使用（初期値と同じ）
          setFooterImagePath(`/${serviceCode}/default/logo_footer.png`)
        }
        img.src = genreSpecificPath
      }
    }
  }, [serviceCode, pageType, genreCode, config])

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