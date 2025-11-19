import { createClient } from '@/lib/supabase/server'
import ReviewCheckForm from '@/components/management/ReviewCheckForm'

interface NewReviewPageProps {
  searchParams: Promise<{ serviceId?: string }>
}

export default async function NewReviewPage({ searchParams }: NewReviewPageProps) {
  const { serviceId } = await searchParams
  const supabase = await createClient()

  // Fetch services and facilities with details
  const [
    { data: services },
    { data: facilities }
  ] = await Promise.all([
    supabase.from('services').select('*').order('id'),
    supabase
      .from('facilities')
      .select(`
        id,
        service_id,
        detail:facility_details!facility_id(name)
      `)
      .order('id', { ascending: false })
  ])

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">クチコミを登録</h1>
      <ReviewCheckForm
        services={services || []}
        facilities={facilities || []}
        defaultServiceId={serviceId ? parseInt(serviceId) : undefined}
      />
    </div>
  )
}
