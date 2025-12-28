'use client'

import { useState } from 'react'
import type { Facility } from '@/types/facility'
import { useClinicFilter } from '@/hooks/useClinicFilter'
import FilterControls from './FilterControls'

interface FilterButtonProps {
  facilities: Facility[]
  onFilterChange: (filteredFacilities: Facility[]) => void
  selectedPrefectures?: string[]
  selectedGenres?: number[]
  selectedRanking?: string
  onPrefecturesChange?: (prefectures: string[]) => void
  onGenresChange?: (genres: number[]) => void
  onRankingChange?: (ranking: string) => void
  hideGenreFilter?: boolean
  isGenrePage?: boolean
}

export default function FilterButton({
  facilities,
  onFilterChange,
  selectedPrefectures: externalPrefectures,
  selectedGenres: externalGenres,
  selectedRanking: externalRanking,
  onPrefecturesChange,
  onGenresChange,
  onRankingChange,
  hideGenreFilter = false,
  isGenrePage = false
}: FilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [internalPrefectures, setInternalPrefectures] = useState<string[]>([])
  const [internalGenres, setInternalGenres] = useState<number[]>([])
  const [internalRanking, setInternalRanking] = useState<string>('')

  const { applyFilters } = useClinicFilter(facilities)

  const selectedPrefectures = externalPrefectures !== undefined ? externalPrefectures : internalPrefectures
  const selectedGenres = externalGenres !== undefined ? externalGenres : internalGenres
  const selectedRanking = externalRanking !== undefined ? externalRanking : internalRanking

  const setSelectedPrefectures = (value: string[]) => {
    if (onPrefecturesChange) {
      onPrefecturesChange(value)
    } else {
      setInternalPrefectures(value)
    }
  }

  const setSelectedGenres = (value: number[]) => {
    if (onGenresChange) {
      onGenresChange(value)
    } else {
      setInternalGenres(value)
    }
  }

  const setSelectedRanking = (value: string) => {
    if (onRankingChange) {
      onRankingChange(value)
    } else {
      setInternalRanking(value)
    }
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
    <div className={`absolute ${isGenrePage ? 'top-12' : 'top-12'} md:top-4 left-4 right-4 z-[999]`} style={{ pointerEvents: 'none' }}>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 rounded-lg shadow-lg border-0 font-bold text-base transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 text-white relative"
        style={{ backgroundColor: '#a3977d', pointerEvents: 'auto' }}
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
          isOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
        }`}
        style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
      >
        <div className="p-4">
          <FilterControls
            allFacilities={facilities}
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
