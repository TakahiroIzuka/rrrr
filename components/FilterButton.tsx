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
}

export default function FilterButton({ clinics, onFilterChange }: FilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPrefectures, setSelectedPrefectures] = useState<string[]>([])
  const [selectedGenres, setSelectedGenres] = useState<number[]>([])
  const [selectedRanking, setSelectedRanking] = useState<string>('')

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
        className="w-full px-4 py-3 rounded-lg shadow-lg border-0 font-medium text-base transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 text-white"
        style={{
          backgroundColor: '#a3977d',
          fontFamily: "'Kosugi Maru', sans-serif"
        }}
      >
        マップで絞り込み検索
        <span className="text-xs text-gray-200">
          {(selectedPrefectures.length > 0 || selectedGenres.length > 0 || selectedRanking) &&
            `(${selectedPrefectures.length + selectedGenres.length + (selectedRanking ? 1 : 0)}件の条件)`
          }
        </span>
      </button>

      {/* Filter Modal */}
      {isOpen && (
        <div className="mt-2 bg-white/70 rounded-lg shadow-xl border border-gray-200 w-full">
          <div className="p-4">
            {/* Header with Clear Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={clearFilters}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1 rounded-md hover:bg-gray-50"
              >
                すべてクリア
              </button>
            </div>

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

            {/* Filter Summary */}
            {(selectedPrefectures.length > 0 || selectedGenres.length > 0 || selectedRanking) && (
              <div className="pt-3 mt-3 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {selectedPrefectures.map(pref => (
                    <span key={pref} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                      📍 {pref}
                    </span>
                  ))}
                  {selectedGenres.map(genreId => (
                    <span key={genreId} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                      🏥 {genreMap[genreId as keyof typeof genreMap]}
                    </span>
                  ))}
                  {selectedRanking && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
                      🏆 {selectedRanking}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}