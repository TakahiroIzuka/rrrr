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

  // Function to get appropriate star image based on rating
  const getStarImage = (rating: number): string => {
    if (rating === 0) return '/images/star_0.5.png'
    if (rating <= 1.25) return '/images/star_1.0.png'
    if (rating <= 1.75) return '/images/star_1.5.png'
    if (rating <= 2.25) return '/images/star_2.0.png'
    if (rating <= 2.75) return '/images/star_2.5.png'
    if (rating <= 3.25) return '/images/star_3.0.png'
    if (rating <= 3.75) return '/images/star_3.5.png'
    if (rating <= 4.25) return '/images/star_4.0.png'
    if (rating <= 4.75) return '/images/star_4.5.png'
    return '/images/star_5.0.png'
  }

  // Default images for clinics (3 images per clinic)
  const getClinicImages = () => {
    return [
      '/images/beauty-noimage.jpg',
      '/images/beauty-noimage.jpg',
      '/images/beauty-noimage.jpg'
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

  const clinicImages = getClinicImages()

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-4 cursor-pointer transition-all duration-200 ease-in-out ${
        isHovered
          ? 'shadow-lg -translate-y-0.5'
          : 'shadow-sm hover:shadow-md'
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Image Slider */}
      <div className="mb-3">
        <div className="relative group">
          <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={clinicImages[currentImageIndex]}
              alt={`${clinic.name}の画像`}
              className="w-full h-full object-cover"
            />
          </div>

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
        <div className="flex justify-center gap-1 mt-2">
          {clinicImages.map((_, index) => (
            <button
              key={index}
              onClick={() => handleIndicatorClick(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentImageIndex === index
                  ? 'bg-[#a59878]'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      <h3 className="m-0 mb-3 text-gray-900 text-base font-semibold leading-snug">
        {clinic.name}
      </h3>

      <div className="flex items-center mb-2 gap-1.5">
        <span className="text-sm text-gray-500">📍</span>
        <span className="text-gray-600 text-sm">
          {clinic.prefecture} {clinic.area}
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
              src="/images/star_0.5.png"
              alt="評価なし"
              className="w-16 h-3"
            />
          </div>
          <div className="text-gray-400 text-xs">
            レビューなし
          </div>
        </div>
      )}

      <button className="w-full py-2 px-4 bg-[#a59878] text-white text-sm font-medium rounded-md hover:bg-opacity-90 transition-colors">
        基本情報とクチコミ詳細はこちら
      </button>
    </div>
  )
}