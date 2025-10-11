import { createClient } from '@/utils/supabase/server'
import ErrorMessage from '@/components/ErrorMessage'
import { notFound } from 'next/navigation'

interface ClinicDetailPageProps {
  params: {
    id: string
  }
}

export default async function ClinicDetailPage({ params }: ClinicDetailPageProps) {
  const supabase = await createClient()

  const { data: clinic, error } = await supabase
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
    .eq('id', params.id)
    .single()

  if (error || !clinic) {
    notFound()
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="hidden md:block py-1" style={{ backgroundColor: '#fff9f0' }}>
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
              <li className="text-black">{clinic.name}</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* コンテンツ */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          {/* タイトル */}
          <h1 className="text-3xl font-bold mb-6">{clinic.name}</h1>

          {/* 4分割コンテンツ */}
          <div className="mb-4">
            <p>div1</p>
          </div>
          <div className="mb-4">
            <p>div2</p>
          </div>
          <div className="mb-4">
            <p>div3</p>
          </div>
          <div>
            <p>div4</p>
          </div>
        </div>
      </div>
    </>
  )
}
