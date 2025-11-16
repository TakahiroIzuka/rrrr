// Ranking options
export const RANKING_OPTIONS = ['トップ30', 'トップ20', 'トップ10', 'トップ5', 'トップ3'] as const

export const IMAGE_COUNT = 3

// Swipe threshold
export const SWIPE_THRESHOLD = 50

// Map pin images
export const MAP_PIN_IMAGES = {
  unfocus: '/common/pin_unfocus.png'
} as const

// Star rating thresholds (Google Map compatible)
export const STAR_RATING_THRESHOLDS = [
  { max: 0.24, image: '/common/star_0.5.png' },  // 0.00-0.24 → 0星
  { max: 0.74, image: '/common/star_0.5.png' },  // 0.25-0.74 → 0.5星
  { max: 1.24, image: '/common/star_1.0.png' },  // 0.75-1.24 → 1.0星
  { max: 1.74, image: '/common/star_1.5.png' },  // 1.25-1.74 → 1.5星
  { max: 2.24, image: '/common/star_2.0.png' },  // 1.75-2.24 → 2.0星
  { max: 2.74, image: '/common/star_2.5.png' },  // 2.25-2.74 → 2.5星
  { max: 3.24, image: '/common/star_3.0.png' },  // 2.75-3.24 → 3.0星
  { max: 3.74, image: '/common/star_3.5.png' },  // 3.25-3.74 → 3.5星
  { max: 4.24, image: '/common/star_4.0.png' },  // 3.75-4.24 → 4.0星
  { max: 4.74, image: '/common/star_4.5.png' },  // 4.25-4.74 → 4.5星
] as const

export const DEFAULT_STAR_IMAGE = '/common/star_5.0.png'
