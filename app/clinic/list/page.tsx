import { createClient } from '@/utils/supabase/server'
import ErrorMessage from '@/components/ErrorMessage'
import ClinicList from '@/components/ClinicList'

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
      <ClinicList
        clinics={clinics || []}
        title="クリニックはこちら"
        subtitle="Clinic List"
        width="full"
        gridCols="5"
      />
    </div>
  )
}
