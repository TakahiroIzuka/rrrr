import { createClient } from '@/utils/supabase/server'
import { SERVICE_CODES } from '@/lib/constants/services'
import HouseBuilderClientLayout from './client-layout'

export default async function HouseBuilderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: service } = await supabase
    .from('services')
    .select('code, name')
    .eq('code', SERVICE_CODES.HOUSE_BUILDER)
    .single()

  if (!service) {
    throw new Error('House builder service not found')
  }

  return (
    <HouseBuilderClientLayout service={service}>
      {children}
    </HouseBuilderClientLayout>
  )
}
