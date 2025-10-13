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
    .select('name')
    .eq('id', id)
    .single()

  if (error || !genre) {
    notFound()
  }

  return (
    <>
      <Header
        imagePath="/mrr/default/logo_header.png"
        lineColor="#a69a7e"
        color="#acd1e6"
        labelText={genre.name || ''}
      />
      <div className="mt-16 md:mt-0">
        <MarqueeText />
      </div>
      {children}
      <Footer
        imagePath="/mrr/default/logo_footer.png"
        buttonText="クリニック・施設の掲載リクエストはこちら"
        type="clinic"
      />
    </>
  )
}
