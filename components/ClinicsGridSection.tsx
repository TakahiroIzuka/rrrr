'use client'

import { useState } from 'react'

interface Clinic {
  id: number
  name: string
  star: number | null
  user_review_count: number
  lat: number
  lng: number
  prefecture: string
  area: string
  genre_id: number
}

interface ClinicsGridSectionProps {
  clinics: Clinic[]
}

export default function ClinicsGridSection({ clinics }: ClinicsGridSectionProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  return (
    <section className="bg-slate-50 py-16 px-8 border-t border-slate-200">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-700 mb-4" style={{ fontFamily: "'Kosugi Maru', sans-serif" }}>
            リストで絞り込み検索結果一覧はこちら
          </h2>
        </div>

        {/* Clinics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {clinics.map((clinic) => (
            <div
              key={clinic.id}
              className={`bg-white border border-slate-200 rounded-xl p-6 cursor-pointer relative overflow-hidden transition-all duration-300 ${
                hoveredCard === clinic.id
                  ? 'shadow-xl -translate-y-1'
                  : 'shadow-sm hover:shadow-md'
              }`}
              onMouseEnter={() => setHoveredCard(clinic.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Genre Badge */}
              <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${
                clinic.genre_id === 1
                  ? 'bg-indigo-100 text-indigo-700'
                  : clinic.genre_id === 2
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {clinic.genre_id === 1 ? 'ピラティス' : clinic.genre_id === 2 ? '内科' : '皮膚科'}
              </div>

              {/* Clinic Name */}
              <h3 className="text-gray-700 text-lg font-semibold leading-tight mb-3 pr-16">
                {clinic.name}
              </h3>

              {/* Location */}
              <div className="flex items-center mb-3 gap-2">
                <span className="text-gray-400 text-sm">📍</span>
                <span className="text-gray-600 text-sm">
                  {clinic.prefecture} {clinic.area}
                </span>
              </div>

              {/* Rating */}
              {clinic.star !== null ? (
                <div className="flex items-center mb-4 gap-2">
                  <span className="text-gray-400 text-sm">⭐</span>
                  <span className="text-orange-400 font-bold text-base">
                    {clinic.star}
                  </span>
                  <span className="text-gray-400 text-sm">
                    ({clinic.user_review_count}件)
                  </span>
                </div>
              ) : (
                <div className="flex items-center mb-4 gap-2">
                  <span className="text-gray-400 text-sm">⭐</span>
                  <span className="text-gray-300 text-sm">
                    レビューなし
                  </span>
                </div>
              )}

              {/* Action Button */}
              <div className="border-t border-slate-100 pt-4 text-center">
                <button
                  className={`w-full py-2 px-4 rounded-md text-sm font-semibold transition-all duration-200 ${
                    hoveredCard === clinic.id
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-200 text-gray-600 hover:bg-slate-300'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    alert(`${clinic.name}の詳細を表示（実装予定）`)
                  }}
                >
                  詳細を見る
                </button>
              </div>

              {/* ID Info */}
              <div className="absolute bottom-2 left-3 text-xs text-slate-300">
                ID: {clinic.id}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}