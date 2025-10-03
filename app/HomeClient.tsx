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
  const [selectedClinicId, setSelectedClinicId] = useState<number | null>(null)
  const [selectedPrefectures, setSelectedPrefectures] = useState<string[]>([])
  const [selectedGenres, setSelectedGenres] = useState<number[]>([])
  const [selectedRanking, setSelectedRanking] = useState<string>('')

  const handleFilterChange = useCallback((filtered: Clinic[]) => {
    setFilteredClinics(filtered)
    // Reset selection when filter changes
    setSelectedClinicId(null)
  }, [])

  const handleClinicSelect = useCallback((clinicId: number | null) => {
    setSelectedClinicId(clinicId)
  }, [])

  return (
    <div className="flex flex-col w-full">
      {/* Map Section */}
      <div className="flex h-screen w-full overflow-hidden">
        <div className="w-[400px] flex-shrink-0" style={{ backgroundColor: '#fff9f0'}}>
          <ClinicsListPanel
            clinics={selectedClinicId ? filteredClinics.filter(clinic => clinic.id === selectedClinicId) : filteredClinics}
          />
        </div>
        <div className="flex-1 relative">
          <MapPanel
            allClinics={clinics}
            filteredClinics={filteredClinics}
            onClinicSelect={handleClinicSelect}
          />
          {/* Filter Button Overlay on Map */}
          <FilterButton
            clinics={clinics}
            onFilterChange={handleFilterChange}
            selectedPrefectures={selectedPrefectures}
            selectedGenres={selectedGenres}
            selectedRanking={selectedRanking}
            onPrefecturesChange={setSelectedPrefectures}
            onGenresChange={setSelectedGenres}
            onRankingChange={setSelectedRanking}
          />
        </div>
      </div>

      {/* Clinics Grid Section */}
      <ClinicsGridSection
        clinics={filteredClinics}
        allClinics={clinics}
        selectedPrefectures={selectedPrefectures}
        selectedGenres={selectedGenres}
        selectedRanking={selectedRanking}
        onPrefecturesChange={setSelectedPrefectures}
        onGenresChange={setSelectedGenres}
        onRankingChange={setSelectedRanking}
        onFilterChange={handleFilterChange}
      />
    </div>
  )
}