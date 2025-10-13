import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MarqueeText from '@/components/MarqueeText'

export default function ClinicListLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header
        imagePath="/mrr/default/logo_header.png"
        lineColor="#a69a7e"
        color="#acd1e6"
      />
      <MarqueeText />
      {children}
      <Footer
        imagePath="/mrr/default/logo_footer.png"
        buttonText="クリニック・施設の掲載リクエストはこちら"
        type="clinic"
      />
    </>
  )
}
