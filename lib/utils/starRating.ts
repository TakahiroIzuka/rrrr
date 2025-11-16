import { STAR_RATING_THRESHOLDS, DEFAULT_STAR_IMAGE } from '@/lib/constants'

/**
 * Get appropriate star image based on rating (Google Map compatible)
 * Rounds to nearest 0.5 star (0.25 as boundary)
 */
export function getStarImage(rating: number): string {
  for (const threshold of STAR_RATING_THRESHOLDS) {
    if (rating <= threshold.max) {
      return threshold.image
    }
  }

  // 4.75-5.00 → 5.0星
  return DEFAULT_STAR_IMAGE
}
