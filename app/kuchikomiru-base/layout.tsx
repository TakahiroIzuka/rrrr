import MarqueeText from '@/components/MarqueeText'

export default function KuchikomiruBaseLayout({
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
