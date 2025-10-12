'use client'

import { useState } from 'react'
import type { Clinic } from '@/types/clinic'
import { useClinicFilter } from '@/hooks/useClinicFilter'
import FilterControls from './FilterControls'

interface FilterButtonProps {
  clinics: Clinic[]
  onFilterChange: (filteredClinics: Clinic[]) => void
  selectedPrefectures?: string[]
  selectedGenres?: number[]
  selectedRanking?: string
  onPrefecturesChange?: (prefectures: string[]) => void
  onGenresChange?: (genres: number[]) => void
  onRankingChange?: (ranking: string) => void
  hideGenreFilter?: boolean
}

export default function FilterButton({
  clinics,
  onFilterChange,
  selectedPrefectures: externalPrefectures,
  selectedGenres: externalGenres,
  selectedRanking: externalRanking,
  onPrefecturesChange,
  onGenresChange,
  onRankingChange,
  hideGenreFilter = false
}: FilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [internalPrefectures, setInternalPrefectures] = useState<string[]>([])
  const [internalGenres, setInternalGenres] = useState<number[]>([])
  const [internalRanking, setInternalRanking] = useState<string>('')

  const { applyFilters } = useClinicFilter(clinics)

  const selectedPrefectures = externalPrefectures !== undefined ? externalPrefectures : internalPrefectures
  const selectedGenres = externalGenres !== undefined ? externalGenres : internalGenres
  const selectedRanking = externalRanking !== undefined ? externalRanking : internalRanking

  const setSelectedPrefectures = (value: string[]) => {
    onPrefecturesChange?.(value) ?? setInternalPrefectures(value)
  }

  const setSelectedGenres = (value: number[]) => {
    onGenresChange?.(value) ?? setInternalGenres(value)
  }

  const setSelectedRanking = (value: string) => {
    onRankingChange?.(value) ?? setInternalRanking(value)
  }

  const handlePrefectureChange = (prefecture: string) => {
    const updated = selectedPrefectures.includes(prefecture)
      ? selectedPrefectures.filter(p => p !== prefecture)
      : [...selectedPrefectures, prefecture]

    setSelectedPrefectures(updated)
    onFilterChange(applyFilters(updated, selectedGenres, selectedRanking))
  }

  const handleGenreChange = (genreId: number) => {
    const updated = selectedGenres.includes(genreId)
      ? selectedGenres.filter(g => g !== genreId)
      : [...selectedGenres, genreId]

    setSelectedGenres(updated)
    onFilterChange(applyFilters(selectedPrefectures, updated, selectedRanking))
  }

  const handleRankingChange = (ranking: string) => {
    const newRanking = selectedRanking === ranking ? '' : ranking
    setSelectedRanking(newRanking)
    onFilterChange(applyFilters(selectedPrefectures, selectedGenres, newRanking))
  }

  return (
    <div className="absolute top-4 left-4 right-4 z-[999]">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 rounded-lg shadow-lg border-0 font-bold text-base transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 text-white relative"
        style={{ backgroundColor: '#a3977d' }}
      >
        マップで絞り込み検索
        {!isOpen && (
          <span className="absolute right-3 flex items-center justify-center w-6 h-6 bg-white rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#a3977d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        )}
      </button>

      {/* Filter Modal */}
      <div
        className={`mt-2 bg-white/70 rounded-lg shadow-xl border border-gray-200 w-full origin-top transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'
        }`}
      >
        <div className="p-4">
          <FilterControls
            allClinics={clinics}
            selectedPrefectures={selectedPrefectures}
            selectedGenres={selectedGenres}
            selectedRanking={selectedRanking}
            onPrefectureChange={handlePrefectureChange}
            onGenreChange={handleGenreChange}
            onRankingChange={handleRankingChange}
            hideGenreFilter={hideGenreFilter}
          />
        </div>
      </div>
    </div>
  )
}
