'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import GenreModal from './GenreModal'
import AreaModal from './AreaModal'
import MobileMenu from './MobileMenu'
import { useServiceCode, useServiceName } from '@/contexts/ServiceContext'
import { REVIEW_RANKING_CONFIG } from '@/lib/constants/services'

interface Genre {
  id: number
  name: string
  code: string
}

interface Prefecture {
  id: number
  name: string
}

interface Area {
  id: number
  name: string
  prefecture_id: number
}

interface AreasGrouped {
  prefecture: Prefecture
  areas: Area[]
}

interface GenreConfig {
  lineColor?: string
  color?: string
}

interface HeaderProps {
  lineColor?: string
  color?: string
  pageType?: 'top' | 'list' | 'detail' | 'genre-top'
  labelText?: string | string[]
  genreCode?: string
}

export default function Header({
  lineColor: lineColorProp = "rgb(248, 176, 66)",
  color: colorProp = "rgb(248, 176, 66)",
  pageType = 'top',
  labelText,
  genreCode,
}: HeaderProps) {
  const serviceCode = useServiceCode()
  const serviceName = useServiceName()
  const [headerImagePath, setHeaderImagePath] = useState<string>(`/${serviceCode}/default/logo_header.png`)

  const config = REVIEW_RANKING_CONFIG[serviceCode as keyof typeof REVIEW_RANKING_CONFIG]
  // pageTypeがdetailまたはgenre-topの場合、REVIEW_RANKING_CONFIGからlineColorとcolorを取得
  let lineColor: string = config.lineColor ?? lineColorProp
  let color: string = config.color ?? colorProp

  if ((pageType === 'detail' || pageType === 'genre-top') && genreCode && config?.genres) {
    const genreConfig = (config.genres as Record<string, GenreConfig>)[genreCode]
    if (genreConfig) {
      lineColor = genreConfig.lineColor ?? lineColor
      color = genreConfig.color ?? color
    }
  }

  // 画像の存在チェック
  useEffect(() => {
    // pageTypeがdetailまたはgenre-topで、genreCodeがある場合のみチェック
    if ((pageType === 'detail' || pageType === 'genre-top') && genreCode) {
      // REVIEW_RANKING_CONFIGのgenresにgenreCodeが定義されているかチェック
      const genreConfig = config.genres?.[genreCode as keyof typeof config.genres]
      if (genreConfig) {
        const genreSpecificPath = `/${serviceCode}/${genreCode}/logo_header.png`

        // 画像の存在を確認
        const img = new window.Image()
        img.onload = () => {
          // 画像が存在する場合、ジャンル固有のパスを使用
          setHeaderImagePath(genreSpecificPath)
        }
        img.onerror = () => {
          // 画像が存在しない場合、デフォルトのパスを使用
          setHeaderImagePath(`/${serviceCode}/default/logo_header.png`)
        }
        img.src = genreSpecificPath
      }
    }
  }, [serviceCode, pageType, genreCode, config])

  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isGenreModalOpen, setIsGenreModalOpen] = useState(false)
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false)
  const [genres, setGenres] = useState<Genre[]>([])
  const [areasGrouped, setAreasGrouped] = useState<AreasGrouped[]>([])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const headerHeight = window.innerWidth < 768 ? 64 : 112 // モバイル64px、PC固定ヘッダー112px
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      window.scrollTo({
        top: elementPosition - headerHeight - 16, // 16pxの余白
        behavior: 'smooth'
      })
    }
  }

  // Fetch genres on mount and when serviceCode changes
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase environment variables not configured')
      return
    }

    // First, get the service ID for the current service code
    const serviceUrl = `${supabaseUrl}/rest/v1/services?code=eq.${serviceCode}`

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
        throw new Error(`Service not found for code: ${serviceCode}`)
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
  }, [serviceCode])

  // Fetch areas grouped by prefecture on mount and when serviceCode changes
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return
    }

    // First, get the service ID for the current service code
    fetch(`${supabaseUrl}/rest/v1/services?code=eq.${serviceCode}`, {
      headers: {
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(async (serviceData) => {
        if (!serviceData || !Array.isArray(serviceData) || serviceData.length === 0) {
          throw new Error('Service not found')
        }

        const serviceId = serviceData[0].id

        // Get facilities for this service (with or without area_id)
        const facilitiesRes = await fetch(
          `${supabaseUrl}/rest/v1/facilities?service_id=eq.${serviceId}&select=area_id,prefecture_id`,
          {
            headers: {
              'apikey': supabaseKey,
              'Content-Type': 'application/json'
            }
          }
        )
        const facilities = await facilitiesRes.json()

        if (!Array.isArray(facilities) || facilities.length === 0) {
          setAreasGrouped([])
          return
        }

        // Get unique area_ids and prefecture_ids (filter out nulls)
        const areaIds = [...new Set(facilities.map((f: { area_id: number | null }) => f.area_id).filter((id): id is number => id !== null))]
        const prefectureIds = [...new Set(facilities.map((f: { prefecture_id: number | null }) => f.prefecture_id).filter((id): id is number => id !== null))]

        // If no prefectures, return empty
        if (prefectureIds.length === 0) {
          setAreasGrouped([])
          return
        }

        // Fetch areas (only if there are area_ids)
        let areas: Area[] = []
        if (areaIds.length > 0) {
          const areasRes = await fetch(
            `${supabaseUrl}/rest/v1/areas?id=in.(${areaIds.join(',')})&order=id.asc`,
            {
              headers: {
                'apikey': supabaseKey,
                'Content-Type': 'application/json'
              }
            }
          )
          areas = await areasRes.json()
        }

        // Fetch prefectures
        const prefecturesRes = await fetch(
          `${supabaseUrl}/rest/v1/prefectures?id=in.(${prefectureIds.join(',')})&order=id.asc`,
          {
            headers: {
              'apikey': supabaseKey,
              'Content-Type': 'application/json'
            }
          }
        )
        const prefectures = await prefecturesRes.json()

        // Group areas by prefecture (include prefectures without areas)
        const grouped = prefectures.map((prefecture: Prefecture) => ({
          prefecture,
          areas: areas.filter((area: Area) => area.prefecture_id === prefecture.id)
        }))

        setAreasGrouped(grouped)
      })
      .catch(err => {
        console.error('Failed to fetch areas:', err)
        setAreasGrouped([])
      })
  }, [serviceCode])

  // ロゴのリンク先をserviceCodeから判定
  const logoLink = `/${serviceCode}`

  // ナビゲーションボタンを表示するかどうか
  const showNavButtons = pageType === 'top' || pageType === 'genre-top'

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
              src={headerImagePath}
              alt={`${serviceName}クチコミランキング`}
              width={200}
              height={45}
              className="h-12"
            />
          </Link>
          <Link href={logoLink} className="hidden md:block">
            <Image
              src={headerImagePath}
              alt={`${serviceName}クチコミランキング`}
              width={320}
              height={72}
              className="h-18"
            />
          </Link>
          {/* ラベル（PC表示） */}
          {labelText && (
            <div className="hidden md:flex items-center gap-2 mb-2">
              {(Array.isArray(labelText) ? labelText : [labelText]).map((label, index) => (
                <div key={index} className="bg-[rgb(163,151,125)] text-white px-3 py-2 rounded-lg font-semibold text-sm">
                  {label}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 pr-14 md:pr-0">
          {/* ラベル（スマホ表示） */}
          {labelText && (
            <div className="md:hidden flex items-center gap-1">
              {(Array.isArray(labelText) ? labelText : [labelText]).map((label, index) => (
                <div key={index} className="bg-[rgb(163,151,125)] text-white px-2 py-1.5 rounded-lg font-semibold text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px]">
                  {label}
                </div>
              ))}
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

        {showNavButtons && (
          <nav className="hidden md:flex gap-4 items-end">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="bg-white px-3 py-1.5 rounded-md font-medium transition-all duration-200 hover:bg-white/50 hover:backdrop-blur-sm flex flex-col items-center leading-tight gap-1 relative overflow-hidden group mb-0" style={{ fontSize: '14px', color }}>
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
            <button onClick={() => setIsAreaModalOpen(true)} className="text-white px-4 py-2.5 rounded-md font-medium text-[15px] transition-all duration-200 flex items-center justify-center gap-2 relative overflow-hidden group mb-2" style={{ backgroundColor: color }}>
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200"></span>
              <span className="relative z-10">各エリアから探す</span>
              <span className="flex items-center justify-center w-5 h-5 bg-white rounded-full relative z-10" style={{ transform: 'translateY(0px)' }}>
                <span className="font-bold text-xl leading-none" style={{ transform: 'translate(0.5px, -2px)', color }}>›</span>
              </span>
            </button>
          </nav>
        )}
      </div>
    </header>

      {/* Genre Modal */}
      <GenreModal isOpen={isGenreModalOpen} onClose={() => setIsGenreModalOpen(false)} genres={genres} />

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        logoPath={headerImagePath}
        onMapClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onListClick={() => setTimeout(() => scrollToSection('list-section'), 150)}
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
                  src={headerImagePath}
                  alt={`${serviceName}クチコミランキング`}
                  width={180}
                  height={40}
                  className="h-10"
                />
              </Link>
              <Link href={logoLink} className="hidden md:block">
                <Image
                  src={headerImagePath}
                  alt={`${serviceName}クチコミランキング`}
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
            {showNavButtons && (
              <nav className="hidden md:flex gap-4 items-end">
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="bg-white px-3 py-1.5 rounded-md font-medium transition-all duration-200 hover:bg-white/50 hover:backdrop-blur-sm flex flex-col items-center leading-tight gap-1 relative overflow-hidden group mb-0" style={{ fontSize: '14px', color }}>
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
                <button onClick={() => setIsAreaModalOpen(true)} className="text-white px-4 py-2.5 rounded-md font-medium text-[15px] transition-all duration-200 flex items-center justify-center gap-2 relative overflow-hidden group mb-2" style={{ backgroundColor: color }}>
                  <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200"></span>
                  <span className="relative z-10">各エリアから探す</span>
                  <span className="flex items-center justify-center w-5 h-5 bg-white rounded-full relative z-10" style={{ transform: 'translateY(0px)' }}>
                    <span className="font-bold text-xl leading-none" style={{ transform: 'translate(0.5px, -2px)', color }}>›</span>
                  </span>
                </button>
              </nav>
            )}
          </div>
        </header>
      )}

      {/* Area Modal */}
      <AreaModal isOpen={isAreaModalOpen} onClose={() => setIsAreaModalOpen(false)} areasGrouped={areasGrouped} />
    </>
  )
}