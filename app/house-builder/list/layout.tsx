'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import { SERVICE_CODES } from '@/lib/constants/services'

export default function HouseBuilderListLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isHouseBuilderListPage = pathname === '/house-builder/list'

  if (!isHouseBuilderListPage) {
    return <>{children}</>
  }

  return (
    <>
      <Header
        headerImagePath="/house-builder/default/logo_header.png"
        pageType="list"
        serviceName="住宅会社"
      />
      <Breadcrumb
        items={[
          { label: 'トップ', href: '/house-builder' },
          { label: '施設はこちら' }
        ]}
      />
      {children}
      <Footer pageType="list" />
    </>
  )
}
