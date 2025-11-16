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
        pageType="list"
      />
      <Breadcrumb
        items={[
          { label: 'トップ', href: '/medical' },
          { label: 'クリニックはこちら' }
        ]}
      />
      {children}
      <Footer pageType="list" />
    </>
  )
}
