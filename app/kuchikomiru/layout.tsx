import { createClient } from '@/utils/supabase/server'
import { SERVICE_CODE } from './constants'
import KuchikomiruClientLayout from './client-layout'

export default async function KuchikomiruLayout({
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
    throw new Error('Kuchikomiru service not found')
  }

  return (
    <KuchikomiruClientLayout serviceName={service.name}>
      {children}
    </KuchikomiruClientLayout>
  )
}
