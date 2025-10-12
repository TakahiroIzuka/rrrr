import type { Clinic } from '@/types/clinic'
import { GENRE_MAP, RANKING_OPTIONS } from '@/lib/constants'

interface FilterControlsProps {
  allClinics: Clinic[]
  selectedPrefectures: string[]
  selectedGenres: number[]
  selectedRanking: string
  onPrefectureChange: (prefecture: string) => void
  onGenreChange: (genreId: number) => void
  onRankingChange: (ranking: string) => void
  hideGenreFilter?: boolean
}

export default function FilterControls({
  allClinics,
  selectedPrefectures,
  selectedGenres,
  selectedRanking,
  onPrefectureChange,
  onGenreChange,
  onRankingChange,
  hideGenreFilter = false
}: FilterControlsProps) {
  const uniquePrefectures = Array.from(new Set(allClinics.map(clinic => clinic.prefecture?.name).filter(Boolean))).sort()
  const uniqueGenres = Array.from(new Set(allClinics.map(clinic => clinic.genre_id))).sort()

  return (
    <>
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
                onChange={() => onPrefectureChange(prefecture)}
                className="w-3 h-3 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-gray-700 text-xs font-medium">{prefecture}</span>
              <span className="text-xs text-gray-500">
                ({allClinics.filter(c => c.prefecture?.name === prefecture).length})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Genre Filter */}
      {!hideGenreFilter && (
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
                  onChange={() => onGenreChange(genreId)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-xs text-gray-700 font-medium">{GENRE_MAP[genreId as keyof typeof GENRE_MAP]}</span>
                <span className="text-xs text-gray-500">
                  ({allClinics.filter(c => c.genre_id === genreId).length})
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Google Review Ranking Filter */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 px-2 py-1 rounded" style={{ backgroundColor: '#eae3db' }}>
          Googleクチコミランキング
        </h4>
        <div className="flex flex-wrap gap-2">
          {RANKING_OPTIONS.map((ranking) => (
            <label key={ranking} className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded text-sm border border-gray-200 bg-white">
              <input
                type="checkbox"
                checked={selectedRanking === ranking}
                onChange={() => onRankingChange(ranking)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-xs text-gray-700 font-medium">{ranking}</span>
            </label>
          ))}
        </div>
      </div>
    </>
  )
}
