'use client'

import { useState } from 'react'
import type { Clinic } from '@/types/clinic'

interface Div2Props {
  clinic: Clinic
}

// テスト用の画像リンク
const TEST_IMAGES = [
  'https://placehold.co/600x400/e3d5ca/000000?text=Image+1',
  'https://placehold.co/600x400/d4c4b0/000000?text=Image+2',
  'https://placehold.co/600x400/c5b299/000000?text=Image+3',
  'https://placehold.co/600x400/b6a082/000000?text=Image+4',
  'https://placehold.co/600x400/a78e6b/000000?text=Image+5'
]

export default function Div2({ clinic }: Div2Props) {
  const [selectedImage, setSelectedImage] = useState(0)

  return (
    <div className="mb-4 border-2 border-gray-300 p-4">
      <div className="flex gap-4">
        {/* 左側 - 画像エリア */}
        <div className="w-[45%]">
          {/* メイン画像 */}
          <div className="mb-2 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={TEST_IMAGES[selectedImage]}
              alt={`${clinic.name}の画像 ${selectedImage + 1}`}
              className="w-full h-80 object-cover"
            />
          </div>

          {/* サムネイル画像 */}
          <div className="flex rounded-lg overflow-hidden">
            {TEST_IMAGES.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className="flex-1 overflow-hidden transition-all relative"
              >
                <img
                  src={image}
                  alt={`${clinic.name}のサムネイル ${index + 1}`}
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
        <div className="w-[55%] flex flex-col text-sm">
          <div className="border-b border-gray-300 p-1.5 text-center bg-white">
            <div className="p-2 rounded" style={{ backgroundColor: 'rgb(255, 249, 240)' }}>
              <p>基本情報</p>
            </div>
          </div>
          <div className="border-b border-gray-300 p-1.5 flex">
            <div className="w-[30%] p-2 rounded text-center flex items-center justify-center" style={{ backgroundColor: 'rgb(255, 249, 240)' }}>
              <p>会社名</p>
            </div>
            <div className="w-[70%] p-2">
              <p>b</p>
            </div>
          </div>
          <div className="border-b border-gray-300 p-1.5 flex">
            <div className="w-[30%] p-2 rounded text-center flex items-center justify-center" style={{ backgroundColor: 'rgb(255, 249, 240)' }}>
              <p>エリア</p>
            </div>
            <div className="w-[70%] p-2">
              <p>c</p>
            </div>
          </div>
          <div className="border-b border-gray-300 p-1.5 flex">
            <div className="w-[30%] p-2 rounded text-center flex items-center justify-center" style={{ backgroundColor: 'rgb(255, 249, 240)' }}>
              <p>住所</p>
            </div>
            <div className="w-[70%] p-2">
              <p>d</p>
            </div>
          </div>
          <div className="border-b border-gray-300 p-1.5 flex">
            <div className="w-[30%] p-2 rounded text-center flex items-center justify-center" style={{ backgroundColor: 'rgb(255, 249, 240)' }}>
              <p>オフィシャルHP</p>
            </div>
            <div className="w-[70%] p-2 flex items-center">
              <button className="relative bg-white border-2 px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-50 transition-colors overflow-visible" style={{ borderColor: 'rgb(163, 151, 125)', color: 'rgb(163, 151, 125)' }}>
                オフィシャルHPはこちら
                <div className="absolute -top-2 -right-2 w-4 h-4 border-2 rounded-sm" style={{ borderColor: 'rgb(163, 151, 125)' }}></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
