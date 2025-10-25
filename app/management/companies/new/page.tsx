import CompanyForm from '@/components/management/CompanyForm'

export default function NewCompanyPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">会社を追加</h1>
      <CompanyForm />
    </div>
  )
}
