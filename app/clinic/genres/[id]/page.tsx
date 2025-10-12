import ErrorMessage from '@/components/ErrorMessage'
import { notFound } from 'next/navigation'
import ClinicHomeClient from '@/components/ClinicHomeClient'
import { fetchClinicsByGenre, fetchGenreById } from '@/lib/data/clinics'

interface GenrePageProps {
  params: {
    id: string
  }
}

export default async function GenrePage({ params }: GenrePageProps) {
  // Get genre information
  const { genre, error: genreError } = await fetchGenreById(params.id)

  if (genreError || !genre) {
    notFound()
  }

  // Get clinics filtered by genre_id
  const { clinics, error } = await fetchClinicsByGenre(params.id)

  if (error) {
    return <ErrorMessage message={error.message} />
  }

  return (
    <ClinicHomeClient
      clinics={clinics || []}
      genreId={genre.id}
      genreName={genre.name}
      genreCode={genre.code}
    />
  )
}
