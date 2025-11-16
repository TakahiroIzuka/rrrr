import { existsSync } from 'fs'
import { join } from 'path'

/**
 * Get image path for genre with fallback to default
 * @param serviceCode - Service code (e.g., 'medical', 'house-builder')
 * @param genreCode - Genre code (e.g., 'pilates', 'cosmetic-dermatology')
 * @param imageName - Image file name (e.g., 'logo_header.png', 'logo_footer.png')
 * @returns Public path to the image
 */
export function getGenreImagePath(
  serviceCode: string,
  genreCode: string | undefined,
  imageName: string
): string {
  // If genreCode is not provided, use default
  if (!genreCode) {
    return `/${serviceCode}/default/${imageName}`
  }

  // Try genre-specific path first
  const genrePath = `/${serviceCode}/${genreCode}/${imageName}`
  const genreFilePath = join(process.cwd(), 'public', serviceCode, genreCode, imageName)

  // Check if genre-specific image exists
  if (existsSync(genreFilePath)) {
    return genrePath
  }

  // Fallback to default
  return `/${serviceCode}/default/${imageName}`
}
