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

interface ClinicCardLiteProps {
  clinic: Clinic
  isHovered: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export default function ClinicCardLite({ clinic, isHovered, onMouseEnter, onMouseLeave }: ClinicCardLiteProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

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
      className={`bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ease-in-out ${
        isHovered
          ? 'shadow-lg -translate-y-0.5'
          : 'shadow-sm hover:shadow-md'
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Image Slider */}
      <div className="relative">
        <div className="relative group">
          <div className="w-full h-32 bg-gray-100 overflow-hidden">
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
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
          {clinicImages.map((_, index) => (
            <button
              key={index}
              onClick={() => handleIndicatorClick(index)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                currentImageIndex === index
                  ? 'bg-[#a59878]'
                  : 'bg-white bg-opacity-70'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-3">
        <h3 className="m-0 mb-2 text-gray-900 text-sm font-semibold leading-tight">
          {clinic.name}
        </h3>

        <div className="flex items-center mb-2 gap-1">
          <span className="text-xs text-gray-500">📍</span>
          <span className="text-gray-600 text-xs">
            {clinic.prefecture} {clinic.area}
          </span>
        </div>

        {clinic.star !== null && (
          <div className="mb-2">
            <div className="flex items-center gap-1 mb-0.5">
              <img
                src={getStarImage(clinic.star)}
                alt={`${clinic.star}星評価`}
                className="w-12 h-2.5"
              />
            </div>
            <div className="text-gray-500 text-xs">
              <span className="text-amber-500 font-semibold">{clinic.star}</span> ({clinic.user_review_count}人)
            </div>
          </div>
        )}

        {clinic.star === null && clinic.user_review_count === 0 && (
          <div className="mb-2">
            <div className="flex items-center gap-1 mb-0.5">
              <img
                src="/common/star_0.5.png"
                alt="評価なし"
                className="w-12 h-2.5"
              />
            </div>
            <div className="text-gray-400 text-xs">
              レビューなし
            </div>
          </div>
        )}

        <button className="w-full py-1.5 px-2 bg-[#a59878] text-white text-xs font-medium rounded hover:bg-opacity-90 transition-colors">
          基本情報とクチコミ詳細
        </button>
      </div>
    </div>
  )
}
