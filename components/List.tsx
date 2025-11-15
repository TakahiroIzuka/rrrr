'use client'

import { useState } from 'react'
import type { Facility } from '@/types/facility'
import CardLite from './CardLite'
import { useServiceCode } from '@/contexts/ServiceCodeContext'

interface FacilityImage {
  id: number
  facility_id: number
  image_path: string
  thumbnail_path: string | null
  display_order: number
  publicUrl: string
  thumbnailUrl: string | null
}

interface ListProps {
  facilities: Facility[]
  title?: string
  subtitle?: string
  width?: 'full' | '3/4'
  gridCols?: '2' | '5'
  imagesMap?: Record<number, FacilityImage[]>
}

export default function List({
  facilities,
  title = 'リストで絞り込み検索結果一覧はこちら',
  subtitle = 'List Search',
  width = '3/4',
  gridCols = '5',
  imagesMap = {}
}: ListProps) {
  const serviceCode = useServiceCode()
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
        {facilities.map((facility) => (
          <CardLite
            key={`facility-${facility.id}`}
            facility={facility}
            isHovered={hoveredCard === facility.id}
            onMouseEnter={() => setHoveredCard(facility.id)}
            onMouseLeave={() => setHoveredCard(null)}
            images={imagesMap[facility.id] || []}
          />
        ))}
      </div>
    </div>
  )
}
