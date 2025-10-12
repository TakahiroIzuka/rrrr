import { createClient } from '@/utils/supabase/server'
import ErrorMessage from '@/components/ErrorMessage'
import { notFound } from 'next/navigation'
import GenreHomeClient from './GenreHomeClient'

interface GenrePageProps {
  params: {
    id: string
  }
}

export default async function GenrePage({ params }: GenrePageProps) {
  const supabase = await createClient()

  // Get genre information
  const { data: genre, error: genreError } = await supabase
    .from('genres')
    .select('id, name, code')
    .eq('id', params.id)
    .single()

  if (genreError || !genre) {
    notFound()
  }

  // Get clinics filtered by genre_id
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
    .eq('genre_id', params.id)
    .order('id', { ascending: true })

  if (error) {
    return <ErrorMessage message={error.message} />
  }

  // Transform clinic_detail from array to single object
  const clinics = clinicsData?.map(clinic => ({
    ...clinic,
    clinic_detail: Array.isArray(clinic.clinic_detail) ? clinic.clinic_detail[0] : clinic.clinic_detail
  }))

  return <GenreHomeClient clinics={clinics || []} genreId={genre.id} genreName={genre.name} genreCode={genre.code} />
}
