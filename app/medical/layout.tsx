import { createClient } from '@/utils/supabase/server'
import { SERVICE_CODE } from './constants'
import MedicalClientLayout from './client-layout'

export default async function MedicalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: service } = await supabase
    .from('services')
    .select('name')
    .eq('code', SERVICE_CODE)
    .single()

  if (!service) {
    throw new Error('Medical service not found')
  }

  return (
    <MedicalClientLayout serviceName={service.name}>
      {children}
    </MedicalClientLayout>
  )
}
