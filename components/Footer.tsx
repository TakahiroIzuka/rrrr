'use client'

import { usePathname } from 'next/navigation'

interface FooterProps {
  imagePath: string
  buttonText: string
  type: string
}

export default function Footer({
  imagePath = '/mrr/default/logo_footer.png',
  buttonText = 'クリニック・施設の掲載リクエストはこちら',
  type = 'clinic'
}: FooterProps) {
  const pathname = usePathname()

  // 詳細ページかどうかを判定
  const isDetailPage = pathname?.startsWith('/clinics/') && pathname !== '/clinics' && !pathname?.startsWith('/clinic-')

  // 詳細ページの場合はFooterを表示しない
  if (isDetailPage) {
    return null
  }

  // typeに応じてサービス名を設定
  const serviceName =
    type === 'accomodation' ? 'Kuchikomiru.' :
    type === 'clinic' ? 'Medical Review Ranking' :
    'Rainmans'

  return (
    <footer className="bg-[#eae3db] mx-0 md:mx-[15px] mb-0 md:mb-[15px] mt-0 md:mt-[15px] pt-[30px] pb-6 text-center md:rounded-lg">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <img src={imagePath} alt="Medical Review Ranking" className="h-28 md:h-36" />
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
  )
}