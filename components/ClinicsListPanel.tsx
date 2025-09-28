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

interface ClinicsListPanelProps {
  clinics: Clinic[]
}

export default function ClinicsListPanel({ clinics }: ClinicsListPanelProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  return (
    <div className="h-full overflow-auto p-5 bg-gray-50 border-r border-gray-200">
      <h2 className="m-0 mb-5 text-gray-900 text-2xl font-bold">
        クリニック一覧
      </h2>

      <div className="bg-white py-3 px-4 rounded-lg mb-5 border border-gray-200">
        <p className="m-0 text-gray-500 text-sm">
          登録件数: <strong className="text-gray-900">{clinics.length}</strong>件
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {clinics.map((clinic: Clinic) => (
          <div
            key={clinic.id}
            className={`bg-white border border-gray-200 rounded-lg p-4 cursor-pointer transition-all duration-200 ease-in-out ${
              hoveredCard === clinic.id
                ? 'shadow-lg -translate-y-0.5'
                : 'shadow-sm hover:shadow-md'
            }`}
            onMouseEnter={() => setHoveredCard(clinic.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <h3 className="m-0 mb-3 text-gray-900 text-base font-semibold leading-snug">
              {clinic.name}
            </h3>

            <div className="flex items-center mb-2 gap-1.5">
              <span className="text-sm text-gray-500">📍</span>
              <span className="text-gray-600 text-sm">
                {clinic.prefecture} {clinic.area}
              </span>
            </div>

            {clinic.star !== null && (
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-gray-500">⭐</span>
                <span className="text-amber-500 font-semibold text-sm">
                  {clinic.star}
                </span>
                <span className="text-gray-500 text-xs">
                  ({clinic.user_review_count}件)
                </span>
              </div>
            )}

            {clinic.star === null && clinic.user_review_count === 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-gray-500">⭐</span>
                <span className="text-gray-400 text-xs">
                  レビューなし
                </span>
              </div>
            )}

            <div className="pt-3 mt-3 border-t border-gray-100 text-xs text-gray-400">
              ID: {clinic.id}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}