'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MarqueeText from '@/components/MarqueeText'
import { SERVICE_CODES } from '@/lib/constants/services'

export default function KuchikomiruLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isKuchikomiruTopPage = pathname === '/kuchikomiru'

  return (
    <>
      {isKuchikomiruTopPage && (
        <>
          <Header
            imagePath="/kuchikomiru/default/logo_header.png"
            lineColor="rgb(236, 106, 82)"
            color="rgb(236, 106, 82)"
            serviceCode="kuchikomiru"
            serviceName="クチコミル"
          />
          <div className="mt-16 md:mt-0">
            <MarqueeText />
          </div>
        </>
      )}
      {children}
      {isKuchikomiruTopPage && (
        <Footer serviceCode={SERVICE_CODES.KUCHIKOMIRU} />
      )}
    </>
  )
}
