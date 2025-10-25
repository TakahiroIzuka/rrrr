'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  {
    label: '会社一覧',
    href: '/management/companies',
  },
  {
    label: 'ユーザー一覧',
    href: '/management/users',
  },
  {
    label: '施設一覧',
    href: '/management/facilities',
  },
  {
    label: 'クチコミ一覧',
    href: '/management/reviews',
  },
  {
    label: 'マスタ管理',
    href: '/management/masters',
  }
]

export default function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-64 bg-[#1e1e1e] text-white min-h-screen fixed left-0 top-0 border-r border-[#2d2d2d]">
      <div className="p-5">
        <h1 className="text-xl font-semibold mb-8 px-3 text-gray-200">管理画面</h1>
        <nav>
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block px-4 py-2.5 text-sm transition-colors rounded ${
                    isActive(item.href)
                      ? 'bg-[#2271b1] text-white font-medium'
                      : 'text-gray-300 hover:bg-[#2d2d2d] hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  )
}
