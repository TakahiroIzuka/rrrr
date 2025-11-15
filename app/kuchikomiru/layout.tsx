import { createClient } from '@/utils/supabase/server'
import { SERVICE_CODES } from '@/lib/constants/services'
import KuchikomiruClientLayout from './client-layout'

export default async function KuchikomiruLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: service } = await supabase
    .from('services')
    .select('code, name')
    .eq('code', SERVICE_CODES.KUCHIKOMIRU)
    .single()

  if (!service) {
    throw new Error('Kuchikomiru service not found')
  }

  return (
    <KuchikomiruClientLayout service={service}>
      {children}
    </KuchikomiruClientLayout>
  )
}
