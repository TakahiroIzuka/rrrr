'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'

export default function ClinicListLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isClinicListPage = pathname === '/medical/list'

  if (!isClinicListPage) {
    return <>{children}</>
  }

  return (
    <>
      <Header
        imagePath="/medical/default/logo_header.png"
        lineColor="#a69a7e"
        color="#acd1e6"
      />
      <Breadcrumb
        items={[
          { label: 'トップ', href: '/medical' },
          { label: 'クリニックはこちら' }
        ]}
      />
      {children}
      <Footer
        imagePath="/medical/default/logo_footer.png"
        buttonText="クリニック・施設の掲載リクエストはこちら"
        type="clinic"
      />
    </>
  )
}
