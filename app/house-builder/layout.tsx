'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MarqueeText from '@/components/MarqueeText'
import { SERVICE_CODES } from '@/lib/constants/services'
import { ServiceCodeProvider } from '@/contexts/ServiceCodeContext'

export default function HouseBuilderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isHouseBuilderTopPage = pathname === '/house-builder'

  return (
    <ServiceCodeProvider serviceCode={SERVICE_CODES.HOUSE_BUILDER}>
      {isHouseBuilderTopPage && (
        <>
          <Header
            headerImagePath="/house-builder/default/logo_header.png"
            lineColor="rgb(248, 176, 66)"
            color="rgb(248, 176, 66)"
            serviceName="住宅会社"
          />
          <div className="mt-16 md:mt-0">
            <MarqueeText />
          </div>
        </>
      )}
      {children}
      {isHouseBuilderTopPage && (
        <Footer />
      )}
    </ServiceCodeProvider>
  )
}
