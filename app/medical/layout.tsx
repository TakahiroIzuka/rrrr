'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MarqueeText from '@/components/MarqueeText'
import { SERVICE_CODES } from '@/lib/constants/services'
import { ServiceCodeProvider } from '@/contexts/ServiceCodeContext'

export default function ClinicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isClinicTopPage = pathname === '/medical'

  return (
    <ServiceCodeProvider serviceCode={SERVICE_CODES.MEDICAL}>
      {isClinicTopPage && (
        <>
          <Header
            imagePath="/medical/default/logo_header.png"
            lineColor="#a69a7e"
            color="#acd1e6"
            serviceName="メディカル"
          />
          <div className="mt-16 md:mt-0">
            <MarqueeText />
          </div>
        </>
      )}
      {children}
      {isClinicTopPage && (
        <Footer />
      )}
    </ServiceCodeProvider>
  )
}
