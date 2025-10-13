import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

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
      genre:genres(
        name
      ),
      clinic_detail:clinic_details(
        name
      )
    `)
    .eq('id', id)
    .single()

  if (error || !clinic) {
    notFound()
  }

  const genreName = (clinic.genre as any)?.name || ''
  const clinicName = (clinic.clinic_detail as any)?.name || ''

  return (
    <>
      <Header
        imagePath="/mrr/default/logo_header.png"
        lineColor="#a69a7e"
        color="#acd1e6"
        labelText={genreName || ''}
      />
      {/* Breadcrumb */}
      <div className="block py-1" style={{ backgroundColor: '#fff9f0' }}>
        <div className="mx-[30px]">
          <nav className="text-[12px]">
            <ol className="flex items-center gap-2">
              <li>
                <a href="/clinic" className="text-black hover:underline transition-colors">トップ</a>
              </li>
              <li className="text-black">&gt;</li>
              <li>
                <a href="/clinics" className="text-black hover:underline transition-colors">クリニック・施設一覧</a>
              </li>
              <li className="text-black">&gt;</li>
              <li className="text-black">{clinicName}</li>
            </ol>
          </nav>
        </div>
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
