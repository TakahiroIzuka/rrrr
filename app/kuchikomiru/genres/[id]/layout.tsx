import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import MarqueeText from '@/components/MarqueeText'
import Footer from '@/components/Footer'
import { getGenreImagePath } from '@/lib/utils/imagePath'
import { getGenreColor } from '@/lib/utils/genreColors'
import { SERVICE_CODES } from '@/lib/constants/services'

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

  const headerImagePath = getGenreImagePath('kuchikomiru', genre.code, 'logo_header.png')
  const genreColor = getGenreColor(genre.code)

  return (
    <>
      <Header
        imagePath={headerImagePath}
        lineColor={genreColor}
        color={genreColor}
        labelText={genre.name || ''}
        serviceCode="kuchikomiru"
        serviceName="クチコミル"
      />
      <div className="mt-16 md:mt-0">
        <MarqueeText />
      </div>
      {children}
      <Footer serviceCode={SERVICE_CODES.KUCHIKOMIRU} />
    </>
  )
}
