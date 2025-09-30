'use client'

import { useState } from 'react'
import ClinicCard from './ClinicCard'

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
      <div className="bg-white py-4 px-4 rounded-lg mb-5 border border-gray-200">
        <p className="m-0 text-gray-500 text-sm">
          登録件数2: <strong className="text-gray-900">{clinics.length}</strong>件
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