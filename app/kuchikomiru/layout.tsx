'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MarqueeText from '@/components/MarqueeText'

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
          />
          <div className="mt-16 md:mt-0">
            <MarqueeText />
          </div>
        </>
      )}
      {children}
      {isKuchikomiruTopPage && (
        <Footer
          imagePath="/kuchikomiru/default/logo_footer.png"
          buttonText="地域密着店舗・施設の掲載リクエストはこちら"
          serviceName="Mr.Review Ranking."
        />
      )}
    </>
  )
}
