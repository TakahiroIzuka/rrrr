'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface CompanyFormProps {
  company?: {
    id: number
    name: string
    code?: string
  }
}

export default function CompanyForm({ company }: CompanyFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState(company?.name || '')
  const [code, setCode] = useState(company?.code || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      alert('会社名を入力してください')
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()

      if (company) {
        // Update existing company
        const { error } = await supabase
          .from('companies')
          .update({ name, code: code.trim() || null })
          .eq('id', company.id)

        if (error) throw error
        alert('会社を更新しました')
      } else {
        // Insert new company
        const { error } = await supabase
          .from('companies')
          .insert({ name, code: code.trim() || null })

        if (error) throw error
        alert('会社を追加しました')
      }

      router.push('/management/companies')
      router.refresh()
    } catch (error: any) {
      console.error('Error saving company:', error)
      const errorMessage = error?.message || '会社の保存に失敗しました'
      alert(`エラー: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded shadow border border-gray-200 p-6 max-w-2xl">
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
            会社名 <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#2271b1] focus:border-transparent"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="code" className="block text-sm font-semibold text-gray-700 mb-2">
            コード
          </label>
          <input
            type="text"
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#2271b1] focus:border-transparent"
            placeholder="任意のコードを入力"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-[#2271b1] text-white rounded text-sm hover:bg-[#135e96] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '保存中...' : company ? '更新' : '追加'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/management/companies')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors font-medium"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  )
}
