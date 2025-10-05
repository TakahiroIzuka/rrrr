import { STAR_RATING_THRESHOLDS, DEFAULT_STAR_IMAGE } from '@/lib/constants'

/**
 * Get appropriate star image based on rating
 */
export function getStarImage(rating: number): string {
  if (rating === 0) return STAR_RATING_THRESHOLDS[0].image

  for (const threshold of STAR_RATING_THRESHOLDS) {
    if (rating <= threshold.max) {
      return threshold.image
    }
  }

  return DEFAULT_STAR_IMAGE
}
