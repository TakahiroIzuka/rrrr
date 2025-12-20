import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Breadcrumb from '@/components/Breadcrumb'
import Footer from '@/components/Footer'
import { SERVICE_CODE } from '../../constants'

interface GenreLayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export default async function GenreLayout({
  children,
  params,
}: GenreLayoutProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: genre, error } = await supabase
    .from('genres')
    .select('name, code')
    .eq('id', id)
    .single()

  if (error || !genre) {
    notFound()
  }

  const breadcrumbItems = [
    { label: 'トップ', href: `/${SERVICE_CODE}` },
    { label: genre.name }
  ]

  return (
    <>
      <Header
        labelText={genre.name || ''}
        pageType="genre-top"
        genreCode={genre.code}
      />
      <div className="hidden md:block md:mt-0">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      {children}
      <Footer pageType="genre-top" genreCode={genre.code} />
    </>
  )
}
