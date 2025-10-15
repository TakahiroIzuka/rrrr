'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Facility } from '@/types/facility'
import type { ServiceCode } from '@/lib/constants/services'
import { getStarImage } from '@/lib/utils/starRating'
import { IMAGE_COUNT, SWIPE_THRESHOLD } from '@/lib/constants'

interface CardProps {
  facility: Facility
  isHovered: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  serviceCode: ServiceCode
}

const getGenreNoImage = (genreId: number): string => {
  switch (genreId) {
    case 1:
      return '/mrr/pilates/noimage.jpg'
    case 2:
      return '/mrr/medical/noimage.jpg'
    case 5:
      return '/mrr/dermatology/noimage.jpg'
    default:
      return '/mrr/medical/noimage.jpg'
  }
}

export default function Card({ facility, isHovered, onMouseEnter, onMouseLeave, serviceCode }: CardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => prev > 0 ? prev - 1 : IMAGE_COUNT - 1)
  }

  const handleNextImage = () => {
    setCurrentImageIndex(prev => prev < IMAGE_COUNT - 1 ? prev + 1 : 0)
  }

  const handleIndicatorClick = (index: number) => {
    setCurrentImageIndex(index)
  }

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

    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) {
        handleNextImage()
      } else {
        handlePrevImage()
      }
    }

    setStartX(0)
    setCurrentX(0)
  }

  return (
    <div
      className={`bg-white border border-white rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ease-in-out ${
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
              src={getGenreNoImage(facility.genre_id)}
              alt={`${facility.name}の画像`}
              className="w-full h-full object-cover pointer-events-none"
            />
          </div>

          {/* HP Button */}
          {facility.site_url && (
            <a
              href={facility.site_url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-1 right-1 bg-[#a59878] hover:bg-opacity-90 text-white text-[10px] px-2 py-1 rounded-md transition-colors flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              HPはこちら
              <span className="flex items-center justify-center w-3 h-3 bg-white rounded-full">
                <span className="text-[#a59878] font-bold text-sm leading-none" style={{ transform: 'translate(0.5px, -1px)' }}>›</span>
              </span>
            </a>
          )}

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

      <div className="px-4 pb-4">
        <h3 className="m-0 mb-3 pt-3 text-gray-900 text-[1.375rem] font-semibold leading-relaxed" style={{ fontFamily: 'Kosugi Maru, sans-serif' }}>
          {facility.name}
        </h3>

        <div className="flex items-center mb-2 gap-1.5 pb-2 border-b border-[#a59878]">
          <span className="text-gray-600 text-xs border border-gray-300 rounded px-2 py-0.5">
            {facility.prefecture?.name}
          </span>
          <span className="text-gray-600 text-xs border border-gray-300 rounded px-2 py-0.5">
            {facility.area?.name}
          </span>
        </div>

        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-1">
            <img
              src="/common/ranking-icon.png"
              alt="ランキング"
              className="w-[18px] h-[18px]"
            />
            <span className="text-[#a69a7e] text-xs">クチコミ評価</span>
            <img
              src={facility.star !== null ? getStarImage(facility.star) : '/common/star_0.5.png'}
              alt={facility.star !== null ? `${facility.star}星評価` : '評価なし'}
              className="w-23 h-4"
            />
          </div>
          <div className="text-black text-xs">
            評価平均 <span className="text-[#a69a7e] font-normal text-2xl">{facility.star ?? ''}</span> / 評価人数 <span className="text-[#a69a7e] font-normal text-2xl">{facility.user_review_count}</span><span className="text-[#a69a7e] font-normal text-2xl">人</span>
          </div>
        </div>

        <Link href={`/${serviceCode}/list/${facility.id}`}>
          <button className="w-full py-2.5 px-4 bg-[#a59878] text-white text-sm font-bold rounded-md hover:bg-black transition-all duration-300 group relative overflow-visible">
            <span className="invisible">基本情報とクチコミ詳細はこちら</span>
            <span className="absolute inset-0 flex items-center justify-center gap-2 -translate-x-3">
              <span className="transition-transform duration-300 group-hover:scale-x-110 inline-block">基本情報とクチコミ詳細はこちら</span>
            </span>
            <span className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center justify-center w-4 h-4 bg-white rounded-full transition-all duration-300 group-hover:translate-x-2">
              <span className="text-[#a59878] font-bold text-xl leading-none inline-block" style={{ transform: 'translate(0.5px, -2px)' }}>›</span>
            </span>
          </button>
        </Link>
      </div>
    </div>
  )
}
