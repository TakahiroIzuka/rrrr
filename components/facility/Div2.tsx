'use client'

import { useState, useEffect } from 'react'
import type { Facility } from '@/types/facility'
import { useServiceCode } from '@/contexts/ServiceContext'

interface FacilityImage {
  id: number
  image_path: string
  thumbnail_path: string | null
  display_order: number
  publicUrl: string
  thumbnailUrl: string | null
}

interface Div2Props {
  facility: Facility
  images?: FacilityImage[]
}

interface DisplayImage {
  url: string
  thumbnailUrl: string
  alt: string
}

export default function Div2({ facility, images = [] }: Div2Props) {
  const serviceCode = useServiceCode()
  const [selectedImage, setSelectedImage] = useState(0)
  const [displayImages, setDisplayImages] = useState<DisplayImage[]>([])

  // Initialize display images
  useEffect(() => {
    const defaultImagePath = `/${serviceCode}/default/noimage.jpg`

    const initialImages = Array.from({ length: 5 }).map((_, index) => {
      const targetDisplayOrder = index + 1 // display_order is 1-indexed
      const facilityImage = images.find(img => img.display_order === targetDisplayOrder)
      if (facilityImage) {
        return {
          url: facilityImage.publicUrl,
          thumbnailUrl: facilityImage.thumbnailUrl || facilityImage.publicUrl,
          alt: `${facility.name}の画像 ${index + 1}`,
        }
      }
      return {
        url: defaultImagePath,
        thumbnailUrl: defaultImagePath,
        alt: `${facility.name}のデフォルト画像 ${index + 1}`,
      }
    })

    setDisplayImages(initialImages)

    // Check for genre-specific noimage.jpg for slots without facility images
    const genreCode = facility.genre?.code
    if (genreCode) {
      const genreNoImagePath = `/${serviceCode}/${genreCode}/noimage.jpg`

      // Check if genre-specific noimage exists
      const img = new window.Image()
      img.onload = () => {
        // If genre-specific image exists, update display images
        setDisplayImages(prevImages =>
          prevImages.map((image, index) => {
            const targetDisplayOrder = index + 1
            const facilityImage = images.find(img => img.display_order === targetDisplayOrder)
            // Only update if this slot doesn't have a facility image
            if (!facilityImage) {
              return {
                url: genreNoImagePath,
                thumbnailUrl: genreNoImagePath,
                alt: `${facility.name}のデフォルト画像 ${index + 1}`,
              }
            }
            return image
          })
        )
      }
      img.onerror = () => {
        // If genre-specific image doesn't exist, keep using default
        // (already set in initialImages)
      }
      img.src = genreNoImagePath
    }
  }, [facility, images, serviceCode])

  // Don't render until displayImages are loaded
  if (displayImages.length === 0) {
    return null
  }

  return (
    <div className="p-0 md:py-4 md:px-[10px]">
      <div className="flex flex-col md:flex-row gap-4">
        {/* 左側 - 画像エリア */}
        <div className="w-full md:w-[45%]">
          {/* メイン画像 */}
          <div className="mb-2 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={displayImages[selectedImage].url}
              alt={displayImages[selectedImage].alt}
              className="w-full h-72 md:h-80 object-cover"
            />
          </div>

          {/* サムネイル画像 */}
          <div className="flex rounded-lg overflow-hidden">
            {displayImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className="flex-1 overflow-hidden transition-all relative"
              >
                <img
                  src={image.thumbnailUrl}
                  alt={image.alt}
                  className="w-full h-16 object-cover"
                />
                {selectedImage !== index && (
                  <div className="absolute inset-0 bg-white bg-opacity-50"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 右側 - 情報エリア */}
        <div className="w-full md:w-[55%] flex flex-col text-xs">
          <div className="border-b border-gray-300 p-1.5 text-center bg-white hidden md:block">
            <div className="p-2 rounded" style={{ backgroundColor: 'rgb(255, 249, 240)' }}>
              <p className="font-semibold">基本情報</p>
            </div>
          </div>
          <div className="border-b border-gray-300 p-1.5 flex md:flex hidden">
            <div className="w-[30%] p-2 rounded text-center flex items-center justify-center" style={{ backgroundColor: 'rgb(255, 249, 240)' }}>
              <p className="font-semibold">会社名</p>
            </div>
            <div className="w-[70%] p-2">
              <p>{facility.company?.name || '-'}</p>
            </div>
          </div>
          <div className="border-0 md:border-b border-gray-300 p-1.5 flex flex-col md:flex-row">
            <div className="w-full md:w-[30%] p-2 rounded text-center flex items-center justify-center" style={{ backgroundColor: 'rgb(255, 249, 240)' }}>
              <p className="font-semibold">エリア</p>
            </div>
            <div className="w-full md:w-[70%] p-2 flex items-center gap-1.5">
              <span className="text-gray-600 border border-gray-300 rounded px-2 py-0.5">
                {facility.prefecture?.name}
              </span>
              <span className="text-gray-600 border border-gray-300 rounded px-2 py-0.5">
                {facility.area?.name}
              </span>
            </div>
          </div>
          <div className="border-0 md:border-b border-gray-300 p-1.5 flex flex-col md:flex-row">
            <div className="w-full md:w-[30%] p-2 rounded text-center flex items-center justify-center" style={{ backgroundColor: 'rgb(255, 249, 240)' }}>
              <p className="font-semibold">住所</p>
            </div>
            <div className="w-full md:w-[70%] p-2">
              {facility.postal_code && <p>〒{facility.postal_code}</p>}
              {facility.address && (
                <p style={{ whiteSpace: 'pre-line' }}>
                  {facility.address.replace(/\\n/g, '\n')}
                </p>
              )}
              {!facility.postal_code && !facility.address && <p>-</p>}
            </div>
          </div>
          <div className="border-0 md:border-b border-gray-300 p-1.5 flex flex-col md:flex-row">
            <div className="w-full md:w-[30%] p-2 rounded text-center flex items-center justify-center" style={{ backgroundColor: 'rgb(255, 249, 240)' }}>
              <p className="font-semibold">オフィシャルHP</p>
            </div>
            <div className="w-full md:w-[70%] p-2 flex items-center">
              {facility.site_url ? (
                <a
                  href={facility.site_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative bg-white border-2 px-3 py-1.5 rounded font-medium hover:bg-gray-50 transition-colors overflow-visible"
                  style={{ borderColor: 'rgb(163, 151, 125)', color: 'rgb(163, 151, 125)' }}
                >
                  オフィシャルHPはこちら
                  <div className="absolute -top-2 -right-2 w-4 h-4 border-2 rounded-sm" style={{ borderColor: 'rgb(163, 151, 125)' }}></div>
                </a>
              ) : (
                <p>-</p>
              )}
            </div>
          </div>
          {facility.portfolio_url && (
            <div className="border-0 md:border-b border-gray-300 p-1.5 flex flex-col md:flex-row">
              <div className="w-full md:w-[30%] p-2 rounded text-center flex items-center justify-center" style={{ backgroundColor: 'rgb(255, 249, 240)' }}>
                <p className="font-semibold">実績紹介</p>
              </div>
              <div className="w-full md:w-[70%] p-2 flex items-center">
                <a
                  href={facility.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative bg-white border-2 px-3 py-1.5 rounded font-medium hover:bg-gray-50 transition-colors overflow-visible"
                  style={{ borderColor: 'rgb(163, 151, 125)', color: 'rgb(163, 151, 125)' }}
                >
                  実績紹介の一覧ページはこちら
                  <div className="absolute -top-2 -right-2 w-4 h-4 border-2 rounded-sm" style={{ borderColor: 'rgb(163, 151, 125)' }}></div>
                </a>
              </div>
            </div>
          )}
          {facility.event_url && (
            <div className="border-0 md:border-b border-gray-300 p-1.5 flex flex-col md:flex-row">
              <div className="w-full md:w-[30%] p-2 rounded text-center flex items-center justify-center" style={{ backgroundColor: 'rgb(255, 249, 240)' }}>
                <p className="font-semibold">最新のイベント情報</p>
              </div>
              <div className="w-full md:w-[70%] p-2 flex items-center">
                <a
                  href={facility.event_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative bg-white border-2 px-3 py-1.5 rounded font-medium hover:bg-gray-50 transition-colors overflow-visible"
                  style={{ borderColor: 'rgb(163, 151, 125)', color: 'rgb(163, 151, 125)' }}
                >
                  最新のイベント情報はこちら
                  <div className="absolute -top-2 -right-2 w-4 h-4 border-2 rounded-sm" style={{ borderColor: 'rgb(163, 151, 125)' }}></div>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
