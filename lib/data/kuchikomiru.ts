import { createClient } from '@/utils/supabase/server'

// Note: Using the same Clinic type from @/types/clinic
// Since kuchikomiru uses the same clinics table structure
import type { Clinic } from '@/types/clinic'

/**
 * Transform clinic_detail from array to single object
 */
export function transformClinicDetail(clinicData: unknown): Clinic {
  const data = clinicData as Record<string, unknown>
  return {
    ...data,
    clinic_detail: Array.isArray(data.clinic_detail)
      ? data.clinic_detail[0]
      : data.clinic_detail
  } as Clinic
}

/**
 * Base query for fetching clinics with all relations
 */
const CLINIC_BASE_QUERY = `
  *,
  prefecture:prefectures(
    id,
    name
  ),
  area:areas(
    id,
    name
  ),
  clinic_detail:clinic_details!clinic_id(
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
 * Fetch all clinics for kuchikomiru
 */
export async function fetchAllClinics(): Promise<{ clinics: Clinic[] | null; error: Error | null }> {
  const supabase = await createClient()
  const { data: clinicsData, error } = await supabase
    .from('clinics')
    .select(CLINIC_BASE_QUERY)
    .order('id', { ascending: true })

  if (error) {
    return { clinics: null, error }
  }

  const clinics = clinicsData?.map(transformClinicDetail) || []
  return { clinics, error: null }
}

/**
 * Fetch clinics by genre ID for kuchikomiru
 */
export async function fetchClinicsByGenre(genreId: string): Promise<{ clinics: Clinic[] | null; error: Error | null }> {
  const supabase = await createClient()
  const { data: clinicsData, error } = await supabase
    .from('clinics')
    .select(CLINIC_BASE_QUERY)
    .eq('genre_id', genreId)
    .order('id', { ascending: true })

  if (error) {
    return { clinics: null, error }
  }

  const clinics = clinicsData?.map(transformClinicDetail) || []
  return { clinics, error: null }
}

/**
 * Fetch single clinic by ID with extended information
 */
export async function fetchClinicById(id: string) {
  const supabase = await createClient()

  const { data: clinicData, error } = await supabase
    .from('clinics')
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
      clinic_detail:clinic_details!clinic_id(
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

  if (error || !clinicData) {
    return { clinic: null, error }
  }

  const clinic = transformClinicDetail(clinicData)
  return { clinic, error: null }
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
