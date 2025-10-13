import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MarqueeText from '@/components/MarqueeText'

export default function KuchikomiruLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header
        imagePath="/kuchikomiru/default/logo_header.png"
        lineColor="rgb(236, 106, 82)"
        color="rgb(236, 106, 82)"
      />
      <MarqueeText />
      {children}
      <Footer
        imagePath="/kuchikomiru/default/logo_footer.png"
        buttonText="地域密着店舗・施設の掲載リクエストはこちら"
        type="accomodation"
      />
    </>
  )
}
