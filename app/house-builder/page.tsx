import ErrorMessage from '@/components/ErrorMessage'
import HomeClient from '@/components/HomeClient'
import { fetchAllFacilities } from '@/lib/data/facilities'
import { SERVICE_CODES } from '@/lib/constants/services'

export default async function HouseBuilderPage() {
  const { facilities, error } = await fetchAllFacilities(SERVICE_CODES.HOUSE_BUILDER)

  if (error) {
    return <ErrorMessage message={error.message} />
  }

  return <HomeClient facilities={facilities || []} />
}
