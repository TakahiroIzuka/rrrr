import ErrorMessage from '@/components/ErrorMessage'
import HomeClient from '@/components/HomeClient'
import { fetchAllFacilities } from '@/lib/data/facilities'
import { SERVICE_CODES } from '@/lib/constants/services'

export default async function HomePage() {
  // Fetch facilities with code='medical'
  const { facilities, error } = await fetchAllFacilities(SERVICE_CODES.MEDICAL)

  if (error) {
    return <ErrorMessage message={error.message} />
  }

  return <HomeClient facilities={facilities || []} serviceCode={SERVICE_CODES.MEDICAL} />
}