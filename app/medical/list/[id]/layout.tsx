import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getGenreColor } from '@/lib/utils/genreColors'

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

  const genreName = (facility.genre as { name?: string; code?: string })?.name || ''
  const genreCode = (facility.genre as { name?: string; code?: string })?.code
  const facilityName = Array.isArray(facility.detail)
    ? (facility.detail[0] as { name?: string })?.name || ''
    : (facility.detail as { name?: string })?.name || ''
  const genreColor = getGenreColor(genreCode)

  return (
    <>
      <Header
        imagePath="/medical/default/logo_header.png"
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
                <a href="/medical" className="text-black hover:underline transition-colors">トップ</a>
              </li>
              <li className="text-black">&gt;</li>
              <li>
                <a href="/medical/list" className="text-black hover:underline transition-colors">クリニック・施設一覧</a>
              </li>
              <li className="text-black">&gt;</li>
              <li className="text-black">{facilityName}</li>
            </ol>
          </nav>
        </div>
      </div>
      {children}
      <Footer
        imagePath="/medical/default/logo_footer.png"
        buttonText="クリニック・施設の掲載リクエストはこちら"
        type="clinic"
      />
    </>
  )
}
