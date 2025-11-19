import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ReviewCheckForm from '@/components/management/ReviewCheckForm'

interface EditReviewPageProps {
  params: Promise<{ id: string }>
}

export default async function EditReviewPage({ params }: EditReviewPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch review check data, services, and facilities
  const [
    { data: reviewCheck, error },
    { data: services },
    { data: facilities }
  ] = await Promise.all([
    supabase
      .from('review_checks')
      .select('*')
      .eq('id', id)
      .single(),
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

  if (error || !reviewCheck) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">クチコミを編集</h1>
      <ReviewCheckForm
        services={services || []}
        facilities={facilities || []}
        initialData={reviewCheck}
      />
    </div>
  )
}
