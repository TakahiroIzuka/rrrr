import ErrorMessage from '@/components/ErrorMessage'
import { notFound } from 'next/navigation'
import HomeClient from '@/components/HomeClient'
import { fetchFacilitiesByGenre, fetchGenreById } from '@/lib/data/facilities'
import { SERVICE_CODES } from '@/lib/constants/services'

interface GenrePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function GenrePage({ params }: GenrePageProps) {
  const { id } = await params

  // Get genre information
  const { genre, error: genreError } = await fetchGenreById(id)

  if (genreError || !genre) {
    notFound()
  }

  // Get facilities filtered by genre_id
  const { facilities, error } = await fetchFacilitiesByGenre(id, SERVICE_CODES.HOUSE_BUILDER)

  if (error) {
    return <ErrorMessage message={error.message} />
  }

  return (
    <HomeClient
      facilities={facilities || []}
      genreId={genre.id}
      genreName={genre.name}
      genreCode={genre.code}
      serviceCode={SERVICE_CODES.HOUSE_BUILDER}
    />
  )
}
