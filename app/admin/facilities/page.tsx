import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import DeleteFacilityButton from '@/components/admin/DeleteFacilityButton'

export default async function FacilitiesPage() {
  const supabase = await createClient()

  const { data: facilities, error } = await supabase
    .from('facilities')
    .select(`
      *,
      service:services(name),
      prefecture:prefectures(name),
      area:areas(name),
      genre:genres(name),
      detail:facility_details!facility_id(name)
    `)
    .order('id', { ascending: false })

  if (error) {
    console.error('Error fetching facilities:', error)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">施設管理</h1>
        <Link
          href="/admin/facilities/new"
          className="px-4 py-2 bg-[#2271b1] text-white rounded text-sm hover:bg-[#135e96] transition-colors font-medium"
        >
          新規追加
        </Link>
      </div>

      <div className="bg-white rounded shadow border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                施設名
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                サービス
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                ジャンル
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                エリア
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {facilities?.map((facility: any) => {
              const detail = Array.isArray(facility.detail) ? facility.detail[0] : facility.detail
              const facilityName = detail?.name || '(名前なし)'

              return (
                <tr key={facility.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {facility.id}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {facilityName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {facility.service?.name || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {facility.genre?.name || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {facility.prefecture?.name} {facility.area?.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                    <Link
                      href={`/admin/facilities/${facility.id}/edit`}
                      className="text-[#2271b1] hover:text-[#135e96] mr-4 font-medium"
                    >
                      編集
                    </Link>
                    <DeleteFacilityButton facilityId={facility.id} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
