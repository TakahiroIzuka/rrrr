'use client'

interface DetailFooterProps {
  genreId: number
}

const getGenreLogoPath = (genreId: number): string => {
  switch (genreId) {
    case 1:
      return '/mrr/pilates/logo_footer.png'
    case 2:
      return '/mrr/medical/logo_footer.png'
    case 5:
      return '/mrr/dermatology/logo_footer.png'
    default:
      return '/mrr/medical/logo_footer.png'
  }
}

export default function DetailFooter({ genreId }: DetailFooterProps) {
  const logoPath = getGenreLogoPath(genreId)

  return (
    <footer className="bg-[#eae3db] mx-0 md:mx-[15px] mb-0 md:mb-[15px] mt-0 md:mt-[15px] pt-[25px] pb-4 text-center md:rounded-lg">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <img src={logoPath} alt="Medical Review Ranking" className="h-20 md:h-32" />
      </div>

      {/* Request Button */}
      <div className="flex justify-center mb-6">
        <button
          className="bg-[#a69a7e] text-white px-6 py-3 md:px-8 md:py-3.5 rounded-full border-0 text-sm font-normal cursor-pointer transition-all duration-300 hover:bg-[#666] group flex items-center justify-center gap-2"
          onClick={() => {
            // TODO: 掲載リクエストページへのリンクまたはフォーム表示
            alert('掲載リクエストフォームを実装予定です')
          }}
        >
        <span className="transition-transform duration-300 group-hover:scale-x-105 inline-block">クリニック・施設の掲載リクエストはこちら</span>
        </button>
      </div>

      {/* Copyright */}
      <div>
        <p className="m-0 text-xs md:text-[10px]" style={{ color: '#999' }}>
          <span className="md:hidden">
            Copyright © Medical Review Ranking<br />
            All Rights Reserved.
          </span>
          <span className="hidden md:inline">
            Copyright © Medical Review Ranking All Rights Reserved.
          </span>
        </p>
      </div>
    </footer>
  )
}
