'use client'

import { useState, useCallback } from 'react'
import type { Clinic } from '@/types/clinic'
import ClinicsListPanel from '@/components/ClinicsListPanel'
import MapPanel from '@/components/MapPanel'
import ClinicsGridSection from '@/components/ClinicsGridSection'
import FilterButton from '@/components/FilterButton'
import DetailHeader from '@/app/clinics/[id]/DetailHeader'

interface ClinicHomeClientProps {
  clinics: Clinic[]
  genreId?: number
  genreName?: string
  genreCode?: string
}

export default function ClinicHomeClient({
  clinics,
  genreId,
  genreName,
  genreCode
}: ClinicHomeClientProps) {
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>(clinics)
  const [selectedClinicId, setSelectedClinicId] = useState<number | null>(null)
  const [selectedPrefectures, setSelectedPrefectures] = useState<string[]>([])
  const [selectedGenres, setSelectedGenres] = useState<number[]>(genreId ? [genreId] : [])
  const [selectedRanking, setSelectedRanking] = useState<string>('')

  const handleFilterChange = useCallback((filtered: Clinic[]) => {
    setFilteredClinics(filtered)
    // Reset selection when filter changes
    setSelectedClinicId(null)
  }, [])

  const handleClinicSelect = useCallback((clinicId: number | null) => {
    setSelectedClinicId(clinicId)
  }, [])

  // Show genre header only if genre props are provided
  const showGenreHeader = genreId && genreName
  const hideGenreFilter = !!genreId

  return (
    <>
      {/* Header with genre label (only for genre pages) */}
      {showGenreHeader && (
        <DetailHeader
          genreName={genreName || ''}
          genreCode={genreCode}
          showNavButtons={true}
        />
      )}

      <div className="flex flex-col w-full">
        {/* Map Section */}
        <div id="map-section" className="flex flex-col md:flex-row w-full overflow-hidden h-[calc(100vh-100px)] md:h-[calc(100vh-150px)]">
          {/* Sidebar Below Map on Mobile, Left on PC */}
          <div className="w-full md:w-[430px] flex-shrink-0 h-1/2 md:h-full order-2 md:order-1" style={{ backgroundColor: '#fff9f0'}}>
            <ClinicsListPanel
              clinics={selectedClinicId ? filteredClinics.filter(clinic => clinic.id === selectedClinicId) : filteredClinics}
            />
          </div>
          {/* Map Full Width on Mobile, Right on PC */}
          <div className="w-full md:flex-1 relative h-1/2 md:h-full order-1 md:order-2">
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
              hideGenreFilter={hideGenreFilter}
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
          hideGenreFilter={hideGenreFilter}
        />
      </div>
    </>
  )
}
