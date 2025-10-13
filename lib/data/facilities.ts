import { createClient } from '@/utils/supabase/server'
import type { Facility } from '@/types/facility'
import { SERVICE_CODES } from '@/lib/constants/services'

/**
 * Transform detail from array to single object
 */
function transformFacilityDetail(facilityData: unknown): Facility {
  const data = facilityData as Record<string, unknown>
  return {
    ...data,
    detail: Array.isArray(data.detail)
      ? data.detail[0]
      : data.detail
  } as Facility
}

/**
 * Get service ID by service code
 */
async function getServiceId(serviceCode: string): Promise<number | null> {
  const supabase = await createClient()
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
  detail:clinic_details!clinic_id(
    name,
    star,
    user_review_count,
    lat,
    lng,
    site_url,
    postal_code,
    address,
    tel
  )
`

/**
 * Fetch all facilities by service code
 */
export async function fetchAllFacilities(serviceCode: string = SERVICE_CODES.MEDICAL): Promise<{ facilities: Facility[] | null; error: Error | null }> {
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
export async function fetchFacilitiesByGenre(genreId: string, serviceCode: string = SERVICE_CODES.MEDICAL): Promise<{ facilities: Facility[] | null; error: Error | null }> {
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
  detail:clinic_details!clinic_id(
    name,
    star,
    user_review_count,
    lat,
    lng,
    site_url,
    postal_code,
    address,
    tel,
    google_map_url
  )
`

/**
 * Fetch single facility by ID and service code
 */
export async function fetchFacilityById(id: string, serviceCode: string = SERVICE_CODES.MEDICAL) {
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
