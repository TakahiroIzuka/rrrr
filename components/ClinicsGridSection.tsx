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

interface ClinicsGridSectionProps {
  clinics: Clinic[]
}

export default function ClinicsGridSection({ clinics }: ClinicsGridSectionProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState<{[key: number]: number}>({})

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
  const getClinicImages = (clinicId: number) => {
    return [
      '/images/beauty-noimage.jpg',
      '/images/beauty-noimage.jpg',
      '/images/beauty-noimage.jpg'
    ]
  }

  // Handle slider navigation
  const handlePrevImage = (clinicId: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [clinicId]: prev[clinicId] > 0 ? prev[clinicId] - 1 : 2
    }))
  }

  const handleNextImage = (clinicId: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [clinicId]: (prev[clinicId] || 0) < 2 ? (prev[clinicId] || 0) + 1 : 0
    }))
  }

  const handleIndicatorClick = (clinicId: number, index: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [clinicId]: index
    }))
  }

  return (
    <section className="py-16 px-8 border-t border-slate-200" style={{ backgroundColor: '#F1F1F1' }}>
      <div className="mx-auto space-y-8">
        {/* First Section */}
        <div className="flex gap-8">
          {/* Left Box - 3/4 width */}
          <div className="w-3/4 bg-white rounded-lg p-5">
            {/* Section Header */}
            <div className="text-left mb-6">
              <h2 className="text-xl font-bold text-gray-700 mb-4">
                人気のクリニック5件はこちら
              </h2>
              <div className="flex items-center gap-3">
                <div className="w-8 h-1" style={{ backgroundColor: '#a3977d' }}></div>
                <p className="text-l font-bold" style={{ color: '#a3977d', letterSpacing: '0.4rem' }}>Recommended Clinic</p>
              </div>
            </div>

            {/* Clinics Grid */}
            <div className="grid grid-cols-5 gap-4">
              {clinics.slice(0, 5).map((clinic) => (
                <div
                  key={clinic.id}
                  className={`bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ease-in-out ${
                    hoveredCard === clinic.id
                      ? 'shadow-lg -translate-y-0.5'
                      : 'shadow-sm hover:shadow-md'
                  }`}
                  onMouseEnter={() => setHoveredCard(clinic.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Image Slider */}
                  <div className="relative">
                    <div className="relative group">
                      <div className="w-full h-32 bg-gray-100 overflow-hidden">
                        <img
                          src={getClinicImages(clinic.id)[currentImageIndex[clinic.id] || 0]}
                          alt={`${clinic.name}の画像`}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Navigation buttons */}
                      <button
                        onClick={() => handlePrevImage(clinic.id)}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      >
                        &#8249;
                      </button>
                      <button
                        onClick={() => handleNextImage(clinic.id)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      >
                        &#8250;
                      </button>
                    </div>

                    {/* Indicators */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                      {getClinicImages(clinic.id).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => handleIndicatorClick(clinic.id, index)}
                          className={`w-1.5 h-1.5 rounded-full transition-colors ${
                            (currentImageIndex[clinic.id] || 0) === index
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
                            src="/images/star_0.5.png"
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
                      基本情報とクチコミ詳細はこちら
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Box - 1/4 width */}
          <div className="w-1/4 bg-white rounded-lg p-8">
            {/* Right box content */}
          </div>
        </div>

        {/* Second Section */}
        <div className="flex gap-8">
          {/* Left Box - 3/4 width */}
          <div className="w-3/4 bg-white rounded-lg p-8">
            {/* Section Header */}
            <div className="text-left mb-6">
              <h2 className="text-xl font-bold text-gray-700 mb-4">
                リストで絞り込み検索結果一覧はこちら
              </h2>
              <div className="flex items-center gap-3">
                <div className="w-8 h-1" style={{ backgroundColor: '#a3977d' }}></div>
                <p className="text-l font-bold" style={{ color: '#a3977d', letterSpacing: '0.4rem' }}>List Search</p>
              </div>
            </div>

            {/* Clinics Grid */}
            <div className="grid grid-cols-5 gap-4">
              {clinics.slice(0, 5).map((clinic) => (
                <div
                  key={`second-${clinic.id}`}
                  className={`bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ease-in-out ${
                    hoveredCard === clinic.id
                      ? 'shadow-lg -translate-y-0.5'
                      : 'shadow-sm hover:shadow-md'
                  }`}
                  onMouseEnter={() => setHoveredCard(clinic.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Image Slider */}
                  <div className="relative">
                    <div className="relative group">
                      <div className="w-full h-32 bg-gray-100 overflow-hidden">
                        <img
                          src={getClinicImages(clinic.id)[currentImageIndex[clinic.id] || 0]}
                          alt={`${clinic.name}の画像`}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Navigation buttons */}
                      <button
                        onClick={() => handlePrevImage(clinic.id)}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      >
                        &#8249;
                      </button>
                      <button
                        onClick={() => handleNextImage(clinic.id)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      >
                        &#8250;
                      </button>
                    </div>

                    {/* Indicators */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                      {getClinicImages(clinic.id).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => handleIndicatorClick(clinic.id, index)}
                          className={`w-1.5 h-1.5 rounded-full transition-colors ${
                            (currentImageIndex[clinic.id] || 0) === index
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
                            src="/images/star_0.5.png"
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
                      基本情報とクチコミ詳細はこちら
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Box - 1/4 width */}
          <div className="w-1/4 bg-white rounded-lg p-8">
            {/* Right box content */}
          </div>
        </div>
      </div>
    </section>
  )
}