'use client'

import { useRef } from 'react'
import Link from 'next/link'
import type { Clinic } from '@/types/clinic'
import { getStarImage } from '@/lib/utils/starRating'
import { DEFAULT_CLINIC_IMAGES, IMAGE_COUNT } from '@/lib/constants'
import { useImageSlider } from '@/hooks/useImageSlider'

interface ClinicCardLiteProps {
  clinic: Clinic
  isHovered: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export default function ClinicCardLite({ clinic, isHovered, onMouseEnter, onMouseLeave }: ClinicCardLiteProps) {
  const dragRef = useRef<HTMLDivElement>(null)
  const {
    currentImageIndex,
    handlePrevImage,
    handleNextImage,
    handleIndicatorClick,
    handleDragStart,
    handleDragMove,
    handleDragEnd
  } = useImageSlider()

  return (
    <div
      className={`bg-white border border-white rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ease-in-out ${
        isHovered
          ? 'shadow-xl -translate-y-0.5'
          : 'hover:shadow-xl'
      }`}
      style={{ boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.06), 0 4px 8px rgba(0, 0, 0, 0.06)' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Image Slider */}
      <div>
        <div
          className="relative group"
          ref={dragRef}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          <div className="w-full h-32 bg-gray-100 overflow-hidden">
            <img
              src={DEFAULT_CLINIC_IMAGES[currentImageIndex]}
              alt={`${clinic.name}の画像`}
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>

          {/* HP Button */}
          <button
            className="absolute top-1 right-1 bg-[#a59878] hover:bg-opacity-90 text-white text-[9px] px-1.5 py-0.5 rounded-md transition-colors flex items-center gap-0.5"
          >
            HPはこちら
            <span className="flex items-center justify-center w-2.5 h-2.5 bg-white rounded-full">
              <span className="text-[#a59878] font-bold text-[10px] leading-none" style={{ transform: 'translate(0.5px, -1.5px)' }}>›</span>
            </span>
          </button>

          {/* Navigation buttons */}
          <button
            onClick={handlePrevImage}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
          >
            &#8249;
          </button>
          <button
            onClick={handleNextImage}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
          >
            &#8250;
          </button>
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-4 py-1.5 bg-white">
          {Array.from({ length: IMAGE_COUNT }).map((_, index) => (
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

      <div className="px-2.5 pb-2.5">
        <h3 className="m-0 mb-2 text-gray-900 text-sm font-semibold leading-tight">
          {clinic.name}
        </h3>

        <div className="flex items-center mb-2 gap-1 pb-1.5 border-b border-[#a59878]">
          <span className="text-gray-600 text-[10px] border border-gray-300 rounded-full px-1.5 py-0.5">
            {clinic.prefecture?.name}
          </span>
          <span className="text-gray-600 text-[10px] border border-gray-300 rounded-full px-1.5 py-0.5">
            {clinic.area?.name}
          </span>
        </div>

        <div className="mb-2">
          <div className="flex items-center gap-1 mb-0.5">
            <img
              src="/common/ranking-icon.png"
              alt="ランキング"
              className="w-[14px] h-[14px]"
            />
            <span className="text-[#a69a7e] text-[10px]">クチコミ評価</span>
            <img
              src={clinic.star !== null ? getStarImage(clinic.star) : '/common/star_0.5.png'}
              alt={clinic.star !== null ? `${clinic.star}星評価` : '評価なし'}
              className="w-12 h-2.5"
            />
          </div>
          <div className="text-[10px]">
            評価平均 <span className="text-[#a69a7e] font-normal text-sm">{clinic.star ?? ''}</span> / 評価人数 <span className="text-[#a69a7e] font-normal text-sm">{clinic.user_review_count ?? 0}</span><span className="text-[#a69a7e] font-normal text-sm">人</span>
          </div>
        </div>

        <Link href={`/clinic/${clinic.uuid}`}>
          <button className="w-full py-2.5 px-2 bg-[#a59878] text-white text-[11px] font-semibold rounded hover:bg-black transition-all duration-300 group">
            <span className="text-center leading-tight inline-block">
              基本情報とクチコミ詳細<span className="inline-flex items-center justify-center w-3 h-3 bg-white rounded-full transition-all duration-300 group-hover:translate-x-1 ml-1 align-middle">
                <span className="text-[#a59878] font-bold text-sm leading-none inline-block" style={{ transform: 'translate(0.5px, -1px)' }}>›</span>
              </span>
            </span>
          </button>
        </Link>
      </div>
    </div>
  )
}
