'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import GenreModal from '@/components/GenreModal'

interface DetailHeaderProps {
  genreId: number
  genreName: string
  genreCode?: string
  showNavButtons?: boolean
}

interface Genre {
  id: number
  name: string
  code: string
}

const getGenreLogoPath = (genreCode?: string): string => {
  if (!genreCode) {
    return '/mrr/default/logo_header.png'
  }
  return `/mrr/${genreCode}/logo_header.png`
}

export default function DetailHeader({ genreId, genreName, genreCode, showNavButtons = false }: DetailHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isGenreModalOpen, setIsGenreModalOpen] = useState(false)
  const [genres, setGenres] = useState<Genre[]>([])
  const pathname = usePathname()

  const logoPath = getGenreLogoPath(genreCode)

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Fetch genres on mount
  useEffect(() => {
    fetch('http://127.0.0.1:54321/rest/v1/genres?order=id.asc', {
      headers: {
        'apikey': 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'
      }
    })
      .then(res => res.json())
      .then(data => setGenres(data))
      .catch(err => console.error('Failed to fetch genres:', err))
  }, [])

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
      {/* Genre Modal */}
      <GenreModal isOpen={isGenreModalOpen} onClose={() => setIsGenreModalOpen(false)} genres={genres} />

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

          {/* Navigation Buttons (PC) */}
          {showNavButtons && (
            <nav className="hidden md:flex gap-4 items-end">
              <button
                onClick={() => scrollToSection('map-section')}
                className="bg-white px-2.5 py-1 rounded-md font-semibold transition-all duration-200 hover:bg-white/50 hover:backdrop-blur-sm flex flex-col items-center leading-tight gap-1 relative overflow-hidden group mb-1"
                style={{ color: genreCode === 'pilates' ? 'rgb(238, 154, 162)' : genreCode === 'dermatology' ? 'rgb(220, 194, 219)' : '#acd1e6', fontSize: '13px' }}
              >
                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-40 transition-opacity duration-200"></span>
                <span
                  className="pb-1 transition-colors duration-200 relative z-10"
                  style={{ borderBottom: '2.5px solid', borderColor: genreCode === 'pilates' ? 'rgb(238, 154, 162)' : genreCode === 'dermatology' ? 'rgb(220, 194, 219)' : '#acd1e6' }}
                >
                  マップで絞り込み検索
                </span>
                <span className="text-[10px] font-normal relative z-10">Map search</span>
              </button>
              <button
                onClick={() => scrollToSection('list-section')}
                className="bg-white px-2.5 py-1 rounded-md font-semibold transition-all duration-200 hover:bg-white/50 hover:backdrop-blur-sm flex flex-col items-center leading-tight gap-1 relative overflow-hidden group mb-1"
                style={{ color: genreCode === 'pilates' ? 'rgb(238, 154, 162)' : genreCode === 'dermatology' ? 'rgb(220, 194, 219)' : '#acd1e6', fontSize: '13px' }}
              >
                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-40 transition-opacity duration-200"></span>
                <span
                  className="pb-1 transition-colors duration-200 relative z-10"
                  style={{ borderBottom: '2.5px solid', borderColor: genreCode === 'pilates' ? 'rgb(238, 154, 162)' : genreCode === 'dermatology' ? 'rgb(220, 194, 219)' : '#acd1e6' }}
                >
                  リストで絞り込み検索
                </span>
                <span className="text-[10px] font-normal relative z-10">List search</span>
              </button>
              <button
                onClick={() => setIsGenreModalOpen(true)}
                className="px-3 py-2 rounded-md font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 relative overflow-hidden group mb-2 text-white"
                style={{ backgroundColor: genreCode === 'pilates' ? 'rgb(238, 154, 162)' : genreCode === 'dermatology' ? 'rgb(220, 194, 219)' : '#acd1e6' }}
              >
                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200"></span>
                <span className="relative z-10">業種から探す</span>
                <span className="flex items-center justify-center w-4 h-4 bg-white rounded-full relative z-10" style={{ transform: 'translateY(0px)' }}>
                  <span className="font-bold text-xl leading-none" style={{ color: genreCode === 'pilates' ? 'rgb(238, 154, 162)' : genreCode === 'dermatology' ? 'rgb(220, 194, 219)' : '#acd1e6', transform: 'translate(0.5px, -2px)' }}>›</span>
                </span>
              </button>
            </nav>
          )}

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

              {/* Navigation Buttons (PC) */}
              {showNavButtons && (
                <nav className="hidden md:flex gap-4 items-end">
                  <button
                    onClick={() => scrollToSection('map-section')}
                    className="bg-white px-2.5 py-1 rounded-md font-semibold transition-all duration-200 hover:bg-white/50 hover:backdrop-blur-sm flex flex-col items-center leading-tight gap-1 relative overflow-hidden group mb-1"
                    style={{ color: genreCode === 'pilates' ? 'rgb(238, 154, 162)' : genreCode === 'dermatology' ? 'rgb(220, 194, 219)' : '#acd1e6', fontSize: '13px' }}
                  >
                    <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-40 transition-opacity duration-200"></span>
                    <span
                      className="pb-1 transition-colors duration-200 relative z-10"
                      style={{ borderBottom: '2.5px solid', borderColor: genreCode === 'pilates' ? 'rgb(238, 154, 162)' : genreCode === 'dermatology' ? 'rgb(220, 194, 219)' : '#acd1e6' }}
                    >
                      マップで絞り込み検索
                    </span>
                    <span className="text-[10px] font-normal relative z-10">Map search</span>
                  </button>
                  <button
                    onClick={() => scrollToSection('list-section')}
                    className="bg-white px-2.5 py-1 rounded-md font-semibold transition-all duration-200 hover:bg-white/50 hover:backdrop-blur-sm flex flex-col items-center leading-tight gap-1 relative overflow-hidden group mb-1"
                    style={{ color: genreCode === 'pilates' ? 'rgb(238, 154, 162)' : genreCode === 'dermatology' ? 'rgb(220, 194, 219)' : '#acd1e6', fontSize: '13px' }}
                  >
                    <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-40 transition-opacity duration-200"></span>
                    <span
                      className="pb-1 transition-colors duration-200 relative z-10"
                      style={{ borderBottom: '2.5px solid', borderColor: genreCode === 'pilates' ? 'rgb(238, 154, 162)' : genreCode === 'dermatology' ? 'rgb(220, 194, 219)' : '#acd1e6' }}
                    >
                      リストで絞り込み検索
                    </span>
                    <span className="text-[10px] font-normal relative z-10">List search</span>
                  </button>
                  <button
                    onClick={() => setIsGenreModalOpen(true)}
                    className="px-3 py-2 rounded-md font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 relative overflow-hidden group mb-2 text-white"
                    style={{ backgroundColor: genreCode === 'pilates' ? 'rgb(238, 154, 162)' : genreCode === 'dermatology' ? 'rgb(220, 194, 219)' : '#acd1e6' }}
                  >
                    <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200"></span>
                    <span className="relative z-10">業種から探す</span>
                    <span className="flex items-center justify-center w-4 h-4 bg-white rounded-full relative z-10" style={{ transform: 'translateY(0px)' }}>
                      <span className="font-bold text-xl leading-none" style={{ color: genreCode === 'pilates' ? 'rgb(238, 154, 162)' : genreCode === 'dermatology' ? 'rgb(220, 194, 219)' : '#acd1e6', transform: 'translate(0.5px, -2px)' }}>›</span>
                    </span>
                  </button>
                </nav>
              )}

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
