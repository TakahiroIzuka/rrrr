import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import MarqueeText from '@/components/MarqueeText'
import Footer from '@/components/Footer'

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

  return (
    <>
      <Header
        labelText={genre.name || ''}
        pageType="genre-top"
        genreCode={genre.code}
      />
      <div className="hidden md:block md:mt-0">
        <MarqueeText />
      </div>
      {children}
      <Footer pageType="genre-top" genreCode={genre.code} />
    </>
  )
}
