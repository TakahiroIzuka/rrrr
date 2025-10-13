'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MarqueeText from '@/components/MarqueeText'

export default function ClinicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isClinicTopPage = pathname === '/clinic'

  return (
    <>
      {isClinicTopPage && (
        <>
          <Header
            imagePath="/mrr/default/logo_header.png"
            lineColor="#a69a7e"
            color="#acd1e6"
          />
          <div className="mt-16 md:mt-0">
            <MarqueeText />
          </div>
        </>
      )}
      {children}
      {isClinicTopPage && (
        <Footer
          imagePath="/mrr/default/logo_footer.png"
          buttonText="クリニック・施設の掲載リクエストはこちら"
          type="clinic"
        />
      )}
    </>
  )
}
