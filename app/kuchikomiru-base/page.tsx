import { createClient } from '@/utils/supabase/server'
import ErrorMessage from '@/components/ErrorMessage'
import ClinicList from '@/components/ClinicList'

export default async function KuchikomiruBasePage() {
  const supabase = await createClient()
  const { data: clinicsData, error } = await supabase
    .from('clinics')
    .select(`
      *,
      prefecture:prefectures(
        id,
        name
      ),
      area:areas(
        id,
        name
      ),
      clinic_detail:clinic_details!clinic_id(
        name,
        star,
        user_review_count,
        lat,
        lng,
        site_url,
        postal_code,
        address,
        tel
      )
    `)
    .order('id', { ascending: true })

  if (error) {
    return <ErrorMessage message={error.message} />
  }

  // Transform clinic_detail from array to single object
  const clinics = clinicsData?.map(clinic => ({
    ...clinic,
    clinic_detail: Array.isArray(clinic.clinic_detail) ? clinic.clinic_detail[0] : clinic.clinic_detail
  }))

  return (
    <div className="container mx-auto px-4 py-8"></div>
  )
}
