import ErrorMessage from '@/components/ErrorMessage'
import { notFound } from 'next/navigation'
import HomeClient from '@/components/HomeClient'
import { fetchFacilitiesByGenre, fetchGenreById } from '@/lib/data/facilities'
import { SERVICE_CODE } from '../../constants'

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

  const { facilities, error } = await fetchFacilitiesByGenre(id, SERVICE_CODE)

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
