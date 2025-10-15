import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getGenreColor } from '@/lib/utils/genreColors'
import { getGenreImagePath } from '@/lib/utils/imagePath'

interface FacilityDetailLayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export default async function FacilityDetailLayout({
  children,
  params,
}: FacilityDetailLayoutProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: facility, error } = await supabase
    .from('facilities')
    .select(`
      genre:genres(
        name,
        code
      ),
      detail:facility_details!facility_id(
        name
      )
    `)
    .eq('id', id)
    .single()

  if (error || !facility) {
    notFound()
  }

  const genreData = facility.genre as { name?: string; code?: string } | null
  const genreName = genreData?.name || ''
  const genreCode = genreData?.code
  const facilityName = Array.isArray(facility.detail)
    ? (facility.detail[0] as { name?: string })?.name || ''
    : (facility.detail as { name?: string })?.name || ''

  const genreColor = getGenreColor(genreCode)
  const headerImagePath = getGenreImagePath('kuchikomiru', genreCode, 'logo_header.png')
  const footerImagePath = getGenreImagePath('kuchikomiru', genreCode, 'logo_footer.png')

  return (
    <>
      <Header
        imagePath={headerImagePath}
        lineColor={genreColor}
        color={genreColor}
        labelText={genreName || ''}
      />
      {/* Breadcrumb */}
      <div className="block py-1" style={{ backgroundColor: '#fff9f0' }}>
        <div className="mx-[30px]">
          <nav className="text-[12px]">
            <ol className="flex items-center gap-2">
              <li>
                <a href="/kuchikomiru" className="text-black hover:underline transition-colors">トップ</a>
              </li>
              <li className="text-black">&gt;</li>
              <li>
                <a href="/kuchikomiru/list" className="text-black hover:underline transition-colors">施設一覧</a>
              </li>
              <li className="text-black">&gt;</li>
              <li className="text-black">{facilityName}</li>
            </ol>
          </nav>
        </div>
      </div>
      {children}
      <Footer
        imagePath={footerImagePath}
        buttonText="地域密着店舗・施設の掲載リクエストはこちら"
        type="accomodation"
      />
    </>
  )
}
