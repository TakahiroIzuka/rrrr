'use client'

import { useState } from 'react'
import Link from 'next/link'
import DeleteFacilityButton from './DeleteFacilityButton'

interface ServiceData {
  id: number
  name: string
}

interface FacilityData {
  id: number
  service_id: number
  service?: { name: string }
  prefecture?: { name: string }
  area?: { name: string }
  genre?: { name: string }
  detail?: { name: string } | { name: string }[]
}

interface FacilitiesListProps {
  services: ServiceData[]
  facilities: FacilityData[]
}

export default function FacilitiesList({ services, facilities }: FacilitiesListProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<number>(services[0]?.id || 1)

  const filteredFacilities = facilities.filter(f => f.service_id === selectedServiceId)

  return (
    <div className="space-y-6">
      {/* Service Tabs */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => setSelectedServiceId(service.id)}
              className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                selectedServiceId === service.id
                  ? 'bg-[#2271b1] text-white border-b-2 border-[#135e96]'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {service.name}
            </button>
          ))}
        </div>
      </div>

      {/* Facilities Table */}
      <div className="bg-white rounded shadow border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">
            施設一覧 ({filteredFacilities.length}件)
          </h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                編集
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                施設名
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                ジャンル
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                都道府県・地域
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
                削除
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredFacilities.map((facility) => {
              const detail = Array.isArray(facility.detail) ? facility.detail[0] : facility.detail
              const facilityName = detail?.name || '(名前なし)'

              return (
                <tr key={facility.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <Link
                      href={`/management/facilities/${facility.id}/edit`}
                      className="text-[#2271b1] hover:text-[#135e96] font-medium"
                    >
                      編集
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {facility.id}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {facilityName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {facility.genre?.name || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {facility.prefecture?.name} {facility.area?.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                    <DeleteFacilityButton facilityId={facility.id} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filteredFacilities.length === 0 && (
          <div className="px-6 py-8 text-center text-sm text-gray-500">
            施設がありません
          </div>
        )}
      </div>
    </div>
  )
}
