'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MarqueeText from '@/components/MarqueeText'
import { ServiceProvider } from '@/contexts/ServiceContext'
import type { ServiceCode } from '@/lib/constants/services'

interface MedicalClientLayoutProps {
  service: {
    code: string
    name: string
  }
  children: React.ReactNode
}

export default function MedicalClientLayout({ service, children }: MedicalClientLayoutProps) {
  const pathname = usePathname()
  const isClinicTopPage = pathname === '/medical'

  return (
    <ServiceProvider serviceCode={service.code as ServiceCode} serviceName={service.name}>
      {isClinicTopPage && (
        <>
          <Header />
          <div className="mt-16 md:mt-0">
            <MarqueeText />
          </div>
        </>
      )}
      {children}
      {isClinicTopPage && (
        <Footer />
      )}
    </ServiceProvider>
  )
}
