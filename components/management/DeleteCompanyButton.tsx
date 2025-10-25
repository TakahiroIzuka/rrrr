'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface DeleteCompanyButtonProps {
  companyId: number
}

export default function DeleteCompanyButton({ companyId }: DeleteCompanyButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('この会社を削除してもよろしいですか？')) {
      return
    }

    setIsDeleting(true)

    try {
      const supabase = createClient()

      // Delete the company
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId)

      if (error) {
        throw error
      }

      alert('会社を削除しました')
      router.refresh()
    } catch (error) {
      console.error('Error deleting company:', error)
      alert('会社の削除に失敗しました')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-[#d63638] hover:text-[#a00] disabled:opacity-50 disabled:cursor-not-allowed font-medium"
    >
      {isDeleting ? '削除中...' : '削除'}
    </button>
  )
}
