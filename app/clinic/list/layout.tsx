export default function ClinicListLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Breadcrumb in place of MarqueeText */}
      <div className="hidden md:block py-1" style={{ backgroundColor: '#fff9f0' }}>
        <div className="mx-[30px]">
          <nav className="text-[13px]">
            <ol className="flex items-center gap-2">
              <li>
                <a href="/clinic" className="text-black hover:underline transition-colors">トップ</a>
              </li>
              <li className="text-black">&gt;</li>
              <li className="text-black">クリニックはこちら</li>
            </ol>
          </nav>
        </div>
      </div>
      {children}
    </>
  )
}
