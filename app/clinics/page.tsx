import ErrorMessage from '@/components/ErrorMessage'
import ClinicList from '@/components/ClinicList'
import MedicalReviewRanking from '@/components/MedicalReviewRanking'
import { fetchAllFacilities } from '@/lib/data/facilities'

export default async function ClinicListPage() {
  const { facilities, error } = await fetchAllFacilities()

  if (error) {
    return <ErrorMessage message={error.message} />
  }

  // Extract unique prefectures from facilities data
  const uniquePrefectures = Array.from(
    new Set(
      (facilities || [])
        .map(facility => facility.prefecture?.name)
        .filter(Boolean)
    )
  ).sort()

  return (
    <div className="w-full px-[5px] md:px-4 pt-5 md:py-8">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* クリニックリスト - 2列で表示 */}
        <ClinicList
          facilities={facilities || []}
          title="クリニックはこちら"
          subtitle="List of Local places"
          width="3/4"
          gridCols="2"
        />

        {/* サイドバー - モバイルでは下に表示 */}
        <div className="w-full md:w-1/4 flex flex-col gap-6">
          {/* メディカルクチコミランキング */}
          <div className="w-full">
            <MedicalReviewRanking variant="desktop" />
          </div>

          {/* 各エリアから探す */}
          <div className="w-full bg-white rounded-lg p-5 shadow-md">
            {/* Title */}
            <div className="mb-3">
              <h3 className="text-base font-bold text-gray-700 text-center">
                各エリアから探す
              </h3>
              <div className="w-12 h-1 mx-auto mt-2 rounded-full" style={{ backgroundColor: 'rgba(166, 154, 126, 1)' }}></div>
            </div>

            {/* Area Buttons */}
            <div className="flex flex-wrap gap-2">
              {uniquePrefectures.map((prefecture) => (
                <button
                  key={prefecture}
                  className="py-1.5 px-2 text-white text-xs font-medium rounded hover:opacity-90 transition-all duration-200 flex items-center gap-1 group"
                  style={{ backgroundColor: 'rgba(166, 154, 126, 1)' }}
                >
                  <span>{prefecture}</span>
                  <span className="flex items-center justify-center w-4 h-4 bg-white rounded-full transition-all duration-200 group-hover:translate-x-1 flex-shrink-0">
                    <span className="font-bold text-base leading-none inline-block" style={{ color: 'rgba(166, 154, 126, 1)', transform: 'translate(0.5px, -1.5px)' }}>›</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
