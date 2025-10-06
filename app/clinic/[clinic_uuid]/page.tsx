import { createClient } from '@/utils/supabase/server'
import ErrorMessage from '@/components/ErrorMessage'
import { notFound } from 'next/navigation'

interface ClinicDetailPageProps {
  params: {
    clinic_uuid: string
  }
}

export default async function ClinicDetailPage({ params }: ClinicDetailPageProps) {
  const supabase = await createClient()

  const { data: clinic, error } = await supabase
    .from('clinics')
    .select(`
      *,
      area:areas(
        id,
        name,
        prefecture_id,
        prefecture:prefectures(
          id,
          name
        )
      )
    `)
    .eq('uuid', params.clinic_uuid)
    .single()

  if (error || !clinic) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{clinic.name}</h1>
      <div className="bg-white rounded-lg p-6 shadow-md">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">基本情報</h2>
          <p className="text-gray-600">都道府県: {clinic.area?.prefecture?.name}</p>
          <p className="text-gray-600">エリア: {clinic.area?.name}</p>
          <p className="text-gray-600">評価: {clinic.star ?? '未評価'}</p>
          <p className="text-gray-600">レビュー数: {clinic.user_review_count}件</p>
        </div>
      </div>
    </div>
  )
}
