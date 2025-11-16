import ErrorMessage from '@/components/ErrorMessage'
import HomeClient from '@/components/HomeClient'
import { fetchAllFacilities, fetchFacilitiesImages } from '@/lib/data/facilities'
import { SERVICE_CODE } from './constants'

export default async function Page() {
  const { facilities, error } = await fetchAllFacilities(SERVICE_CODE)

  if (error) {
    return <ErrorMessage message={error.message} />
  }

  // Fetch images for all facilities
  const facilityIds = facilities?.map(f => f.id) || []
  const { imagesMap } = await fetchFacilitiesImages(facilityIds)

  return <HomeClient facilities={facilities || []} imagesMap={imagesMap} />
}