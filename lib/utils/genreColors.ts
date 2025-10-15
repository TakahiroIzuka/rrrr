/**
 * Get color for genre based on genre code
 * @param genreCode - Genre code (e.g., 'house-builder', 'vacation-stay', 'cosmetic-dermatology')
 * @returns RGB color string
 */
export function getGenreColor(genreCode: string | undefined): string {
  if (!genreCode) {
    return 'rgb(172, 209, 230)' // default color
  }

  switch (genreCode) {
    case 'house-builder':
      return 'rgb(248, 176, 66)'
    case 'vacation-stay':
      return 'rgb(163, 151, 125)'
    case 'cosmetic-dermatology':
      return 'rgb(220, 194, 219)'
    case 'wedding-venue':
      return 'rgb(236, 106, 82)'
    case 'restaurant':
      return 'rgb(236, 106, 82)'
    case 'pilates':
      return 'rgb(238, 154, 162)'
    case 'medical':
      return 'rgb(172, 209, 230)'
    case 'dermatology':
      return 'rgb(220, 194, 219)'
    default:
      return 'rgb(172, 209, 230)' // default color
  }
}
