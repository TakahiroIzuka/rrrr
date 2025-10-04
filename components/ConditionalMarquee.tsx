'use client'

import { usePathname } from 'next/navigation'
import MarqueeText from './MarqueeText'

export default function ConditionalMarquee() {
  const pathname = usePathname()

  // /clinic の場合のみ MarqueeText を表示
  if (pathname === '/clinic') {
    return (
      <div className="hidden md:block">
        <MarqueeText />
      </div>
    )
  }

  return null
}
