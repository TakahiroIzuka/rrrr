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
        imagePath="/house-builder/default/logo_header.png"
        lineColor="rgb(248, 176, 66)"
        color="rgb(248, 176, 66)"
      />
      <Breadcrumb
        items={[
          { label: 'トップ', href: '/house-builder' },
          { label: '施設はこちら' }
        ]}
      />
      {children}
      <Footer
        imagePath="/house-builder/default/logo_footer.png"
        buttonText="住宅会社の掲載リクエストはこちら"
        serviceName="House Builder Review Ranking."
      />
    </>
  )
}
