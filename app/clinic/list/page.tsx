import { createClient } from '@/utils/supabase/server'
import ErrorMessage from '@/components/ErrorMessage'
import ClinicList from '@/components/ClinicList'
import MedicalReviewRanking from '@/components/MedicalReviewRanking'

export default async function ClinicListPage() {
  const supabase = await createClient()
  const { data: clinics, error } = await supabase
    .from('clinics')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    return <ErrorMessage message={error.message} />
  }

  return (
    <div className="w-full px-4 py-8">
      <div className="flex gap-6 items-start">
        <ClinicList
          clinics={clinics || []}
          title="クリニックはこちら"
          subtitle="Clinic List"
          width="3/4"
          gridCols="5"
        />
        <div className="w-1/4 flex flex-col gap-6">
          <div className="w-full">
            <MedicalReviewRanking variant="desktop" />
          </div>
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
              <button className="py-1.5 px-2 text-white text-xs font-medium rounded hover:opacity-90 transition-all duration-200 flex items-center gap-1 group" style={{ backgroundColor: 'rgba(166, 154, 126, 1)' }}>
                <span>鹿児島県</span>
                <span className="flex items-center justify-center w-4 h-4 bg-white rounded-full transition-all duration-200 group-hover:translate-x-1 flex-shrink-0">
                  <span className="font-bold text-base leading-none inline-block" style={{ color: 'rgba(166, 154, 126, 1)', transform: 'translate(0.5px, -1.5px)' }}>›</span>
                </span>
              </button>
              <button className="py-1.5 px-2 text-white text-xs font-medium rounded hover:opacity-90 transition-all duration-200 flex items-center gap-1 group" style={{ backgroundColor: 'rgba(166, 154, 126, 1)' }}>
                <span>東京都</span>
                <span className="flex items-center justify-center w-4 h-4 bg-white rounded-full transition-all duration-200 group-hover:translate-x-1 flex-shrink-0">
                  <span className="font-bold text-base leading-none inline-block" style={{ color: 'rgba(166, 154, 126, 1)', transform: 'translate(0.5px, -1.5px)' }}>›</span>
                </span>
              </button>
              <button className="py-1.5 px-2 text-white text-xs font-medium rounded hover:opacity-90 transition-all duration-200 flex items-center gap-1 group" style={{ backgroundColor: 'rgba(166, 154, 126, 1)' }}>
                <span>神奈川県</span>
                <span className="flex items-center justify-center w-4 h-4 bg-white rounded-full transition-all duration-200 group-hover:translate-x-1 flex-shrink-0">
                  <span className="font-bold text-base leading-none inline-block" style={{ color: 'rgba(166, 154, 126, 1)', transform: 'translate(0.5px, -1.5px)' }}>›</span>
                </span>
              </button>
              <button className="py-1.5 px-2 text-white text-xs font-medium rounded hover:opacity-90 transition-all duration-200 flex items-center gap-1 group" style={{ backgroundColor: 'rgba(166, 154, 126, 1)' }}>
                <span>千葉県</span>
                <span className="flex items-center justify-center w-4 h-4 bg-white rounded-full transition-all duration-200 group-hover:translate-x-1 flex-shrink-0">
                  <span className="font-bold text-base leading-none inline-block" style={{ color: 'rgba(166, 154, 126, 1)', transform: 'translate(0.5px, -1.5px)' }}>›</span>
                </span>
              </button>
              <button className="py-1.5 px-2 text-white text-xs font-medium rounded hover:opacity-90 transition-all duration-200 flex items-center gap-1 group" style={{ backgroundColor: 'rgba(166, 154, 126, 1)' }}>
                <span>埼玉県</span>
                <span className="flex items-center justify-center w-4 h-4 bg-white rounded-full transition-all duration-200 group-hover:translate-x-1 flex-shrink-0">
                  <span className="font-bold text-base leading-none inline-block" style={{ color: 'rgba(166, 154, 126, 1)', transform: 'translate(0.5px, -1.5px)' }}>›</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
