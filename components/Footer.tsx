'use client'

export default function Footer() {
  return (
    <footer className="bg-[#eae3db] mx-[15px] mb-[15px] mt-[15px] pt-[25px] pb-4 text-center rounded-lg">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <img src="/mrr/logo_footer.png" alt="Medical Review Ranking" className="h-32" />
      </div>

      {/* Request Button */}
      <div className="flex justify-center mb-6">
        <button
          className="bg-[#a69a7e] text-white px-8 py-3.5 rounded-full border-0 text-sm font-normal cursor-pointer transition-all duration-300 hover:bg-[#666] group flex items-center justify-center gap-2"
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
        <p className="m-0 text-[10px]" style={{ color: '#999' }}>
          Copyright © Medical Review Ranking All Rights Reserved.
        </p>
      </div>
    </footer>
  )
}