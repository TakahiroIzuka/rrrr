import { createClient } from '@/utils/supabase/server'
import type { Facility } from '@/types/facility'

/**
 * Transform detail from array to single object
 */
export function transformFacilityDetail(facilityData: unknown): Facility {
  const data = facilityData as Record<string, unknown>
  return {
    ...data,
    detail: Array.isArray(data.detail)
      ? data.detail[0]
      : data.detail
  } as Facility
}

/**
 * Base query for fetching facilities with all relations
 */
const FACILITY_BASE_QUERY = `
  *,
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
 * Fetch all facilities
 */
export async function fetchAllFacilities(): Promise<{ facilities: Facility[] | null; error: Error | null }> {
  const supabase = await createClient()
  const { data: facilitiesData, error } = await supabase
    .from('facilities')
    .select(FACILITY_BASE_QUERY)
    .order('id', { ascending: true })

  if (error) {
    return { facilities: null, error }
  }

  const facilities = facilitiesData?.map(transformFacilityDetail) || []
  return { facilities, error: null }
}

/**
 * Fetch facilities by genre ID
 */
export async function fetchFacilitiesByGenre(genreId: string): Promise<{ facilities: Facility[] | null; error: Error | null }> {
  const supabase = await createClient()
  const { data: facilitiesData, error } = await supabase
    .from('facilities')
    .select(FACILITY_BASE_QUERY)
    .eq('genre_id', genreId)
    .order('id', { ascending: true })

  if (error) {
    return { facilities: null, error }
  }

  const facilities = facilitiesData?.map(transformFacilityDetail) || []
  return { facilities, error: null }
}

/**
 * Fetch single facility by ID with extended information
 */
export async function fetchFacilityById(id: string) {
  const supabase = await createClient()

  const { data: facilityData, error } = await supabase
    .from('facilities')
    .select(`
      *,
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
    `)
    .eq('id', id)
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
