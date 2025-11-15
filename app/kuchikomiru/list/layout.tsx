'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import { SERVICE_CODES } from '@/lib/constants/services'

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
        headerImagePath="/kuchikomiru/default/logo_header.png"
        lineColor="rgb(236, 106, 82)"
        color="rgb(236, 106, 82)"
        pageType="list"
        serviceName="クチコミル"
      />
      <Breadcrumb
        items={[
          { label: 'トップ', href: '/kuchikomiru' },
          { label: '施設はこちら' }
        ]}
      />
      {children}
      <Footer pageType="list" />
    </>
  )
}
