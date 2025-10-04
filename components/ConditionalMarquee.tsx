'use client'

import { usePathname } from 'next/navigation'
import MarqueeText from './MarqueeText'

export default function ConditionalMarquee() {
  const pathname = usePathname()

  // /clinic/list では MarqueeText を表示しない
  if (pathname === '/clinic/list') {
    return null
  }

  return (
    <div className="hidden md:block">
      <MarqueeText />
    </div>
  )
}
