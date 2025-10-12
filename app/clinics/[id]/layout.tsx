import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import DetailHeader from './DetailHeader'
import DetailFooter from './DetailFooter'

interface ClinicDetailLayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export default async function ClinicDetailLayout({
  children,
  params,
}: ClinicDetailLayoutProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: clinic, error } = await supabase
    .from('clinics')
    .select(`
      genre_id,
      genre:genres(
        id,
        name,
        code
      )
    `)
    .eq('id', id)
    .single()

  if (error || !clinic) {
    notFound()
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: '.clinic-list-breadcrumb { display: none !important; }'
      }} />
      <DetailHeader genreId={clinic.genre_id} genreName={clinic.genre?.name || ''} genreCode={clinic.genre?.code} />
      {children}
      <DetailFooter genreId={clinic.genre_id} genreCode={clinic.genre?.code} />
    </>
  )
}
