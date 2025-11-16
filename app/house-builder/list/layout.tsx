'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'

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
        pageType="list"
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
