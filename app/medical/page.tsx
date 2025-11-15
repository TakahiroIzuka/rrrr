import ErrorMessage from '@/components/ErrorMessage'
import HomeClient from '@/components/HomeClient'
import { fetchAllFacilities, fetchFacilitiesImages } from '@/lib/data/facilities'
import { SERVICE_CODES } from '@/lib/constants/services'

export default async function HomePage() {
  // Fetch facilities with code='medical'
  const { facilities, error } = await fetchAllFacilities(SERVICE_CODES.MEDICAL)

  if (error) {
    return <ErrorMessage message={error.message} />
  }

  // Fetch images for all facilities
  const facilityIds = facilities?.map(f => f.id) || []
  const { imagesMap } = await fetchFacilitiesImages(facilityIds)

  return <HomeClient facilities={facilities || []} imagesMap={imagesMap} />
}