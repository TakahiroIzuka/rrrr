'use client'

import { usePathname } from 'next/navigation'
import Footer from './Footer'
import GenreFooter from './GenreFooter'
import { useEffect, useState } from 'react'

export default function ConditionalFooter() {
  const pathname = usePathname()
  const [genreData, setGenreData] = useState<{ id: number; code: string } | null>(null)

  // 業種別ページかどうかを判定
  const isGenrePage = pathname?.match(/^\/clinic\/genres\/(\d+)$/)

  useEffect(() => {
    if (isGenrePage) {
      const id = parseInt(isGenrePage[1])
      // Fetch genre data to get the code
      fetch(`http://127.0.0.1:54321/rest/v1/genres?id=eq.${id}`, {
        headers: {
          'apikey': 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            setGenreData({ id: data[0].id, code: data[0].code })
          }
        })
        .catch(err => console.error('Failed to fetch genre data:', err))
    } else {
      setGenreData(null)
    }
  }, [pathname, isGenrePage])

  if (isGenrePage && genreData) {
    return <GenreFooter genreId={genreData.id} genreCode={genreData.code} />
  }

  return <Footer />
}
