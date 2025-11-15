'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MarqueeText from '@/components/MarqueeText'
import { SERVICE_CODES } from '@/lib/constants/services'
import { ServiceCodeProvider } from '@/contexts/ServiceCodeContext'

export default function KuchikomiruLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isKuchikomiruTopPage = pathname === '/kuchikomiru'

  return (
    <ServiceCodeProvider serviceCode={SERVICE_CODES.KUCHIKOMIRU}>
      {isKuchikomiruTopPage && (
        <>
          <Header
            imagePath="/kuchikomiru/default/logo_header.png"
            lineColor="rgb(236, 106, 82)"
            color="rgb(236, 106, 82)"
            serviceName="クチコミル"
          />
          <div className="mt-16 md:mt-0">
            <MarqueeText />
          </div>
        </>
      )}
      {children}
      {isKuchikomiruTopPage && (
        <Footer />
      )}
    </ServiceCodeProvider>
  )
}
