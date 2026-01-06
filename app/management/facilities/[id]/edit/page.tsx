import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import FacilityForm from '@/components/management/FacilityForm'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditFacilityPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Get current logged-in user
  const { data: { user: authUser } } = await supabase.auth.getUser()

  // Fetch current user's data from users table
  const { data: currentUser } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', authUser?.id)
    .single()

  // Fetch facility data
  const { data: facility, error } = await supabase
    .from('facilities')
    .select(`
      *,
      detail:facility_details!facility_id(*)
    `)
    .eq('id', id)
    .single()

  if (error || !facility) {
    notFound()
  }

  // Fetch facility images (excluding logo)
  const { data: images } = await supabase
    .from('facility_images')
    .select('*')
    .eq('facility_id', id)
    .eq('is_logo', false)
    .order('display_order', { ascending: true })

  // Fetch logo image
  const { data: logoData } = await supabase
    .from('facility_images')
    .select('*')
    .eq('facility_id', id)
    .eq('is_logo', true)
    .single()

  // Get public URLs for images
  const imagesWithUrls = (images || []).map(img => {
    const { data: publicData } = supabase.storage
      .from('facility-images')
      .getPublicUrl(img.image_path)

    const thumbnailData = img.thumbnail_path
      ? supabase.storage.from('facility-images').getPublicUrl(img.thumbnail_path)
      : null

    return {
      ...img,
      publicUrl: publicData.publicUrl,
      thumbnailUrl: thumbnailData?.data.publicUrl || null
    }
  })

  // Get public URL for logo (logo uses thumbnail_path for storage)
  const logoWithUrl = logoData?.thumbnail_path ? {
    id: logoData.id,
    facility_id: logoData.facility_id,
    image_path: logoData.thumbnail_path,
    publicUrl: supabase.storage.from('facility-images').getPublicUrl(logoData.thumbnail_path).data.publicUrl
  } : null

  // Fetch master data
  const [
    { data: genres },
    { data: prefectures },
    { data: areas },
    { data: companies },
    { data: giftCodeAmounts }
  ] = await Promise.all([
    supabase.from('genres').select('*, service_id').order('id'),
    supabase.from('prefectures').select('*').order('id'),
    supabase.from('areas').select('*, prefecture_id').order('id'),
    supabase.from('companies').select('*').order('id'),
    supabase.from('gift_code_amounts').select('id, amount').order('amount', { ascending: true })
  ])

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">施設を編集</h1>
      <FacilityForm
        genres={genres || []}
        prefectures={prefectures || []}
        areas={areas || []}
        companies={companies || []}
        giftCodeAmounts={giftCodeAmounts || []}
        initialData={facility}
        currentUserType={currentUser?.type || 'user'}
        images={imagesWithUrls}
        logo={logoWithUrl}
      />
    </div>
  )
}
