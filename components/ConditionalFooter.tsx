'use client'

import { usePathname } from 'next/navigation'
import Footer from './Footer'
import GenreFooter from './GenreFooter'
import { useEffect, useState } from 'react'

export default function ConditionalFooter() {
  const pathname = usePathname()
  const [genreId, setGenreId] = useState<number | null>(null)

  // 業種別ページかどうかを判定
  const isGenrePage = pathname?.match(/^\/clinic\/genres\/(\d+)$/)

  useEffect(() => {
    if (isGenrePage) {
      const id = parseInt(isGenrePage[1])
      setGenreId(id)
    } else {
      setGenreId(null)
    }
  }, [pathname, isGenrePage])

  if (isGenrePage && genreId !== null) {
    return <GenreFooter genreId={genreId} />
  }

  return <Footer />
}
