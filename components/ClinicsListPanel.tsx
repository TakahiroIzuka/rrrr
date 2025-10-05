'use client'

import { useState } from 'react'
import type { Clinic } from '@/types/clinic'
import ClinicCard from './ClinicCard'

interface ClinicsListPanelProps {
  clinics: Clinic[]
}

export default function ClinicsListPanel({ clinics }: ClinicsListPanelProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  return (
    <div className="h-full overflow-auto p-4 border-r border-gray-200">
      <div className="bg-white py-2 px-2 mb-5" style={{ marginLeft: '20px', marginRight: '20px' }}>
        <p className="m-0 text-black-500 text-sm text-center">
          該当するクリニック <strong className="text-lg" style={{ color: '#a3977d' }}>{clinics.length}</strong> 件
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {clinics.map((clinic: Clinic) => (
          <ClinicCard
            key={clinic.id}
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