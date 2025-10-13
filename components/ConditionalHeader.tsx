'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'

export default function ConditionalHeader() {
  const pathname = usePathname()

  // /clinics/[id] or /clinic/genres/[id] の場合は Header を非表示
  if (pathname?.startsWith('/clinics/') || pathname?.match(/^\/clinic\/genres\/\d+$/)) {
    return null
  }

  // パスに応じてスタイルを変更
  let imagePath = '/mrr/default/logo_header.png'
  let lineColor = '#a69a7e'
  let color = '#acd1e6'

  // /kuchikomiru-base or /kuchikomiru の場合
  if (pathname?.startsWith('/kuchikomiru-base') || pathname?.startsWith('/kuchikomiru')) {
    imagePath = '/kuchikomiru/default/logo_header.png'
    lineColor = 'rgb(236, 106, 82)'
    color = 'rgb(236, 106, 82)'
  }

  return <Header imagePath={imagePath} lineColor={lineColor} color={color} />
}
