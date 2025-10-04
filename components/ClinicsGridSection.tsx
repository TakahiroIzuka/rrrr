'use client'

import { useState, useCallback } from 'react'
import ClinicCardLite from './ClinicCardLite'

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

interface ClinicsGridSectionProps {
  clinics: Clinic[]
  allClinics: Clinic[]
  selectedPrefectures: string[]
  selectedGenres: number[]
  selectedRanking: string
  onPrefecturesChange: (prefectures: string[]) => void
  onGenresChange: (genres: number[]) => void
  onRankingChange: (ranking: string) => void
  onFilterChange: (filteredClinics: Clinic[]) => void
}

export default function ClinicsGridSection({
  clinics,
  allClinics,
  selectedPrefectures,
  selectedGenres,
  selectedRanking,
  onPrefecturesChange,
  onGenresChange,
  onRankingChange,
  onFilterChange
}: ClinicsGridSectionProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState<{[key: number]: number}>({})

  // Extract unique prefectures and genres from all clinics
  const uniquePrefectures = Array.from(new Set(allClinics.map(clinic => clinic.prefecture))).sort()
  const genreMap = {
    1: 'ピラティス',
    2: '内科',
    5: '皮膚科'
  }
  const uniqueGenres = Array.from(new Set(allClinics.map(clinic => clinic.genre_id))).sort()
  const rankingOptions = ['トップ30', 'トップ20', 'トップ10', 'トップ5', 'トップ3']

  const handlePrefectureChange = (prefecture: string) => {
    const updated = selectedPrefectures.includes(prefecture)
      ? selectedPrefectures.filter(p => p !== prefecture)
      : [...selectedPrefectures, prefecture]
    onPrefecturesChange(updated)
    applyFilters(updated, selectedGenres, selectedRanking)
  }

  const handleGenreChange = (genreId: number) => {
    const updated = selectedGenres.includes(genreId)
      ? selectedGenres.filter(g => g !== genreId)
      : [...selectedGenres, genreId]
    onGenresChange(updated)
    applyFilters(selectedPrefectures, updated, selectedRanking)
  }

  const handleRankingChange = (ranking: string) => {
    const newRanking = selectedRanking === ranking ? '' : ranking
    onRankingChange(newRanking)
    applyFilters(selectedPrefectures, selectedGenres, newRanking)
  }


  const applyFilters = useCallback((prefectures: string[], genres: number[], ranking: string) => {
    let filtered = allClinics

    if (prefectures.length > 0) {
      filtered = filtered.filter(clinic => prefectures.includes(clinic.prefecture))
    }

    if (genres.length > 0) {
      filtered = filtered.filter(clinic => genres.includes(clinic.genre_id))
    }

    if (ranking) {
      const topCount = parseInt(ranking.replace('トップ', ''))
      const sortedByRating = [...filtered].sort((a, b) => {
        const scoreA = (a.star !== null && a.star > 0 && a.user_review_count > 0) ? a.star * a.user_review_count : 0
        const scoreB = (b.star !== null && b.star > 0 && b.user_review_count > 0) ? b.star * b.user_review_count : 0
        return scoreB - scoreA
      })
      filtered = sortedByRating.slice(0, topCount)
    }

    onFilterChange(filtered)
  }, [allClinics, onFilterChange])

  const clearFilters = () => {
    onPrefecturesChange([])
    onGenresChange([])
    onRankingChange('')
    onFilterChange(allClinics)
  }

  // Function to get appropriate star image based on rating
  const getStarImage = (rating: number): string => {
    if (rating === 0) return '/common/star_0.5.png'
    if (rating <= 1.25) return '/common/star_1.0.png'
    if (rating <= 1.75) return '/common/star_1.5.png'
    if (rating <= 2.25) return '/common/star_2.0.png'
    if (rating <= 2.75) return '/common/star_2.5.png'
    if (rating <= 3.25) return '/common/star_3.0.png'
    if (rating <= 3.75) return '/common/star_3.5.png'
    if (rating <= 4.25) return '/common/star_4.0.png'
    if (rating <= 4.75) return '/common/star_4.5.png'
    return '/common/star_5.0.png'
  }

  // Default images for clinics (3 images per clinic)
  const getClinicImages = (clinicId: number) => {
    return [
      '/mrr/beauty-noimage.jpg',
      '/mrr/beauty-noimage.jpg',
      '/mrr/beauty-noimage.jpg'
    ]
  }

  // Handle slider navigation
  const handlePrevImage = (clinicId: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [clinicId]: prev[clinicId] > 0 ? prev[clinicId] - 1 : 2
    }))
  }

  const handleNextImage = (clinicId: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [clinicId]: (prev[clinicId] || 0) < 2 ? (prev[clinicId] || 0) + 1 : 0
    }))
  }

  const handleIndicatorClick = (clinicId: number, index: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [clinicId]: index
    }))
  }

  return (
    <section className="py-16 px-8 border-t border-slate-200" style={{ backgroundColor: '#F1F1F1' }}>
      <div className="mx-auto space-y-8">
        {/* First Section */}
        <div className="flex gap-8 items-start">
          {/* Left Box - 3/4 width */}
          <div className="w-3/4 bg-white rounded-lg p-5">
            {/* Section Header */}
            <div className="text-left mb-6">
              <h2 className="text-xl font-bold text-gray-700 mb-4">
                人気のクリニック5件はこちら
              </h2>
              <div className="flex items-center gap-3">
                <div className="w-8 h-1" style={{ backgroundColor: '#a3977d' }}></div>
                <p className="text-l font-bold" style={{ color: '#a3977d', letterSpacing: '0.4rem' }}>Recommended Clinic</p>
              </div>
            </div>

            {/* Clinics Grid */}
            <div className="grid grid-cols-5 gap-4">
              {clinics.slice(0, 5).map((clinic) => (
                <ClinicCardLite
                  key={clinic.id}
                  clinic={clinic}
                  isHovered={hoveredCard === clinic.id}
                  onMouseEnter={() => setHoveredCard(clinic.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                />
              ))}
            </div>
          </div>

          {/* Right Box - 1/4 width */}
          <div className="w-1/4 bg-white rounded-lg p-5">
            {/* Image Space */}
            <div className="w-full h-24 bg-white rounded-lg mb-3 flex items-center justify-center">
              <img src="/mrr/pin-profile.png" alt="プロフィール" className="w-[95px] h-[95px] object-contain" />
            </div>

            {/* Title */}
            <h3 className="text-base font-bold text-gray-700 mb-3 text-center">
              メディカルクチコミランキング
            </h3>

            {/* Description */}
            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              メディカルクチコミランキングの評価基準は、Googleマップのクチコミ情報の数値（評価平均×評価人数=Ｘ）を算出して、ランキング順位を表示しております。 ※Googleマップのクチコミ情報は、ページを読み込む度に最新情報が同期されます。
            </p>

            {/* Button */}
            <button className="w-full py-3 px-4 bg-[#a59878] text-white text-xs font-bold rounded-full hover:bg-black transition-all duration-300 group flex items-center justify-center gap-2 relative">
              <span className="transition-transform duration-300 group-hover:scale-x-110 inline-block">クリニックの掲載リクエストはこちら</span>
              <span className="flex items-center justify-center w-4 h-4 bg-white rounded-full transition-all duration-300 group-hover:translate-x-2 flex-shrink-0">
                <span className="text-[#a59878] font-bold text-xl leading-none inline-block" style={{ transform: 'translate(0.5px, -2px)' }}>›</span>
              </span>
            </button>
          </div>
        </div>

        {/* Second Section */}
        <div className="flex gap-8 items-start">
          {/* Left Box - 3/4 width */}
          <div className="w-3/4 bg-white rounded-lg p-5">
            {/* Section Header */}
            <div className="text-left mb-6">
              <h2 className="text-xl font-bold text-gray-700 mb-4">
                リストで絞り込み検索結果一覧はこちら
              </h2>
              <div className="flex items-center gap-3">
                <div className="w-8 h-1" style={{ backgroundColor: '#a3977d' }}></div>
                <p className="text-l font-bold" style={{ color: '#a3977d', letterSpacing: '0.4rem' }}>List Search</p>
              </div>
            </div>

            {/* Clinics Grid */}
            <div className="grid grid-cols-5 gap-4">
              {clinics.map((clinic) => (
                <ClinicCardLite
                  key={`second-${clinic.id}`}
                  clinic={clinic}
                  isHovered={hoveredCard === clinic.id}
                  onMouseEnter={() => setHoveredCard(clinic.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                />
              ))}
            </div>
          </div>

          {/* Right Box - 1/4 width */}
          <div className="w-1/4 bg-white rounded-lg p-5">
            {/* Title */}
            <h3 className="text-lg font-bold text-gray-700 mb-2 text-center">
              リストで絞り込み検索
            </h3>
            <div className="flex justify-center mb-4">
              <div className="w-1/6 h-1 rounded-sm" style={{ backgroundColor: '#a69a7e' }}></div>
            </div>

            {/* Clinic Count */}
            <div className="mb-4 bg-white rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                該当する店舗及び施設<strong className="text-lg mx-1" style={{ color: '#a69a7e' }}>{clinics.length}</strong>件
              </p>
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
                      ({allClinics.filter(c => c.prefecture === prefecture).length})
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
                      ({allClinics.filter(c => c.genre_id === genreId).length})
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
    </section>
  )
}