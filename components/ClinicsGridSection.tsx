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

  const handleCheckboxClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation()
  }

  const handleLabelClick = (e: React.MouseEvent<HTMLLabelElement>) => {
    e.preventDefault()
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
        <div className="flex gap-8">
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
                <div
                  key={clinic.id}
                  className={`bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ease-in-out ${
                    hoveredCard === clinic.id
                      ? 'shadow-lg -translate-y-0.5'
                      : 'shadow-sm hover:shadow-md'
                  }`}
                  onMouseEnter={() => setHoveredCard(clinic.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Image Slider */}
                  <div className="relative">
                    <div className="relative group">
                      <div className="w-full h-32 bg-gray-100 overflow-hidden">
                        <img
                          src={getClinicImages(clinic.id)[currentImageIndex[clinic.id] || 0]}
                          alt={`${clinic.name}の画像`}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Navigation buttons */}
                      <button
                        onClick={() => handlePrevImage(clinic.id)}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      >
                        &#8249;
                      </button>
                      <button
                        onClick={() => handleNextImage(clinic.id)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      >
                        &#8250;
                      </button>
                    </div>

                    {/* Indicators */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                      {getClinicImages(clinic.id).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => handleIndicatorClick(clinic.id, index)}
                          className={`w-1.5 h-1.5 rounded-full transition-colors ${
                            (currentImageIndex[clinic.id] || 0) === index
                              ? 'bg-[#a59878]'
                              : 'bg-white bg-opacity-70'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="p-3">
                    <h3 className="m-0 mb-2 text-gray-900 text-sm font-semibold leading-tight">
                      {clinic.name}
                    </h3>

                    <div className="flex items-center mb-2 gap-1">
                      <span className="text-xs text-gray-500">📍</span>
                      <span className="text-gray-600 text-xs">
                        {clinic.prefecture} {clinic.area}
                      </span>
                    </div>

                    {clinic.star !== null && (
                      <div className="mb-2">
                        <div className="flex items-center gap-1 mb-0.5">
                          <img
                            src={getStarImage(clinic.star)}
                            alt={`${clinic.star}星評価`}
                            className="w-12 h-2.5"
                          />
                        </div>
                        <div className="text-gray-500 text-xs">
                          <span className="text-amber-500 font-semibold">{clinic.star}</span> ({clinic.user_review_count}人)
                        </div>
                      </div>
                    )}

                    {clinic.star === null && clinic.user_review_count === 0 && (
                      <div className="mb-2">
                        <div className="flex items-center gap-1 mb-0.5">
                          <img
                            src="/common/star_0.5.png"
                            alt="評価なし"
                            className="w-12 h-2.5"
                          />
                        </div>
                        <div className="text-gray-400 text-xs">
                          レビューなし
                        </div>
                      </div>
                    )}

                    <button className="w-full py-1.5 px-2 bg-[#a59878] text-white text-xs font-medium rounded hover:bg-opacity-90 transition-colors">
                      基本情報とクチコミ詳細
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Box - 1/4 width */}
          <div className="w-1/4 bg-white rounded-lg p-5">
            {/* Image Space */}
            <div className="w-full h-32 bg-gray-100 rounded-lg mb-4"></div>

            {/* Title */}
            <h3 className="text-lg font-bold text-gray-700 mb-4">
              メディカルクチコミランキング
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              メディカルクチコミランキングの評価基準は、Googleマップのクチコミ情報の数値（評価平均×評価人数=Ｘ）を算出して、ランキング順位を表示しております。 ※Googleマップのクチコミ情報は、ページを読み込む度に最新情報が同期されます。
            </p>

            {/* Button */}
            <button className="w-full py-2 px-4 bg-[#a59878] text-white text-sm font-medium rounded hover:bg-opacity-90 transition-colors">
              クリニックの掲載リクエストはこちら
            </button>
          </div>
        </div>

        {/* Second Section */}
        <div className="flex gap-8">
          {/* Left Box - 3/4 width */}
          <div className="w-3/4 bg-white rounded-lg p-8">
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
              {clinics.slice(0, 5).map((clinic) => (
                <div
                  key={`second-${clinic.id}`}
                  className={`bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ease-in-out ${
                    hoveredCard === clinic.id
                      ? 'shadow-lg -translate-y-0.5'
                      : 'shadow-sm hover:shadow-md'
                  }`}
                  onMouseEnter={() => setHoveredCard(clinic.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Image Slider */}
                  <div className="relative">
                    <div className="relative group">
                      <div className="w-full h-32 bg-gray-100 overflow-hidden">
                        <img
                          src={getClinicImages(clinic.id)[currentImageIndex[clinic.id] || 0]}
                          alt={`${clinic.name}の画像`}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Navigation buttons */}
                      <button
                        onClick={() => handlePrevImage(clinic.id)}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      >
                        &#8249;
                      </button>
                      <button
                        onClick={() => handleNextImage(clinic.id)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      >
                        &#8250;
                      </button>
                    </div>

                    {/* Indicators */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                      {getClinicImages(clinic.id).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => handleIndicatorClick(clinic.id, index)}
                          className={`w-1.5 h-1.5 rounded-full transition-colors ${
                            (currentImageIndex[clinic.id] || 0) === index
                              ? 'bg-[#a59878]'
                              : 'bg-white bg-opacity-70'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="p-3">
                    <h3 className="m-0 mb-2 text-gray-900 text-sm font-semibold leading-tight">
                      {clinic.name}
                    </h3>

                    <div className="flex items-center mb-2 gap-1">
                      <span className="text-xs text-gray-500">📍</span>
                      <span className="text-gray-600 text-xs">
                        {clinic.prefecture} {clinic.area}
                      </span>
                    </div>

                    {clinic.star !== null && (
                      <div className="mb-2">
                        <div className="flex items-center gap-1 mb-0.5">
                          <img
                            src={getStarImage(clinic.star)}
                            alt={`${clinic.star}星評価`}
                            className="w-12 h-2.5"
                          />
                        </div>
                        <div className="text-gray-500 text-xs">
                          <span className="text-amber-500 font-semibold">{clinic.star}</span> ({clinic.user_review_count}人)
                        </div>
                      </div>
                    )}

                    {clinic.star === null && clinic.user_review_count === 0 && (
                      <div className="mb-2">
                        <div className="flex items-center gap-1 mb-0.5">
                          <img
                            src="/common/star_0.5.png"
                            alt="評価なし"
                            className="w-12 h-2.5"
                          />
                        </div>
                        <div className="text-gray-400 text-xs">
                          レビューなし
                        </div>
                      </div>
                    )}

                    <button className="w-full py-1.5 px-2 bg-[#a59878] text-white text-xs font-medium rounded hover:bg-opacity-90 transition-colors">
                      基本情報とクチコミ詳細
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Box - 1/4 width */}
          <div className="w-1/4 bg-white rounded-lg p-5">
            {/* Title */}
            <h3 className="text-lg font-bold text-gray-700 mb-4">
              リストで絞り込み検索
            </h3>

            {/* Clinic Count */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                登録件数2: <strong className="text-gray-900">{clinics.length}</strong>件
              </p>
            </div>

            {/* Clear Button */}
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
                  <label key={prefecture} className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded text-sm border border-gray-200 bg-white" onClick={handleLabelClick}>
                    <input
                      type="checkbox"
                      checked={selectedPrefectures.includes(prefecture)}
                      onChange={() => handlePrefectureChange(prefecture)}
                      onClick={handleCheckboxClick}
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
                  <label key={genreId} className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded text-sm border border-gray-200 bg-white" onClick={handleLabelClick}>
                    <input
                      type="checkbox"
                      checked={selectedGenres.includes(genreId)}
                      onChange={() => handleGenreChange(genreId)}
                      onClick={handleCheckboxClick}
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
                  <label key={ranking} className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded text-sm border border-gray-200 bg-white" onClick={handleLabelClick}>
                    <input
                      type="checkbox"
                      checked={selectedRanking === ranking}
                      onChange={() => handleRankingChange(ranking)}
                      onClick={handleCheckboxClick}
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