import MarqueeText from '@/components/MarqueeText'

export default function ClinicListLayout({
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
