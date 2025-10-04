'use client'

import { useState } from 'react'

interface Clinic {
  id: number
  name: string
  star: number | null
  user_review_count: number
  lat: number
  lng: number
  prefecture: string
  area: string
  genre_id: number
}

interface ClinicCardProps {
  clinic: Clinic
  isHovered: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export default function ClinicCard({ clinic, isHovered, onMouseEnter, onMouseLeave }: ClinicCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)

  // Function to get appropriate star image based on rating
  const getStarImage = (rating: number): string => {
    if (rating === 0) return '/common/star_0.5.png'
    if (rating <= 1.25) return '/common/star_1.0.png'
    if (rating <= 1.75) return '/common/star_1.5.png'
    if (rating <= 2.25) return '/common/star_2.0.png'
    if (rating <= 2.75) return '/common/star_2.5.png'
    if (rating <= 3.25) return '/common/star_3.0.png'
    if (rating <= 3.75) return '/common/star_3.5.png'
    if (rating <= 4.25) return '/common/star_4.0.png'
    if (rating <= 4.75) return '/common/star_4.5.png'
    return '/common/star_5.0.png'
  }

  // Default images for clinics (3 images per clinic)
  const getClinicImages = () => {
    return [
      '/mrr/beauty-noimage.jpg',
      '/mrr/beauty-noimage.jpg',
      '/mrr/beauty-noimage.jpg'
    ]
  }

  // Handle slider navigation
  const handlePrevImage = () => {
    setCurrentImageIndex(prev => prev > 0 ? prev - 1 : 2)
  }

  const handleNextImage = () => {
    setCurrentImageIndex(prev => prev < 2 ? prev + 1 : 0)
  }

  const handleIndicatorClick = (index: number) => {
    setCurrentImageIndex(index)
  }

  // Handle drag/swipe
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    setStartX(clientX)
    setCurrentX(clientX)
  }

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    setCurrentX(clientX)
  }

  const handleDragEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    const diff = startX - currentX
    const threshold = 50 // minimum swipe distance

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swiped left, go to next image
        handleNextImage()
      } else {
        // Swiped right, go to previous image
        handlePrevImage()
      }
    }

    setStartX(0)
    setCurrentX(0)
  }

  const clinicImages = getClinicImages()

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ease-in-out ${
        isHovered
          ? 'shadow-xl -translate-y-0.5'
          : 'shadow-md hover:shadow-lg'
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Image Slider */}
      <div>
        <div className="relative group">
          <div
            className="w-full h-54 bg-gray-100 overflow-hidden select-none"
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
            <img
              src={clinicImages[currentImageIndex]}
              alt={`${clinic.name}の画像`}
              className="w-full h-full object-cover pointer-events-none"
            />
          </div>

          {/* HP Button */}
          <button
            className="absolute top-1 right-1 bg-[#a59878] hover:bg-opacity-90 text-white text-[10px] px-2 py-1 rounded-md transition-colors"
          >
            HPはこちら
          </button>

          {/* Navigation buttons */}
          <button
            onClick={handlePrevImage}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
          >
            &#8249;
          </button>
          <button
            onClick={handleNextImage}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
          >
            &#8250;
          </button>
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-2 py-2 bg-white">
          {clinicImages.map((_, index) => (
            <button
              key={index}
              onClick={() => handleIndicatorClick(index)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                currentImageIndex === index
                  ? 'bg-[#a59878]'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="px-4 pb-4">
        <h3 className="m-0 mb-3 pt-3 text-gray-900 text-xl font-semibold leading-snug" style={{ fontFamily: 'Kosugi Maru, sans-serif' }}>
        {clinic.name}
      </h3>

      <div className="flex items-center mb-2 gap-1.5 pb-2 border-b border-[#a59878]">
        <span className="text-gray-600 text-xs border border-gray-300 rounded px-2 py-0.5">
          {clinic.prefecture}
        </span>
        <span className="text-gray-600 text-xs border border-gray-300 rounded px-2 py-0.5">
          {clinic.area}
        </span>
      </div>

      {clinic.star !== null && (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-gray-500 text-xs">クチコミ評価</span>
            <img
              src={getStarImage(clinic.star)}
              alt={`${clinic.star}星評価`}
              className="w-16 h-3"
            />
          </div>
          <div className="text-gray-500 text-xs">
            評価平均<span className="text-amber-500 font-semibold">{clinic.star}</span>/評価人数<span className="text-gray-900 font-semibold">{clinic.user_review_count}</span>人
          </div>
        </div>
      )}

      {clinic.star === null && clinic.user_review_count === 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-gray-500 text-xs">クチコミ評価</span>
            <img
              src="/common/star_0.5.png"
              alt="評価なし"
              className="w-16 h-3"
            />
          </div>
          <div className="text-gray-400 text-xs">
            レビューなし
          </div>
        </div>
      )}

        <button className="w-full py-2 px-4 bg-[#a59878] text-white text-sm font-bold rounded-md hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2">
          基本情報とクチコミ詳細はこちら
          <span className="flex items-center justify-center w-4 h-4 bg-white rounded-full" style={{ transform: 'translateY(0px)' }}>
            <span className="text-[#a59878] font-bold text-xl leading-none" style={{ transform: 'translate(0.5px, -2px)' }}>›</span>
          </span>
        </button>
      </div>
    </div>
  )
}