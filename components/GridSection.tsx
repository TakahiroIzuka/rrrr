'use client'

import type { Facility } from '@/types/facility'
import type { ServiceCode } from '@/lib/constants/services'
import { useClinicFilter } from '@/hooks/useClinicFilter'
import List from './List'
import FilterControls from './FilterControls'
import ReviewRanking from './ReviewRanking'

interface FacilityImage {
  id: number
  facility_id: number
  image_path: string
  thumbnail_path: string | null
  display_order: number
  publicUrl: string
  thumbnailUrl: string | null
}

interface GridSectionProps {
  facilities: Facility[]
  allFacilities: Facility[]
  selectedPrefectures: string[]
  selectedGenres: number[]
  selectedRanking: string
  onPrefecturesChange: (prefectures: string[]) => void
  onGenresChange: (genres: number[]) => void
  onRankingChange: (ranking: string) => void
  onFilterChange: (filteredFacilities: Facility[]) => void
  hideGenreFilter?: boolean
  serviceCode: ServiceCode
  imagesMap?: Record<number, FacilityImage[]>
}

export default function GridSection({
  facilities,
  allFacilities,
  selectedPrefectures,
  selectedGenres,
  selectedRanking,
  onPrefecturesChange,
  onGenresChange,
  onRankingChange,
  onFilterChange,
  hideGenreFilter = false,
  serviceCode,
  imagesMap = {}
}: GridSectionProps) {
  const { applyFilters } = useClinicFilter(allFacilities)

  const handlePrefectureChange = (prefecture: string) => {
    const updated = selectedPrefectures.includes(prefecture)
      ? selectedPrefectures.filter(p => p !== prefecture)
      : [...selectedPrefectures, prefecture]
    onPrefecturesChange(updated)
    onFilterChange(applyFilters(updated, selectedGenres, selectedRanking))
  }

  const handleGenreChange = (genreId: number) => {
    const updated = selectedGenres.includes(genreId)
      ? selectedGenres.filter(g => g !== genreId)
      : [...selectedGenres, genreId]
    onGenresChange(updated)
    onFilterChange(applyFilters(selectedPrefectures, updated, selectedRanking))
  }

  const handleRankingChange = (ranking: string) => {
    const newRanking = selectedRanking === ranking ? '' : ranking
    onRankingChange(newRanking)
    onFilterChange(applyFilters(selectedPrefectures, selectedGenres, newRanking))
  }

  return (
    <section className="pt-5 pb-10 px-[5px] md:px-5" style={{ backgroundColor: '#F1F1F1', borderTop: '2px solid #d1cab7' }}>
      <div className="mx-auto space-y-6">
        {/* メディカルクチコミランキング（スマホで表示） */}
        <ReviewRanking variant="mobile" serviceCode={serviceCode} />

        {/* リストで絞り込み検索（スマホで表示） */}
        <div className="md:hidden w-full bg-white rounded-2xl md:rounded-lg px-[5px] py-5 shadow-none md:shadow-md">
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
              該当する店舗及び施設<strong className="text-lg mx-1" style={{ color: '#a69a7e' }}>{facilities.length}</strong>件
            </p>
          </div>

          <FilterControls
            allFacilities={allFacilities}
            selectedPrefectures={selectedPrefectures}
            selectedGenres={selectedGenres}
            selectedRanking={selectedRanking}
            onPrefectureChange={handlePrefectureChange}
            onGenreChange={handleGenreChange}
            onRankingChange={handleRankingChange}
            hideGenreFilter={hideGenreFilter}
          />
        </div>

        {/* First Section - PC only */}
        <div className="hidden md:flex gap-6 items-start">
          {/* Left Box - 3/4 width */}
          <div className="w-3/4">
            <List
              facilities={allFacilities.slice(0, 5)}
              title="人気のクリニック5件はこちら"
              subtitle="Recommended Clinic"
              width="full"
              gridCols="5"
              serviceCode={serviceCode}
              imagesMap={imagesMap}
            />
          </div>

          {/* Right Box - 1/4 width */}
          <div className="w-1/4">
            <ReviewRanking variant="desktop" serviceCode={serviceCode} />
          </div>
        </div>

        {/* Second Section */}
        <div id="list-section" className="flex flex-col md:flex-row gap-6 items-start">
          {/* Left Box - 3/4 width */}
          <List
            facilities={facilities}
            title="リストで絞り込み検索結果一覧はこちら"
            subtitle="List Search"
            width="3/4"
            gridCols="2"
            serviceCode={serviceCode}
            imagesMap={imagesMap}
          />

          {/* Right Box - 1/4 width - PC only */}
          <div className="hidden md:block w-1/4 bg-white rounded-lg p-5 shadow-md">
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
                該当する店舗及び施設<strong className="text-lg mx-1" style={{ color: '#a69a7e' }}>{facilities.length}</strong>件
              </p>
            </div>

            <FilterControls
              allFacilities={allFacilities}
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
    </section>
  )
}