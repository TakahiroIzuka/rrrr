'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import { SERVICE_CODE } from '../constants'

export default function ListLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isListPage = pathname === `/${SERVICE_CODE}/list`

  if (!isListPage) {
    return <>{children}</>
  }

  return (
    <>
      <Header
        pageType="list"
      />
      <Breadcrumb
        items={[
          { label: 'トップ', href: `/${SERVICE_CODE}` },
          { label: 'クリニックはこちら' }
        ]}
      />
      {children}
      <Footer pageType="list" />
    </>
  )
}
