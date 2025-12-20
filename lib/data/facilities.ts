import { createClient, createAnonClient } from '@/utils/supabase/server'
import type { Facility } from '@/types/facility'

interface FacilityImageWithUrls {
  id: number
  facility_id: number
  image_path: string
  thumbnail_path: string | null
  display_order: number
  publicUrl: string
  thumbnailUrl: string | null
}

/**
 * Transform detail from array to single object and flatten facility_details fields
 */
function transformFacilityDetail(facilityData: unknown): Facility {
  const data = facilityData as Record<string, unknown>
  const detail = Array.isArray(data.detail) ? data.detail[0] : data.detail
  const detailObj = detail as Record<string, unknown> | undefined

  // Extract detail fields and merge them into the main facility object
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { detail: _detail, ...rest } = data

  return {
    ...rest,
    // Flatten facility_details fields (all fields from facility_details table)
    name: detailObj?.name as string,
    star: detailObj?.star as number | null,
    user_review_count: detailObj?.user_review_count as number,
    lat: detailObj?.lat as number,
    lng: detailObj?.lng as number,
    site_url: detailObj?.site_url as string | undefined,
    portfolio_url: detailObj?.portfolio_url as string | undefined,
    event_url: detailObj?.event_url as string | undefined,
    youtube_url: detailObj?.youtube_url as string | undefined,
    postal_code: detailObj?.postal_code as string | undefined,
    address: detailObj?.address as string | undefined,
    tel: detailObj?.tel as string | undefined,
    google_map_url: detailObj?.google_map_url as string | undefined,
  } as Facility
}

/**
 * Get service ID by service code
 */
async function getServiceId(serviceCode: string): Promise<number | null> {
  const supabase = createAnonClient()
  const { data: service } = await supabase
    .from('services')
    .select('id')
    .eq('code', serviceCode)
    .single()

  return service?.id ?? null
}

/**
 * Base query for fetching facilities with all relations
 */
const FACILITY_BASE_QUERY = `
  *,
  service:services(
    id,
    code,
    name
  ),
  prefecture:prefectures(
    id,
    name
  ),
  area:areas(
    id,
    name
  ),
  genre:genres(
    id,
    name,
    code
  ),
  detail:facility_details!facility_id(
    name,
    star,
    user_review_count,
    lat,
    lng,
    site_url,
    portfolio_url,
    event_url,
    youtube_url,
    postal_code,
    address,
    tel
  )
`

/**
 * Fetch all facilities by service code
 */
export async function fetchAllFacilities(serviceCode: string): Promise<{ facilities: Facility[] | null; error: Error | null }> {
  const serviceId = await getServiceId(serviceCode)

  if (!serviceId) {
    return { facilities: [], error: null }
  }

  const supabase = await createClient()
  const { data: facilitiesData, error } = await supabase
    .from('facilities')
    .select(FACILITY_BASE_QUERY)
    .eq('service_id', serviceId)
    .order('id', { ascending: true })

  if (error) {
    return { facilities: null, error }
  }

  const facilities = facilitiesData?.map(transformFacilityDetail) || []
  return { facilities, error: null }
}

/**
 * Fetch facilities by genre ID and service code
 */
export async function fetchFacilitiesByGenre(genreId: string, serviceCode: string): Promise<{ facilities: Facility[] | null; error: Error | null }> {
  const serviceId = await getServiceId(serviceCode)

  if (!serviceId) {
    return { facilities: [], error: null }
  }

  const supabase = await createClient()
  const { data: facilitiesData, error } = await supabase
    .from('facilities')
    .select(FACILITY_BASE_QUERY)
    .eq('genre_id', genreId)
    .eq('service_id', serviceId)
    .order('id', { ascending: true })

  if (error) {
    return { facilities: null, error }
  }

  const facilities = facilitiesData?.map(transformFacilityDetail) || []
  return { facilities, error: null }
}

/**
 * Extended query for fetching a single facility with all relations
 */
const FACILITY_DETAIL_QUERY = `
  *,
  service:services(
    id,
    code,
    name
  ),
  prefecture:prefectures(
    id,
    name
  ),
  area:areas(
    id,
    name
  ),
  company:companies(
    id,
    name
  ),
  genre:genres(
    id,
    name,
    code
  ),
  detail:facility_details!facility_id(
    name,
    star,
    user_review_count,
    lat,
    lng,
    site_url,
    portfolio_url,
    event_url,
    youtube_url,
    postal_code,
    address,
    tel,
    google_map_url
  )
`

/**
 * Fetch single facility by ID and service code
 */
