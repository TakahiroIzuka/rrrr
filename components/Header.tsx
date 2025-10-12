'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // 詳細ページかどうかを判定
  const isDetailPage = pathname?.startsWith('/clinics/') && pathname !== '/clinics'

  // 詳細ページの場合はHeaderを表示しない
  if (isDetailPage) {
    return null
  }

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
        <div className="flex items-center gap-4">
          <Image
            src="/mrr/default/logo_header.png"
            alt="メディカルクチコミランキング"
            width={180}
            height={40}
            className="h-10 md:hidden"
          />
          <Image
            src="/mrr/default/logo_header.png"
            alt="メディカルクチコミランキング"
            width={280}
            height={64}
            className="h-16 hidden md:block"
          />
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

        {!isDetailPage && (
          <nav className="hidden md:flex gap-4 items-end">
            <button className="bg-white text-[#acd1e6] px-2.5 py-1 rounded-md font-medium text-xs transition-all duration-200 hover:bg-white/50 hover:backdrop-blur-sm hover:text-[#d4e8f0] flex flex-col items-center leading-tight gap-1 relative overflow-hidden group mb-1">
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-40 transition-opacity duration-200"></span>
              <span className="pb-1 border-b-2 border-[#acd1e6] group-hover:border-[#d4e8f0] transition-colors duration-200 relative z-10">マップで絞り込み検索</span>
              <span className="text-[10px] font-normal relative z-10">Map search</span>
            </button>
            <button className="bg-white text-[#acd1e6] px-2.5 py-1 rounded-md font-medium text-xs transition-all duration-200 hover:bg-white/50 hover:backdrop-blur-sm hover:text-[#d4e8f0] flex flex-col items-center leading-tight gap-1 relative overflow-hidden group mb-1">
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-40 transition-opacity duration-200"></span>
              <span className="pb-1 border-b-2 border-[#acd1e6] group-hover:border-[#d4e8f0] transition-colors duration-200 relative z-10">リストで絞り込み検索</span>
              <span className="text-[10px] font-normal relative z-10">List search</span>
            </button>
            <button className="bg-[#acd1e6] text-white px-3 py-1.5 rounded-md font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 relative overflow-hidden group mb-2">
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200"></span>
              <span className="relative z-10">業種から探す</span>
              <span className="flex items-center justify-center w-4 h-4 bg-white rounded-full relative z-10" style={{ transform: 'translateY(0px)' }}>
                <span className="text-[#acd1e6] font-bold text-xl leading-none" style={{ transform: 'translate(0.5px, -2px)' }}>›</span>
              </span>
            </button>
          </nav>
        )}
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
            <div className="flex items-center gap-4">
              <Image
                src="/mrr/default/logo_header.png"
                alt="メディカルクチコミランキング"
                width={180}
                height={40}
                className="h-10 md:hidden"
              />
              <Image
                src="/mrr/default/logo_header.png"
                alt="メディカルクチコミランキング"
                width={280}
                height={64}
                className="h-16 hidden md:block"
              />
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

            {!isDetailPage && (
              <nav className="hidden md:flex gap-4 items-end">
                <button className="bg-white text-[#acd1e6] px-2.5 py-1 rounded-md font-medium text-xs transition-all duration-200 hover:bg-white/50 hover:backdrop-blur-sm hover:text-[#d4e8f0] flex flex-col items-center leading-tight gap-1 relative overflow-hidden group mb-1">
                  <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-40 transition-opacity duration-200"></span>
                  <span className="pb-1 border-b-2 border-[#acd1e6] group-hover:border-[#d4e8f0] transition-colors duration-200 relative z-10">マップで絞り込み検索</span>
                  <span className="text-[10px] font-normal relative z-10">Map search</span>
                </button>
                <button className="bg-white text-[#acd1e6] px-2.5 py-1 rounded-md font-medium text-xs transition-all duration-200 hover:bg-white/50 hover:backdrop-blur-sm hover:text-[#d4e8f0] flex flex-col items-center leading-tight gap-1 relative overflow-hidden group mb-1">
                  <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-40 transition-opacity duration-200"></span>
                  <span className="pb-1 border-b-2 border-[#acd1e6] group-hover:border-[#d4e8f0] transition-colors duration-200 relative z-10">リストで絞り込み検索</span>
                  <span className="text-[10px] font-normal relative z-10">List search</span>
                </button>
                <button className="bg-[#acd1e6] text-white px-3 py-1.5 rounded-md font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 relative overflow-hidden group mb-2">
                  <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200"></span>
                  <span className="relative z-10">業種から探す</span>
                  <span className="flex items-center justify-center w-4 h-4 bg-white rounded-full relative z-10" style={{ transform: 'translateY(0px)' }}>
                    <span className="text-[#acd1e6] font-bold text-xl leading-none" style={{ transform: 'translate(0.5px, -2px)' }}>›</span>
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