interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="clinic-list-breadcrumb py-1" style={{ backgroundColor: 'rgb(166, 154, 126)' }}>
      <div className="mx-3 md:mx-[30px]">
        <nav className="text-[10px] md:text-[12px]">
          <ol className="flex flex-wrap items-center gap-1 md:gap-2">
            {items.map((item, index) => (
              <li key={index} className="flex items-center gap-1 md:gap-2">
                {item.href ? (
                  <a href={item.href} className="text-white hover:underline transition-colors">
                    {item.label}
                  </a>
                ) : (
                  <span className="text-white">{item.label}</span>
                )}
                {index < items.length - 1 && (
                  <span className="text-white">&gt;</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  )
}