export async function fetchFacilityById(id: string, serviceCode: string) {
  const serviceId = await getServiceId(serviceCode)

  if (!serviceId) {
    return { facility: null, error: new Error('Service not found') }
  }

  const supabase = await createClient()
  const { data: facilityData, error } = await supabase
    .from('facilities')
    .select(FACILITY_DETAIL_QUERY)
    .eq('id', id)
    .eq('service_id', serviceId)
    .single()

  if (error || !facilityData) {
    return { facility: null, error }
  }

  const facility = transformFacilityDetail(facilityData)
  return { facility, error: null }
}

/**
 * Fetch single facility by UUID and service code (for public access, no auth required)
 */
export async function fetchFacilityByUuid(uuid: string, serviceCode: string) {
  const serviceId = await getServiceId(serviceCode)

  if (!serviceId) {
    return { facility: null, error: new Error('Service not found') }
  }

  const supabase = createAnonClient()
  const { data: facilityData, error } = await supabase
    .from('facilities')
    .select(FACILITY_DETAIL_QUERY)
    .eq('uuid', uuid)
    .eq('service_id', serviceId)
    .single()

  if (error || !facilityData) {
    return { facility: null, error }
  }

  const facility = transformFacilityDetail(facilityData)
  return { facility, error: null }
}

/**
 * Fetch genre by ID
 */
export async function fetchGenreById(id: string) {
  const supabase = await createClient()

  const { data: genre, error } = await supabase
    .from('genres')
    .select('id, name, code')
    .eq('id', id)
    .single()

  return { genre, error }
}

/**
 * Fetch prefecture by ID
 */
export async function fetchPrefectureById(id: string) {
  const supabase = await createClient()

  const { data: prefecture, error } = await supabase
    .from('prefectures')
    .select('id, name')
    .eq('id', id)
    .single()

  return { prefecture, error }
}

/**
 * Fetch area by ID (includes prefecture info)
 */
export async function fetchAreaById(id: string) {
  const supabase = await createClient()

  const { data: area, error } = await supabase
    .from('areas')
    .select('id, name, prefecture:prefectures(id, name)')
    .eq('id', id)
    .single()

  return { area, error }
}

/**
 * Fetch facilities by prefecture ID and service code
 */
export async function fetchFacilitiesByPrefecture(prefectureId: string, serviceCode: string): Promise<{ facilities: Facility[] | null; error: Error | null }> {
  const serviceId = await getServiceId(serviceCode)

  if (!serviceId) {
    return { facilities: [], error: null }
  }

  const supabase = await createClient()
  const { data: facilitiesData, error } = await supabase
    .from('facilities')
    .select(FACILITY_BASE_QUERY)
    .eq('prefecture_id', prefectureId)
    .eq('service_id', serviceId)
    .order('id', { ascending: true })

  if (error) {
    return { facilities: null, error }
  }

  const facilities = facilitiesData?.map(transformFacilityDetail) || []
  return { facilities, error: null }
}

/**
 * Fetch facilities by area ID and service code
 */
export async function fetchFacilitiesByArea(areaId: string, serviceCode: string): Promise<{ facilities: Facility[] | null; error: Error | null }> {
  const serviceId = await getServiceId(serviceCode)

  if (!serviceId) {
    return { facilities: [], error: null }
  }

  const supabase = await createClient()
  const { data: facilitiesData, error } = await supabase
    .from('facilities')
    .select(FACILITY_BASE_QUERY)
    .eq('area_id', areaId)
    .eq('service_id', serviceId)
    .order('id', { ascending: true })

  if (error) {
    return { facilities: null, error }
  }

  const facilities = facilitiesData?.map(transformFacilityDetail) || []
  return { facilities, error: null }
}

/**
 * Fetch prefectures that have facilities for a given service
 */
export async function fetchPrefecturesWithFacilities(serviceCode: string) {
  const serviceId = await getServiceId(serviceCode)

  if (!serviceId) {
    return { prefectures: [], error: null }
  }

  const supabase = createAnonClient()

  // Get distinct prefecture_ids from facilities for this service
  const { data: facilities, error: facilitiesError } = await supabase
    .from('facilities')
    .select('prefecture_id')
    .eq('service_id', serviceId)
    .not('prefecture_id', 'is', null)

  if (facilitiesError) {
    return { prefectures: [], error: facilitiesError }
  }

  const prefectureIds = [...new Set(facilities?.map(f => f.prefecture_id))]

  if (prefectureIds.length === 0) {
    return { prefectures: [], error: null }
  }

  // Fetch prefecture details
  const { data: prefectures, error } = await supabase
    .from('prefectures')
    .select('id, name')
    .in('id', prefectureIds)
    .order('id', { ascending: true })

  return { prefectures: prefectures || [], error }
}

