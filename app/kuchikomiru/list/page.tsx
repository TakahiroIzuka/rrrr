import ErrorMessage from '@/components/ErrorMessage'
import List from '@/components/List'
import ReviewRanking from '@/components/ReviewRanking'
import { fetchAllFacilities } from '@/lib/data/facilities'
import { SERVICE_CODE } from '../constants'

export default async function KuchikomiruListPage() {
  // Fetch facilities with code='kuchikomiru'
  const { facilities, error } = await fetchAllFacilities(SERVICE_CODE)

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
        {/* 施設リスト - 2列で表示 */}
        <List
          facilities={facilities || []}
          title="施設はこちら"
          subtitle="List of Local places"
          width="3/4"
          gridCols="2"
        />

        {/* サイドバー - モバイルでは下に表示 */}
        <div className="w-full md:w-1/4 flex flex-col gap-6">
          {/* クチコミルランキング */}
          <div className="w-full">
            <ReviewRanking variant="desktop" />
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
