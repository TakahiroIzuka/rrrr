'use client'

import { usePathname } from 'next/navigation'
import MarqueeText from './MarqueeText'

export default function ConditionalMarquee() {
  const pathname = usePathname()

  // /medical の場合のみ MarqueeText を表示
  // /medical/genres/[id] は DetailHeader内で表示
  // /kuchikomiru-base, /clinic-base は個別のlayoutで表示するため除外
  if (pathname === '/medical') {
    return (
      <div className="mt-16 md:mt-0">
        <MarqueeText />
      </div>
    )
  }

  return null
}
