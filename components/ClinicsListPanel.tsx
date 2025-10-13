'use client'

import { useState } from 'react'
import type { Facility } from '@/types/facility'
import ClinicCard from './ClinicCard'

interface ClinicsListPanelProps {
  facilities: Facility[]
}

export default function ClinicsListPanel({ facilities }: ClinicsListPanelProps) {
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
            <ClinicCard
              key={facility.id}
              facility={facility}
              isHovered={hoveredCard === facility.id}
              onMouseEnter={() => setHoveredCard(facility.id)}
              onMouseLeave={() => setHoveredCard(null)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}