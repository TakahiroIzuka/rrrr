'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MarqueeText from '@/components/MarqueeText'
import { ServiceProvider } from '@/contexts/ServiceContext'
import { SERVICE_CODE } from './constants'

interface KuchikomiruClientLayoutProps {
  serviceName: string
  children: React.ReactNode
}

export default function KuchikomiruClientLayout({ serviceName, children }: KuchikomiruClientLayoutProps) {
  const pathname = usePathname()
  const isTopPage = pathname === `/${SERVICE_CODE}`

  return (
    <ServiceProvider serviceCode={SERVICE_CODE} serviceName={serviceName}>
      {isTopPage && (
        <>
          <Header />
          <div className="mt-16 md:mt-0">
            <MarqueeText />
          </div>
        </>
      )}
      {children}
      {isTopPage && (
        <Footer />
      )}
    </ServiceProvider>
  )
}
