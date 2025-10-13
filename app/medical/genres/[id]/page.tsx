import ErrorMessage from '@/components/ErrorMessage'
import { notFound } from 'next/navigation'
import HomeClient from '@/components/HomeClient'
import { fetchFacilitiesByGenre, fetchGenreById } from '@/lib/data/facilities'

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

  // Get facilities filtered by genre_id
  const { facilities, error } = await fetchFacilitiesByGenre(params.id)

  if (error) {
    return <ErrorMessage message={error.message} />
  }

  return (
    <HomeClient
      facilities={facilities || []}
      genreId={genre.id}
      genreName={genre.name}
      genreCode={genre.code}
    />
  )
}
