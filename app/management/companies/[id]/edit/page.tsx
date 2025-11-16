import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CompanyForm from '@/components/management/CompanyForm'

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single()

  if (!company) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">会社を編集</h1>
      <CompanyForm company={company} />
    </div>
  )
}
