import { createClient } from '@/utils/supabase/server'
import { SERVICE_CODES } from '@/lib/constants/services'
import MedicalClientLayout from './client-layout'

export default async function MedicalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: service } = await supabase
    .from('services')
    .select('code, name')
    .eq('code', SERVICE_CODES.MEDICAL)
    .single()

  if (!service) {
    throw new Error('Medical service not found')
  }

  return (
    <MedicalClientLayout service={service}>
      {children}
    </MedicalClientLayout>
  )
}
