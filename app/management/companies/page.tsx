import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import DeleteCompanyButton from '@/components/management/DeleteCompanyButton'

export default async function CompaniesPage() {
  const supabase = await createClient()

  const { data: companies, error } = await supabase
    .from('companies')
    .select('*')
    .order('id', { ascending: false })

  if (error) {
    console.error('Error fetching companies:', error)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">会社管理</h1>
        <Link
          href="/management/companies/new"
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
                会社名
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {companies?.map((company: any) => (
              <tr key={company.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {company.id}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {company.name}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                  <Link
                    href={`/management/companies/${company.id}/edit`}
                    className="text-[#2271b1] hover:text-[#135e96] mr-4 font-medium"
                  >
                    編集
                  </Link>
                  <DeleteCompanyButton companyId={company.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
