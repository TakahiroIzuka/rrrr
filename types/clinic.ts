export interface Clinic {
  id: number
  uuid: string
  name: string
  star: number | null
  user_review_count: number
  lat: number
  lng: number
  genre_id: number
  area_id: number
  area?: {
    id: number
    name: string
    prefecture_id: number
    prefecture?: {
      id: number
      name: string
    }
  }
}
