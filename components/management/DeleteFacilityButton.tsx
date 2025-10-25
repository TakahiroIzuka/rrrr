'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface DeleteFacilityButtonProps {
  facilityId: number
}

export default function DeleteFacilityButton({ facilityId }: DeleteFacilityButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('この施設を削除してもよろしいですか？')) {
      return
    }

    setIsDeleting(true)

    try {
      const supabase = createClient()

      // Delete related facility_details first
      await supabase
        .from('facility_details')
        .delete()
        .eq('facility_id', facilityId)

      // Delete facility_images
      await supabase
        .from('facility_images')
        .delete()
        .eq('facility_id', facilityId)

      // Delete the facility
      const { error } = await supabase
        .from('facilities')
        .delete()
        .eq('id', facilityId)

      if (error) {
        throw error
      }

      alert('施設を削除しました')
      router.refresh()
    } catch (error) {
      console.error('Error deleting facility:', error)
      alert('施設の削除に失敗しました')
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
