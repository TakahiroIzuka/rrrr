'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import { SERVICE_CODES } from '@/lib/constants/services'

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
        serviceCode="medical"
        pageType="list"
        serviceName="メディカル"
      />
      <Breadcrumb
        items={[
          { label: 'トップ', href: '/medical' },
          { label: 'クリニックはこちら' }
        ]}
      />
      {children}
      <Footer serviceCode={SERVICE_CODES.MEDICAL} />
    </>
  )
}
