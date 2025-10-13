import ErrorMessage from '@/components/ErrorMessage'
import HomeClient from '@/components/HomeClient'
import { fetchAllFacilities } from '@/lib/data/facilities'

export default async function HomePage() {
  // Fetch facilities with code='medical'
  const { facilities, error } = await fetchAllFacilities('medical')

  if (error) {
    return <ErrorMessage message={error.message} />
  }

  return <HomeClient facilities={facilities || []} />
}