'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import GenreModal from './GenreModal'
import MobileMenu from './MobileMenu'

interface Genre {
  id: number
  name: string
  code: string
}

interface HeaderProps {
  imagePath?: string
  lineColor?: string
  color?: string
  labelText?: string
}

export default function Header({
  imagePath = '/medical/default/logo_header.png',
  lineColor = '#a69a7e',
  color = '#acd1e6',
  labelText
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isGenreModalOpen, setIsGenreModalOpen] = useState(false)
  const [genres, setGenres] = useState<Genre[]>([])
  const pathname = usePathname()

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // serviceCodeを判定
  const currentServiceCode = pathname?.startsWith('/kuchikomiru')
    ? 'kuchikomiru'
    : pathname?.startsWith('/house-builder')
    ? 'house-builder'
    : 'medical'

  // Fetch genres on mount and when serviceCode changes
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase environment variables not configured')
      return
    }

    // First, get the service ID for the current service code
    const serviceUrl = `${supabaseUrl}/rest/v1/services?code=eq.${currentServiceCode}`

    fetch(serviceUrl, {
      headers: {
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then(serviceData => {
        if (serviceData && Array.isArray(serviceData) && serviceData.length > 0) {
          const serviceId = serviceData[0].id
          // Then fetch genres for this service
          return fetch(`${supabaseUrl}/rest/v1/genres?service_id=eq.${serviceId}&order=id.asc`, {
            headers: {
              'apikey': supabaseKey,
              'Content-Type': 'application/json'
            }
          })
        }
        throw new Error(`Service not found for code: ${currentServiceCode}`)
      })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then(data => {
        if (Array.isArray(data)) {
          setGenres(data)
        }
      })
      .catch(err => {
        console.error('Failed to fetch genres:', err)
        setGenres([])
      })
  }, [currentServiceCode])

  // 詳細ページかどうかを判定
  const isDetailPage = (pathname?.startsWith('/medical/list/') && pathname !== '/medical/list') ||
                       (pathname?.startsWith('/kuchikomiru/list/') && pathname !== '/kuchikomiru/list') ||
                       (pathname?.startsWith('/house-builder/list/') && pathname !== '/house-builder/list')

  // 一覧ページかどうかを判定
  const isListPage = pathname === '/medical/list' || pathname === '/kuchikomiru/list' || pathname === '/house-builder/list'

  // ロゴのリンク先を判定
  const logoLink = pathname?.startsWith('/kuchikomiru')
    ? '/kuchikomiru'
    : pathname?.startsWith('/house-builder')
    ? '/house-builder'
    : '/medical'

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
      {/* ヘッダー（スマホは固定、PCは通常） */}
      <header className="bg-[#eae3db] md:bg-white text-gray-700 h-16 md:h-28 fixed md:relative z-[1000] border-t-0 md:border-t-[5px]" style={{ borderColor: lineColor, width: '100%', top: 0, left: 0, right: 0 }}>
      <div className="flex justify-between items-center h-full px-4 md:px-8">
        <div className="flex items-center gap-10">
          <Link href={logoLink} className="md:hidden">
            <Image
              src={imagePath}
              alt="メディカルクチコミランキング"
              width={200}
              height={45}
              className="h-12"
            />
          </Link>
          <Link href={logoLink} className="hidden md:block">
            <Image
              src={imagePath}
              alt="メディカルクチコミランキング"
              width={320}
              height={72}
              className="h-18"
            />
          </Link>
          {/* ラベル（PC表示） */}
          {labelText && (
            <div className="hidden md:flex items-center bg-[rgb(163,151,125)] text-white px-3 py-2 rounded-lg font-semibold text-sm mb-2">
              {labelText}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pr-14 md:pr-0">
          {/* ラベル（スマホ表示） */}
          {labelText && (
            <div className="md:hidden flex items-center bg-[rgb(163,151,125)] text-white px-2 py-1.5 rounded-lg font-semibold text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
              {labelText}
            </div>
          )}
        </div>

        {/* ハンバーガーメニュー（スマホ） */}
        <button
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-md shadow-lg"
          style={{
            backgroundColor: 'white',
            position: 'fixed',
            right: '16px',
            top: '12px',
            zIndex: 9999
          }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="rgb(163, 151, 125)" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <div className="flex flex-col items-start justify-center gap-1.5">
              <span className="w-6 h-0.5 bg-[#a69a7e] transition-all"></span>
              <span className="w-5 h-0.5 bg-[#a69a7e] transition-all"></span>
              <span className="w-4 h-0.5 bg-[#a69a7e] transition-all"></span>
            </div>
          )}
        </button>

        {!isDetailPage && !isListPage && (
          <nav className="hidden md:flex gap-4 items-end">
            <button onClick={() => scrollToSection('map-section')} className="bg-white px-3 py-1.5 rounded-md font-medium transition-all duration-200 hover:bg-white/50 hover:backdrop-blur-sm flex flex-col items-center leading-tight gap-1 relative overflow-hidden group mb-0" style={{ fontSize: '14px', color }}>
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-40 transition-opacity duration-200"></span>
              <span className="pb-1 transition-colors duration-200 relative z-10" style={{ borderBottom: `2.5px solid ${color}` }}>マップで絞り込み検索</span>
              <span className="text-[15px] font-normal relative z-10">Map search</span>
            </button>
            <button onClick={() => scrollToSection('list-section')} className="bg-white px-3 py-1.5 rounded-md font-medium transition-all duration-200 hover:bg-white/50 hover:backdrop-blur-sm flex flex-col items-center leading-tight gap-1 relative overflow-hidden group mb-0" style={{ fontSize: '14px', color }}>
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-40 transition-opacity duration-200"></span>
              <span className="pb-1 transition-colors duration-200 relative z-10" style={{ borderBottom: `2.5px solid ${color}` }}>リストで絞り込み検索</span>
              <span className="text-[15px] font-normal relative z-10">List search</span>
            </button>
            <button onClick={() => setIsGenreModalOpen(true)} className="text-white px-4 py-2.5 rounded-md font-medium text-[15px] transition-all duration-200 flex items-center justify-center gap-2 relative overflow-hidden group mb-2" style={{ backgroundColor: color }}>
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200"></span>
              <span className="relative z-10">業種から探す</span>
              <span className="flex items-center justify-center w-5 h-5 bg-white rounded-full relative z-10" style={{ transform: 'translateY(0px)' }}>
                <span className="font-bold text-xl leading-none" style={{ transform: 'translate(0.5px, -2px)', color }}>›</span>
              </span>
            </button>
          </nav>
        )}
      </div>
    </header>

      {/* Genre Modal */}
      <GenreModal isOpen={isGenreModalOpen} onClose={() => setIsGenreModalOpen(false)} genres={genres} serviceCode={currentServiceCode} />

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        logoPath={imagePath}
        onMapClick={() => scrollToSection('map-section')}
        onListClick={() => scrollToSection('list-section')}
        onGenreClick={() => setIsGenreModalOpen(true)}
      />

      {/* 固定ヘッダー（スクロール後・PCのみ） */}
      {isScrolled && (
        <header
          className={`hidden md:block bg-white text-gray-700 h-28 fixed top-0 left-0 right-0 z-[1000] transition-transform duration-700 ease-out ${
            isVisible ? 'translate-y-0' : '-translate-y-full'
          }`}
          style={{ borderTop: `5px solid ${lineColor}` }}
        >
          <div className="flex justify-between items-center h-full px-4 md:px-8">
            <div className="flex items-center gap-10">
              <Link href={logoLink} className="md:hidden">
                <Image
                  src={imagePath}
                  alt="メディカルクチコミランキング"
                  width={180}
                  height={40}
                  className="h-10"
                />
              </Link>
              <Link href={logoLink} className="hidden md:block">
                <Image
                  src={imagePath}
                  alt="メディカルクチコミランキング"
                  width={320}
                  height={72}
                  className="h-18"
                />
              </Link>
              {/* ラベル（PC表示） */}
              {labelText && (
                <div className="hidden md:flex items-center bg-[rgb(163,151,125)] text-white px-3 py-2 rounded-lg font-semibold text-sm mb-2">
                  {labelText}
                </div>
              )}
            </div>

            {/* PC用のナビゲーション */}
            {!isDetailPage && !isListPage && (
              <nav className="hidden md:flex gap-4 items-end">
                <button onClick={() => scrollToSection('map-section')} className="bg-white px-3 py-1.5 rounded-md font-medium transition-all duration-200 hover:bg-white/50 hover:backdrop-blur-sm flex flex-col items-center leading-tight gap-1 relative overflow-hidden group mb-0" style={{ fontSize: '14px', color }}>
                  <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-40 transition-opacity duration-200"></span>
                  <span className="pb-1 transition-colors duration-200 relative z-10" style={{ borderBottom: `2.5px solid ${color}` }}>マップで絞り込み検索</span>
                  <span className="text-[15px] font-normal relative z-10">Map search</span>
                </button>
                <button onClick={() => scrollToSection('list-section')} className="bg-white px-3 py-1.5 rounded-md font-medium transition-all duration-200 hover:bg-white/50 hover:backdrop-blur-sm flex flex-col items-center leading-tight gap-1 relative overflow-hidden group mb-0" style={{ fontSize: '14px', color }}>
                  <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-40 transition-opacity duration-200"></span>
                  <span className="pb-1 transition-colors duration-200 relative z-10" style={{ borderBottom: `2.5px solid ${color}` }}>リストで絞り込み検索</span>
                  <span className="text-[15px] font-normal relative z-10">List search</span>
                </button>
                <button onClick={() => setIsGenreModalOpen(true)} className="text-white px-4 py-2.5 rounded-md font-medium text-[15px] transition-all duration-200 flex items-center justify-center gap-2 relative overflow-hidden group mb-2" style={{ backgroundColor: color }}>
                  <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200"></span>
                  <span className="relative z-10">業種から探す</span>
                  <span className="flex items-center justify-center w-5 h-5 bg-white rounded-full relative z-10" style={{ transform: 'translateY(0px)' }}>
                    <span className="font-bold text-xl leading-none" style={{ transform: 'translate(0.5px, -2px)', color }}>›</span>
                  </span>
                </button>
              </nav>
            )}
          </div>
        </header>
      )}
    </>
  )
}