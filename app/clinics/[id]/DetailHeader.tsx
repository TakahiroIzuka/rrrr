'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

interface DetailHeaderProps {
  genreId: number
  genreName: string
}

const getGenreLogoPath = (genreId: number): string => {
  switch (genreId) {
    case 1:
      return '/mrr/pilates/logo_header.png'
    case 2:
      return '/mrr/medical/logo_header.png'
    case 5:
      return '/mrr/dermatology/logo_header.png'
    default:
      return '/mrr/medical/logo_header.png'
  }
}

export default function DetailHeader({ genreId, genreName }: DetailHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const logoPath = getGenreLogoPath(genreId)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // スクロール位置が96px（ヘッダーの高さ）を超えたかどうか
      if (currentScrollY > 96) {
        if (!isScrolled) {
          setIsScrolled(true)
          setIsVisible(false)
          // 少し遅延してから表示
          setTimeout(() => {
            setIsVisible(true)
          }, 150)
        }
      } else {
        // 元の位置に戻る直前にアニメーションで消す
        if (isScrolled) {
          setIsVisible(false)
          // アニメーション完了後に固定ヘッダーを非表示
          setTimeout(() => {
            setIsScrolled(false)
          }, 300)
        }
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY, isScrolled])

  return (
    <>
      {/* 通常のヘッダー（スクロール前） */}
      <header className="bg-[#eae3db] md:bg-white text-gray-700 h-16 md:h-24 relative z-[1000]" style={{ borderTop: '5px solid #a69a7e' }}>
      <div className="flex justify-between items-center h-full px-4 md:px-8">
        <div className="flex items-center gap-10">
          <Image
            src={logoPath}
            alt="メディカルクチコミランキング"
            width={180}
            height={40}
            className="h-10 md:hidden"
          />
          <Image
            src={logoPath}
            alt="メディカルクチコミランキング"
            width={280}
            height={64}
            className="h-16 hidden md:block"
          />
          {/* ラベル（PC表示） */}
          <div className="hidden md:flex items-center bg-[rgb(163,151,125)] text-white px-3 py-2 rounded-lg font-semibold text-sm mb-2">
            {genreName}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* ラベル（スマホ表示） */}
          <div className="md:hidden flex items-center bg-[rgb(163,151,125)] text-white px-2 py-1.5 rounded-lg font-semibold text-xs">
            {genreName}
          </div>

          {/* ハンバーガーメニュー（スマホ） */}
          <button
            className="md:hidden flex flex-col items-start justify-center gap-1.5 w-10 h-10 bg-white rounded-md"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="w-6 h-0.5 bg-[#a69a7e] transition-all ml-2"></span>
            <span className="w-5 h-0.5 bg-[#a69a7e] transition-all ml-2"></span>
            <span className="w-4 h-0.5 bg-[#a69a7e] transition-all ml-2"></span>
          </button>
        </div>
      </div>
    </header>

      {/* 固定ヘッダー（スクロール後） */}
      {isScrolled && (
        <header
          className={`bg-[#eae3db] md:bg-white text-gray-700 h-16 md:h-24 fixed top-0 left-0 right-0 z-[1000] transition-transform duration-700 ease-out ${
            isVisible ? 'translate-y-0' : '-translate-y-full'
          }`}
          style={{ borderTop: '5px solid #a69a7e' }}
        >
          <div className="flex justify-between items-center h-full px-4 md:px-8">
            <div className="flex items-center gap-10">
              <Image
                src={logoPath}
                alt="メディカルクチコミランキング"
                width={180}
                height={40}
                className="h-10 md:hidden"
              />
              <Image
                src={logoPath}
                alt="メディカルクチコミランキング"
                width={280}
                height={64}
                className="h-16 hidden md:block"
              />
              {/* ラベル（PC表示） */}
              <div className="hidden md:flex items-center bg-[rgb(163,151,125)] text-white px-3 py-2 rounded-lg font-semibold text-sm mb-2">
                {genreName}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* ラベル（スマホ表示） */}
              <div className="md:hidden flex items-center bg-[rgb(163,151,125)] text-white px-2 py-1.5 rounded-lg font-semibold text-xs">
                {genreName}
              </div>

              {/* ハンバーガーメニュー（スマホ） */}
              <button
                className="md:hidden flex flex-col items-start justify-center gap-1.5 w-10 h-10 bg-white rounded-md"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span className="w-6 h-0.5 bg-[#a69a7e] transition-all ml-2"></span>
                <span className="w-5 h-0.5 bg-[#a69a7e] transition-all ml-2"></span>
                <span className="w-4 h-0.5 bg-[#a69a7e] transition-all ml-2"></span>
              </button>
            </div>
          </div>
        </header>
      )}
    </>
  )
}
