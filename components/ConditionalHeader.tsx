'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'

export default function ConditionalHeader() {
  const pathname = usePathname()

  // /clinics/[id] or /clinic/genres/[id] の場合は Header を非表示
  if (pathname?.startsWith('/clinics/') || pathname?.match(/^\/clinic\/genres\/\d+$/)) {
    return null
  }

  return <Header />
}
