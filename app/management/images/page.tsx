import { createClient } from '@/lib/supabase/server'
import ImageManager from '@/components/management/ImageManager'

export default async function ImagesPage() {
  const supabase = await createClient()

  // Fetch all facilities with their images
  const { data: facilities, error } = await supabase
    .from('facilities')
    .select(`
      id,
      detail:facility_details!facility_id(name)
    `)
    .order('id', { ascending: false })

  if (error) {
    console.error('Error fetching facilities:', error)
  }

  // Fetch all images
  const { data: images, error: imagesError } = await supabase
    .from('facility_images')
    .select('*')
    .order('facility_id', { ascending: true })
    .order('display_order', { ascending: true })

  if (imagesError) {
    console.error('Error fetching images:', imagesError)
  }

  // Create public URLs for images
  const imagesWithUrls = images?.map((image) => ({
    ...image,
    publicUrl: supabase.storage.from('facility-images').getPublicUrl(image.image_path).data.publicUrl,
    thumbnailUrl: image.thumbnail_path
      ? supabase.storage.from('facility-images').getPublicUrl(image.thumbnail_path).data.publicUrl
      : null,
  })) || []

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">画像管理</h1>
      <ImageManager
        facilities={facilities || []}
        images={imagesWithUrls}
      />
    </div>
  )
}
