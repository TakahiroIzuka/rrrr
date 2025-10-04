'use client'

import { useState, useCallback } from 'react'

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

interface FilterButtonProps {
  clinics: Clinic[]
  onFilterChange: (filteredClinics: Clinic[]) => void
  selectedPrefectures?: string[]
  selectedGenres?: number[]
  selectedRanking?: string
  onPrefecturesChange?: (prefectures: string[]) => void
  onGenresChange?: (genres: number[]) => void
  onRankingChange?: (ranking: string) => void
}

export default function FilterButton({
  clinics,
  onFilterChange,
  selectedPrefectures: externalPrefectures,
  selectedGenres: externalGenres,
  selectedRanking: externalRanking,
  onPrefecturesChange,
  onGenresChange,
  onRankingChange
}: FilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [internalPrefectures, setInternalPrefectures] = useState<string[]>([])
  const [internalGenres, setInternalGenres] = useState<number[]>([])
  const [internalRanking, setInternalRanking] = useState<string>('')

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

  // Extract unique prefectures and genres
  const uniquePrefectures = Array.from(new Set(clinics.map(clinic => clinic.prefecture))).sort()
  const genreMap = {
    1: 'ピラティス',
    2: '内科',
    5: '皮膚科'
  }
  const uniqueGenres = Array.from(new Set(clinics.map(clinic => clinic.genre_id))).sort()

  const rankingOptions = ['トップ30', 'トップ20', 'トップ10', 'トップ5', 'トップ3']

  const toggleModal = () => {
    setIsOpen(!isOpen)
  }

  const handlePrefectureChange = (prefecture: string) => {
    const updated = selectedPrefectures.includes(prefecture)
      ? selectedPrefectures.filter(p => p !== prefecture)
      : [...selectedPrefectures, prefecture]

    setSelectedPrefectures(updated)
    applyFilters(updated, selectedGenres, selectedRanking)
  }

  const handleGenreChange = (genreId: number) => {
    const updated = selectedGenres.includes(genreId)
      ? selectedGenres.filter(g => g !== genreId)
      : [...selectedGenres, genreId]

    setSelectedGenres(updated)
    applyFilters(selectedPrefectures, updated, selectedRanking)
  }

  const handleRankingChange = (ranking: string) => {
    const newRanking = selectedRanking === ranking ? '' : ranking
    setSelectedRanking(newRanking)
    applyFilters(selectedPrefectures, selectedGenres, newRanking)
  }

  const applyFilters = useCallback((prefectures: string[], genres: number[], ranking: string) => {
    let filtered = clinics

    if (prefectures.length > 0) {
      filtered = filtered.filter(clinic => prefectures.includes(clinic.prefecture))
    }

    if (genres.length > 0) {
      filtered = filtered.filter(clinic => genres.includes(clinic.genre_id))
    }

    if (ranking) {
      const topCount = parseInt(ranking.replace('トップ', ''))
      const sortedByRating = [...filtered].sort((a, b) => {
        // Calculate score as star * user_review_count, handle null/0 cases
        const scoreA = (a.star !== null && a.star > 0 && a.user_review_count > 0) ? a.star * a.user_review_count : 0
        const scoreB = (b.star !== null && b.star > 0 && b.user_review_count > 0) ? b.star * b.user_review_count : 0
        return scoreB - scoreA
      })
      filtered = sortedByRating.slice(0, topCount)
    }

    onFilterChange(filtered)
  }, [clinics, onFilterChange])

  const clearFilters = () => {
    setSelectedPrefectures([])
    setSelectedGenres([])
    setSelectedRanking('')
    onFilterChange(clinics)
  }

  return (
    <div className="absolute top-4 left-4 right-4 z-[1001]">
      {/* Filter Button */}
      <button
        onClick={toggleModal}
        className="w-full px-4 py-3 rounded-lg shadow-lg border-0 font-bold text-base transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 text-white relative"
        style={{
          backgroundColor: '#a3977d'
        }}
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

            {/* Prefecture Filter */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 px-2 py-1 rounded" style={{ backgroundColor: '#eae3db' }}>
                都道府県を選択
              </h4>
              <div className="flex flex-wrap gap-2">
                {uniquePrefectures.map((prefecture) => (
                  <label key={prefecture} className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded text-sm border border-gray-200 bg-white">
                    <input
                      type="checkbox"
                      checked={selectedPrefectures.includes(prefecture)}
                      onChange={() => handlePrefectureChange(prefecture)}
                      className="w-3 h-3 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-gray-700 text-xs font-medium">{prefecture}</span>
                    <span className="text-xs text-gray-500">
                      ({clinics.filter(c => c.prefecture === prefecture).length})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Genre Filter */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 px-2 py-1 rounded" style={{ backgroundColor: '#eae3db' }}>
                ジャンルを選択
              </h4>
              <div className="flex flex-wrap gap-2">
                {uniqueGenres.map((genreId) => (
                  <label key={genreId} className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded text-sm border border-gray-200 bg-white">
                    <input
                      type="checkbox"
                      checked={selectedGenres.includes(genreId)}
                      onChange={() => handleGenreChange(genreId)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-xs text-gray-700 font-medium">{genreMap[genreId as keyof typeof genreMap]}</span>
                    <span className="text-xs text-gray-500">
                      ({clinics.filter(c => c.genre_id === genreId).length})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Google Review Ranking Filter */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 px-2 py-1 rounded" style={{ backgroundColor: '#eae3db' }}>
                Googleクチコミランキング
              </h4>
              <div className="flex flex-wrap gap-2">
                {rankingOptions.map((ranking) => (
                  <label key={ranking} className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded text-sm border border-gray-200 bg-white">
                    <input
                      type="checkbox"
                      checked={selectedRanking === ranking}
                      onChange={() => handleRankingChange(ranking)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-xs text-gray-700 font-medium">{ranking}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>
      </div>
    </div>
  )
}