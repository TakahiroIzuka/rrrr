'use client'

import { useState } from 'react'
import ClinicCardLite from './ClinicCardLite'

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

interface ClinicListProps {
  clinics: Clinic[]
  title?: string
  subtitle?: string
  width?: 'full' | '3/4'
  gridCols?: '2' | '5'
}

export default function ClinicList({
  clinics,
  title = 'リストで絞り込み検索結果一覧はこちら',
  subtitle = 'List Search',
  width = '3/4',
  gridCols = '5'
}: ClinicListProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  const widthClass = width === 'full' ? 'w-full' : 'w-full md:w-3/4'
  const gridColsClass = gridCols === '2' ? 'grid-cols-2 md:grid-cols-5' : 'grid-cols-5'

  return (
    <div className={`${widthClass} bg-white rounded-2xl md:rounded-lg px-[5px] md:p-5 py-5 shadow-none md:shadow-md`}>
      {/* Section Header */}
      <div className="text-left mb-6">
        <h2 className="text-base md:text-xl font-bold text-gray-700 mb-4">
          {title}
        </h2>
        <div className="flex items-center gap-3">
          <div className="w-8 h-1" style={{ backgroundColor: '#a3977d' }}></div>
          <p className="text-l font-bold" style={{ color: '#a3977d', letterSpacing: '0.4rem' }}>{subtitle}</p>
        </div>
      </div>

      {/* Clinics Grid */}
      <div className={`grid ${gridColsClass} gap-x-[5px] gap-y-4 md:gap-4`}>
        {clinics.map((clinic) => (
          <ClinicCardLite
            key={`clinic-${clinic.id}`}
            clinic={clinic}
            isHovered={hoveredCard === clinic.id}
            onMouseEnter={() => setHoveredCard(clinic.id)}
            onMouseLeave={() => setHoveredCard(null)}
          />
        ))}
      </div>
    </div>
  )
}
