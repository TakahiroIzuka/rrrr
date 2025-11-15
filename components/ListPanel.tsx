'use client'

import { useState } from 'react'
import type { Facility } from '@/types/facility'
import Card from './Card'
import { useServiceCode } from '@/contexts/ServiceContext'

interface FacilityImage {
  id: number
  facility_id: number
  image_path: string
  thumbnail_path: string | null
  display_order: number
  publicUrl: string
  thumbnailUrl: string | null
}

interface ListPanelProps {
  facilities: Facility[]
  imagesMap?: Record<number, FacilityImage[]>
}

export default function ListPanel({ facilities, imagesMap = {} }: ListPanelProps) {
  const serviceCode = useServiceCode()
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  return (
    <div className="h-full flex flex-col border-r border-gray-200">
      {/* Fixed Header */}
      <div className="flex-shrink-0 py-2 px-2 mt-4 mb-4" style={{ marginLeft: '20px', marginRight: '20px', backgroundColor: 'white' }}>
        <p className="m-0 text-black-500 text-sm text-center">
          該当するクリニック <strong className="text-lg" style={{ color: '#a3977d' }}>{facilities.length}</strong> 件
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto" style={{ paddingTop: '6px', paddingLeft: '16px', paddingRight: '16px', paddingBottom: '16px' }}>
        <div className="flex flex-col gap-4">
          {facilities.map((facility: Facility) => (
            <Card
              key={facility.id}
              facility={facility}
              isHovered={hoveredCard === facility.id}
              onMouseEnter={() => setHoveredCard(facility.id)}
              onMouseLeave={() => setHoveredCard(null)}
              images={imagesMap[facility.id] || []}
            />
          ))}
        </div>
      </div>
    </div>
  )
}