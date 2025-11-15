// Genre mappings
export const GENRE_MAP = {
  1: 'ピラティス',
  2: '内科',
  5: '皮膚科'
} as const

// Ranking options
export const RANKING_OPTIONS = ['トップ30', 'トップ20', 'トップ10', 'トップ5', 'トップ3'] as const

// Clinic images
export const DEFAULT_CLINIC_IMAGES = [
  '/medical/medical/noimage.jpg',
  '/medical/medical/noimage.jpg',
  '/medical/medical/noimage.jpg'
] as const

export const IMAGE_COUNT = 3

// Swipe threshold
export const SWIPE_THRESHOLD = 50

// Map pin images
export const MAP_PIN_IMAGES = {
  unfocus: '/common/pin_unfocus.png'
} as const

// Star rating thresholds
export const STAR_RATING_THRESHOLDS = [
  { max: 0, image: '/common/star_0.5.png' },
  { max: 1.25, image: '/common/star_1.0.png' },
  { max: 1.75, image: '/common/star_1.5.png' },
  { max: 2.25, image: '/common/star_2.0.png' },
  { max: 2.75, image: '/common/star_2.5.png' },
  { max: 3.25, image: '/common/star_3.0.png' },
  { max: 3.75, image: '/common/star_3.5.png' },
  { max: 4.25, image: '/common/star_4.0.png' },
  { max: 4.75, image: '/common/star_4.5.png' }
] as const

export const DEFAULT_STAR_IMAGE = '/common/star_5.0.png'
