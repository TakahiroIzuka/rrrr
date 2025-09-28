'use client'

import { useState, useCallback } from 'react'
import ClinicsListPanel from '@/components/ClinicsListPanel'
import MapPanel from '@/components/MapPanel'
import ClinicsGridSection from '@/components/ClinicsGridSection'
import FilterButton from '@/components/FilterButton'

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

interface HomeClientProps {
  clinics: Clinic[]
}

export default function HomeClient({ clinics }: HomeClientProps) {
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>(clinics)

  const handleFilterChange = useCallback((filtered: Clinic[]) => {
    setFilteredClinics(filtered)
  }, [])

  return (
    <div className="flex flex-col w-full">
      {/* Map Section */}
      <div className="flex h-screen w-full overflow-hidden">
        <div className="w-1/4 min-w-[300px]">
          <ClinicsListPanel clinics={filteredClinics} />
        </div>
        <div className="w-3/4 flex-1 relative">
          <MapPanel allClinics={clinics} filteredClinics={filteredClinics} />
          {/* Filter Button Overlay on Map */}
          <FilterButton clinics={clinics} onFilterChange={handleFilterChange} />
        </div>
      </div>

      {/* Clinics Grid Section */}
      <ClinicsGridSection clinics={filteredClinics} />
    </div>
  )
}