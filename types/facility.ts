export interface Facility {
  id: number
  uuid: string
  name: string
  star: number | null
  user_review_count: number
  lat: number
  lng: number
  genre_id: number
  prefecture_id: number
  area_id: number
  company_id?: number
  // Fields from facility_details (flattened)
  site_url?: string
  portfolio_url?: string
  event_url?: string
  postal_code?: string
  address?: string
  tel?: string
  google_map_url?: string
  // Related entities
  prefecture?: {
    id: number
    name: string
  }
  area?: {
    id: number
    name: string
  }
  company?: {
    id: number
    name: string
  }
  genre?: {
    id: number
    name: string
    code: string
  }
  service?: {
    id: number
    code: string
    name: string
  }
}

// For backward compatibility during migration
export type Clinic = Facility
