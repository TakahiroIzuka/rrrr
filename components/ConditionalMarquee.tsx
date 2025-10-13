'use client'

import { usePathname } from 'next/navigation'
import MarqueeText from './MarqueeText'

export default function ConditionalMarquee() {
  const pathname = usePathname()

  // /clinic の場合のみ MarqueeText を表示
  // /kuchikomiru-base は個別のlayoutで表示するため除外
  if (pathname === '/clinic') {
    return <MarqueeText />
  }

  return null
}
