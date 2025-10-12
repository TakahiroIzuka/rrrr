import ErrorMessage from '@/components/ErrorMessage'
import ClinicHomeClient from '@/components/ClinicHomeClient'
import { fetchAllClinics } from '@/lib/data/clinics'

export default async function HomePage() {
  const { clinics, error } = await fetchAllClinics()

  if (error) {
    return <ErrorMessage message={error.message} />
  }

  return <ClinicHomeClient clinics={clinics || []} />
}