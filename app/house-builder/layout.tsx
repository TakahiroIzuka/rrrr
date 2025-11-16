import { createClient } from '@/utils/supabase/server'
import { SERVICE_CODE } from './constants'
import HouseBuilderClientLayout from './client-layout'

export default async function HouseBuilderLayout({
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
    throw new Error('House builder service not found')
  }

  return (
    <HouseBuilderClientLayout serviceName={service.name}>
      {children}
    </HouseBuilderClientLayout>
  )
}
