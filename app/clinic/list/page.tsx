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
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-6 items-start">
        <ClinicList
          clinics={clinics || []}
          title="クリニックはこちら"
          subtitle="Clinic List"
          width="3/4"
          gridCols="5"
        />
        <MedicalReviewRanking variant="desktop" />
      </div>
    </div>
  )
}
