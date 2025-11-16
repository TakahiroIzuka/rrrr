import { createAnonClient } from '@/utils/supabase/server'
import { SERVICE_CODE } from './constants'
import ClientLayout from './client-layout'

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createAnonClient()

  const { data: service } = await supabase
    .from('services')
    .select('name')
    .eq('code', SERVICE_CODE)
    .single()

  if (!service) {
    throw new Error(`${SERVICE_CODE} service not found`)
  }

  return (
    <ClientLayout serviceName={service.name}>
      {children}
    </ClientLayout>
  )
}
