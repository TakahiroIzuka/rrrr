import ErrorMessage from '@/components/ErrorMessage'
import ClinicHomeClient from '@/components/ClinicHomeClient'
import { fetchAllFacilities } from '@/lib/data/facilities'

export default async function HomePage() {
  const { facilities, error } = await fetchAllFacilities()

  if (error) {
    return <ErrorMessage message={error.message} />
  }

  return <ClinicHomeClient facilities={facilities || []} />
}