'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MarqueeText from '@/components/MarqueeText'
import { ServiceProvider } from '@/contexts/ServiceContext'
import type { ServiceCode } from '@/lib/constants/services'

interface KuchikomiruClientLayoutProps {
  service: {
    code: string
    name: string
  }
  children: React.ReactNode
}

export default function KuchikomiruClientLayout({ service, children }: KuchikomiruClientLayoutProps) {
  const pathname = usePathname()
  const isKuchikomiruTopPage = pathname === '/kuchikomiru'

  return (
    <ServiceProvider serviceCode={service.code as ServiceCode} serviceName={service.name}>
      {isKuchikomiruTopPage && (
        <>
          <Header />
          <div className="mt-16 md:mt-0">
            <MarqueeText />
          </div>
        </>
      )}
      {children}
      {isKuchikomiruTopPage && (
        <Footer />
      )}
    </ServiceProvider>
  )
}
