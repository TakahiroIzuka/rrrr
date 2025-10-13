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
  detail?: {
    name: string
    star: number | null
    user_review_count: number
    lat: number
    lng: number
    site_url?: string
    postal_code?: string
    address?: string
    tel?: string
    google_map_url?: string
  }
}

// For backward compatibility during migration
export type Clinic = Facility
