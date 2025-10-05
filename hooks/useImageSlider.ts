import { useState, useCallback } from 'react'
import { IMAGE_COUNT, SWIPE_THRESHOLD } from '@/lib/constants'

export function useImageSlider() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)

  const handlePrevImage = useCallback(() => {
    setCurrentImageIndex(prev => prev > 0 ? prev - 1 : IMAGE_COUNT - 1)
  }, [])

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex(prev => prev < IMAGE_COUNT - 1 ? prev + 1 : 0)
  }, [])

  const handleIndicatorClick = useCallback((index: number) => {
    setCurrentImageIndex(index)
  }, [])

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    setStartX(clientX)
  }, [])

  const handleDragMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const diff = startX - clientX

    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) {
        handleNextImage()
      } else {
        handlePrevImage()
      }
      setIsDragging(false)
    }
  }, [isDragging, startX, handleNextImage, handlePrevImage])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  return {
    currentImageIndex,
    handlePrevImage,
    handleNextImage,
    handleIndicatorClick,
    handleDragStart,
    handleDragMove,
    handleDragEnd
  }
}
