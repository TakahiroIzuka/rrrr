'use client'

import { usePathname } from 'next/navigation'
import MarqueeText from './MarqueeText'

export default function ConditionalMarquee() {
  const pathname = usePathname()

  // /clinic の場合のみ MarqueeText を表示
  // /clinic/genres/[id] は DetailHeader内で表示
  // /kuchikomiru-base, /clinic-base は個別のlayoutで表示するため除外
  if (pathname === '/clinic') {
    return (
      <div className="mt-16 md:mt-0">
        <MarqueeText />
      </div>
    )
  }

  return null
}