/**
 * Fetch areas grouped by prefecture that have facilities for a given service
 */
export async function fetchAreasWithFacilities(serviceCode: string) {
  const serviceId = await getServiceId(serviceCode)

  if (!serviceId) {
    return { areasGrouped: [], error: null }
  }

  const supabase = createAnonClient()

  // Get distinct area_ids from facilities for this service
  const { data: facilities, error: facilitiesError } = await supabase
    .from('facilities')
    .select('area_id, prefecture_id')
    .eq('service_id', serviceId)
    .not('area_id', 'is', null)

  if (facilitiesError) {
    return { areasGrouped: [], error: facilitiesError }
  }

  const areaIds = [...new Set(facilities?.map(f => f.area_id))]
  const prefectureIds = [...new Set(facilities?.map(f => f.prefecture_id))]

  if (areaIds.length === 0) {
    return { areasGrouped: [], error: null }
  }

  // Fetch area details with prefecture info
  const { data: areas, error: areasError } = await supabase
    .from('areas')
    .select('id, name, prefecture_id')
    .in('id', areaIds)
    .order('id', { ascending: true })

  if (areasError) {
    return { areasGrouped: [], error: areasError }
  }

  // Fetch prefecture details
  const { data: prefectures, error: prefecturesError } = await supabase
    .from('prefectures')
    .select('id, name')
    .in('id', prefectureIds)
    .order('id', { ascending: true })

  if (prefecturesError) {
    return { areasGrouped: [], error: prefecturesError }
  }

  // Group areas by prefecture
  const areasGrouped = prefectures?.map(prefecture => ({
    prefecture,
    areas: areas?.filter(area => area.prefecture_id === prefecture.id) || []
  })).filter(group => group.areas.length > 0) || []

  return { areasGrouped, error: null }
}

/**
 * Fetch facility images by facility ID
 * Returns images sorted by display_order (1-5)
 */
export async function fetchFacilityImages(facilityId: number) {
  const supabase = await createClient()

  const { data: images, error } = await supabase
    .from('facility_images')
    .select('id, image_path, thumbnail_path, display_order')
    .eq('facility_id', facilityId)
    .order('display_order', { ascending: true })
    .limit(5)

  if (error) {
    return { images: null, error }
  }

  // Create public URLs for images
  const imagesWithUrls = images?.map((image) => ({
    ...image,
    publicUrl: supabase.storage.from('facility-images').getPublicUrl(image.image_path).data.publicUrl,
    thumbnailUrl: image.thumbnail_path
      ? supabase.storage.from('facility-images').getPublicUrl(image.thumbnail_path).data.publicUrl
      : null,
  }))

  // Ensure images are sorted by display_order
  const sortedImages = imagesWithUrls?.sort((a, b) => a.display_order - b.display_order) || []

  return { images: sortedImages, error: null }
}

/**
 * Fetch images for multiple facilities
 * Returns a map of facility_id to images array
 */
export async function fetchFacilitiesImages(facilityIds: number[]) {
  if (facilityIds.length === 0) {
    return { imagesMap: {}, error: null }
  }

  const supabase = await createClient()

  const { data: images, error } = await supabase
    .from('facility_images')
    .select('id, facility_id, image_path, thumbnail_path, display_order')
    .in('facility_id', facilityIds)
    .order('facility_id', { ascending: true })
    .order('display_order', { ascending: true })
    .lte('display_order', 3) // Only get display_order 1-3 for cards

  if (error) {
    return { imagesMap: {}, error }
  }

  // Create public URLs and group by facility_id
  const imagesMap: Record<number, FacilityImageWithUrls[]> = {}

  images?.forEach((image) => {
    if (!imagesMap[image.facility_id]) {
      imagesMap[image.facility_id] = []
    }

    imagesMap[image.facility_id].push({
      ...image,
      publicUrl: supabase.storage.from('facility-images').getPublicUrl(image.image_path).data.publicUrl,
      thumbnailUrl: image.thumbnail_path
        ? supabase.storage.from('facility-images').getPublicUrl(image.thumbnail_path).data.publicUrl
        : null,
    })
  })

  // Ensure each facility's images are sorted by display_order
  Object.keys(imagesMap).forEach((facilityId) => {
    imagesMap[Number(facilityId)].sort((a, b) => a.display_order - b.display_order)
  })

  return { imagesMap, error: null }
}
