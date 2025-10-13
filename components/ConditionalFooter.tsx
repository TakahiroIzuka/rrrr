'use client'

import { usePathname } from 'next/navigation'
import Footer from './Footer'

export default function ConditionalFooter() {
  const pathname = usePathname()

  // パスに応じてスタイルを変更
  let imagePath = '/mrr/default/logo_footer.png'
  let buttonText = 'クリニック・施設の掲載リクエストはこちら'
  let type = 'clinic'

  // /kuchikomiru-base の場合
  if (pathname?.startsWith('/kuchikomiru-base')) {
    imagePath = '/kuchikomiru/default/logo_footer.png'
    buttonText = '地域密着店舗・施設の掲載リクエストはこちら'
    type = 'accomodation'
  }

  return <Footer imagePath={imagePath} buttonText={buttonText} type={type} />
}
