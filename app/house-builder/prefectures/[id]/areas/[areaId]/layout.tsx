import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Breadcrumb from '@/components/Breadcrumb'
import Footer from '@/components/Footer'
import { SERVICE_CODE } from '../../../../constants'

interface AreaLayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string; areaId: string }>
}

export default async function AreaLayout({
  children,
  params,
}: AreaLayoutProps) {
  const { id: prefectureId, areaId } = await params
  const supabase = await createClient()

  const { data: area, error } = await supabase
    .from('areas')
    .select('name, prefecture:prefectures(id, name)')
    .eq('id', areaId)
    .single()

  if (error || !area) {
    notFound()
  }

  // Display prefecture and area as separate labels
  const prefectureData = area.prefecture as unknown as { id: number; name: string } | null
  const labelText = prefectureData ? [prefectureData.name, area.name] : [area.name]

  const breadcrumbItems = [
    { label: 'トップ', href: `/${SERVICE_CODE}` },
    { label: prefectureData?.name || '', href: `/${SERVICE_CODE}/prefectures/${prefectureId}` },
    { label: area.name }
  ]

  return (
    <>
      <Header
        labelText={labelText}
        pageType="genre-top"
      />
      <div className="hidden md:block md:mt-0">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      {children}
      <Footer pageType="genre-top" />
    </>
  )
}
