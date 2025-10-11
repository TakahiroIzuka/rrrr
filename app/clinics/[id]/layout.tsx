export default function ClinicDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: '.clinic-list-breadcrumb { display: none !important; }'
      }} />
      {children}
    </>
  )
}
