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

  // Use default name if service not found (e.g., during build)
  const serviceName = service?.name || 'メディカル'

  return (
    <ClientLayout serviceName={serviceName}>
      {children}
    </ClientLayout>
  )
}
