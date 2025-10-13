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
  const isClinicListPage = pathname === '/clinics'

  if (!isClinicListPage) {
    return <>{children}</>
  }

  return (
    <>
      <Header
        imagePath="/mrr/default/logo_header.png"
        lineColor="#a69a7e"
        color="#acd1e6"
      />
      <Breadcrumb
        items={[
          { label: 'トップ', href: '/clinic' },
          { label: 'クリニックはこちら' }
        ]}
      />
      {children}
      <Footer
        imagePath="/mrr/default/logo_footer.png"
        buttonText="クリニック・施設の掲載リクエストはこちら"
        type="clinic"
      />
    </>
  )
}
