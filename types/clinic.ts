export interface Clinic {
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
  prefecture?: {
    id: number
    name: string
  }
  area?: {
    id: number
    name: string
  }
}
