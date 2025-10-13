import ErrorMessage from '@/components/ErrorMessage'
import ClinicHomeClient from '@/components/ClinicHomeClient'
import { fetchAllClinics } from '@/lib/data/kuchikomiru'

export default async function KuchikomiruPage() {
  const { clinics, error } = await fetchAllClinics()

  if (error) {
    return <ErrorMessage message={error.message} />
  }

  return <ClinicHomeClient clinics={clinics || []} />
}
