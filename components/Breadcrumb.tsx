interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="clinic-list-breadcrumb hidden md:block py-1" style={{ backgroundColor: '#fff9f0' }}>
      <div className="mx-[30px]">
        <nav className="text-[12px]">
          <ol className="flex items-center gap-2">
            {items.map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                {item.href ? (
                  <a href={item.href} className="text-black hover:underline transition-colors">
                    {item.label}
                  </a>
                ) : (
                  <span className="text-black">{item.label}</span>
                )}
                {index < items.length - 1 && (
                  <span className="text-black">&gt;</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  )
}
