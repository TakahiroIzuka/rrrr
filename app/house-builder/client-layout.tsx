'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MarqueeText from '@/components/MarqueeText'
import { ServiceProvider } from '@/contexts/ServiceContext'
import type { ServiceCode } from '@/lib/constants/services'

interface HouseBuilderClientLayoutProps {
  service: {
    code: string
    name: string
  }
  children: React.ReactNode
}

export default function HouseBuilderClientLayout({ service, children }: HouseBuilderClientLayoutProps) {
  const pathname = usePathname()
  const isHouseBuilderTopPage = pathname === '/house-builder'

  return (
    <ServiceProvider serviceCode={service.code as ServiceCode} serviceName={service.name}>
      {isHouseBuilderTopPage && (
        <>
          <Header />
          <div className="mt-16 md:mt-0">
            <MarqueeText />
          </div>
        </>
      )}
      {children}
      {isHouseBuilderTopPage && (
        <Footer />
      )}
    </ServiceProvider>
  )
}
