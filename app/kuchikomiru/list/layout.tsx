'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'

export default function KuchikomiruListLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isKuchikomiruListPage = pathname === '/kuchikomiru/list'

  if (!isKuchikomiruListPage) {
    return <>{children}</>
  }

  return (
    <>
      <Header
        imagePath="/kuchikomiru/default/logo_header.png"
        lineColor="rgb(236, 106, 82)"
        color="rgb(236, 106, 82)"
      />
      <Breadcrumb
        items={[
          { label: 'トップ', href: '/kuchikomiru' },
          { label: '施設はこちら' }
        ]}
      />
      {children}
      <Footer
        imagePath="/kuchikomiru/default/logo_footer.png"
        buttonText="地域密着店舗・施設の掲載リクエストはこちら"
        serviceName="Mr.Review Ranking."
      />
    </>
  )
}
