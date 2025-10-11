import { createClient } from '@/utils/supabase/server'
import ErrorMessage from '@/components/ErrorMessage'
import HomeClient from './HomeClient'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: clinics, error } = await supabase
    .from('clinics')
    .select(`
      *,
      prefecture:prefectures(
        id,
        name
      ),
      area:areas(
        id,
        name
      )
    `)
    .order('id', { ascending: true })

  if (error) {
    return <ErrorMessage message={error.message} />
  }

  return <HomeClient clinics={clinics || []} />
}