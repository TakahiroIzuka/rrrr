'use client'

export default function Footer() {
  return (
    <footer className="bg-[#eae3db] text-gray-600 px-8 py-8 pb-4 mt-auto">
      <div className="max-w-6xl mx-auto text-center">
        {/* Request Button */}
        <div className="mb-8">
          <button
            className="bg-indigo-500 text-white px-6 py-3 rounded-lg border-0 text-base font-semibold cursor-pointer transition-all duration-200 shadow-sm hover:bg-indigo-600 hover:-translate-y-0.5 hover:shadow-md"
            onClick={() => {
              // TODO: 掲載リクエストページへのリンクまたはフォーム表示
              alert('掲載リクエストフォームを実装予定です')
            }}
          >
            クリニック・施設の掲載リクエストはこちら
          </button>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-300 pt-4">
          <p className="m-0 text-sm text-gray-500 font-medium">
            Copyright © Medical Review Ranking All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}