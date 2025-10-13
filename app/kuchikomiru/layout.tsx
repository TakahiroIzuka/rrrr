import MarqueeText from '@/components/MarqueeText'

export default function KuchikomiruLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <MarqueeText />
      {children}
    </>
  )
}
