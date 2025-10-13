'use client'

import { useState, useCallback, useMemo } from 'react'
import type { Facility } from '@/types/facility'
import ClinicsListPanel from '@/components/ClinicsListPanel'
import MapPanel from '@/components/MapPanel'
import ClinicsGridSection from '@/components/ClinicsGridSection'
import FilterButton from '@/components/FilterButton'

interface ClinicHomeClientProps {
  facilities: Facility[]
  genreId?: number
  genreName?: string
  genreCode?: string
}

export default function ClinicHomeClient({
  facilities,
  genreId,
  genreName,
}: ClinicHomeClientProps) {
  // Normalize detail to handle both array and object formats
  const normalizedFacilities = useMemo(() => {
    return facilities.map(facility => ({
      ...facility,
      detail: Array.isArray(facility.detail)
        ? facility.detail[0]
        : facility.detail
    }))
  }, [facilities])

  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>(normalizedFacilities)
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(null)
  const [selectedPrefectures, setSelectedPrefectures] = useState<string[]>([])
  const [selectedGenres, setSelectedGenres] = useState<number[]>(genreId ? [genreId] : [])
  const [selectedRanking, setSelectedRanking] = useState<string>('')

  const handleFilterChange = useCallback((filtered: Facility[]) => {
    setFilteredFacilities(filtered)
    // Reset selection when filter changes
    setSelectedFacilityId(null)
  }, [])

  const handleFacilitySelect = useCallback((facilityId: number | null) => {
    setSelectedFacilityId(facilityId)
  }, [])

  // Show genre header only if genre props are provided
  const showGenreHeader = genreId && genreName
  const hideGenreFilter = !!genreId

  return (
    <>
      {/* Header with genre label (only for genre pages) */}
      <div className="flex flex-col w-full">
        {/* Map Section */}
        <div id="map-section" className={`flex flex-col md:flex-row w-full overflow-hidden ${showGenreHeader ? 'h-[calc(100vh-64px)]' : 'h-[calc(100vh-64px)]'} md:h-[calc(100vh-150px)]`}>
          {/* Sidebar Below Map on Mobile, Left on PC */}
          <div className="w-full md:w-[430px] flex-shrink-0 h-1/2 md:h-full order-2 md:order-1 overflow-y-auto" style={{ backgroundColor: '#fff9f0'}}>
            <ClinicsListPanel
              facilities={selectedFacilityId ? filteredFacilities.filter(facility => facility.id === selectedFacilityId) : filteredFacilities}
            />
          </div>
          {/* Map Full Width on Mobile, Right on PC */}
          <div className="w-full md:flex-1 relative h-1/2 md:h-full order-1 md:order-2">
            <MapPanel
              allFacilities={normalizedFacilities}
              filteredFacilities={filteredFacilities}
              onFacilitySelect={handleFacilitySelect}
            />
            {/* Filter Button Overlay on Map */}
            <FilterButton
              facilities={normalizedFacilities}
              onFilterChange={handleFilterChange}
              selectedPrefectures={selectedPrefectures}
              selectedGenres={selectedGenres}
              selectedRanking={selectedRanking}
              onPrefecturesChange={setSelectedPrefectures}
              onGenresChange={setSelectedGenres}
              onRankingChange={setSelectedRanking}
              hideGenreFilter={hideGenreFilter}
              isGenrePage={showGenreHeader}
            />
          </div>
        </div>

        {/* Clinics Grid Section */}
        <ClinicsGridSection
          facilities={filteredFacilities}
          allFacilities={normalizedFacilities}
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
