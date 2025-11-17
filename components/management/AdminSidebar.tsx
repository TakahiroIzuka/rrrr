'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface AdminSidebarProps {
  currentUserType: 'admin' | 'user'
}

const getMenuItems = (userType: 'admin' | 'user') => [
  {
    label: userType === 'user' ? '会社管理' : '会社一覧',
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
]

const masterItems = [
  {
    label: 'サービス',
    href: '/management/masters/services',
  },
  {
    label: 'ジャンル',
    href: '/management/masters/genres',
  },
  {
    label: '都道府県・地域',
    href: '/management/masters/regions',
  },
]

export default function AdminSidebar({ currentUserType }: AdminSidebarProps) {
  const pathname = usePathname()
  const [isMasterExpanded, setIsMasterExpanded] = useState(pathname.startsWith('/management/masters'))
  const menuItems = getMenuItems(currentUserType)

  const isActive = (href: string) => {
    return pathname.startsWith(href)
  }

  const isMasterActive = pathname.startsWith('/management/masters')

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

            {/* Master Management with Submenu (Admin only) */}
            {currentUserType === 'admin' && (
            <li>
              <button
                onClick={() => setIsMasterExpanded(!isMasterExpanded)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors rounded ${
                  isMasterActive
                    ? 'bg-[#2271b1] text-white font-medium'
                    : 'text-gray-300 hover:bg-[#2d2d2d] hover:text-white'
                }`}
              >
                <span>マスタ管理</span>
                <span className="text-xs">{isMasterExpanded ? '▼' : '▲'}</span>
              </button>

              {isMasterExpanded && (
                <ul className="mt-1 ml-4 space-y-1">
                  {masterItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`block px-4 py-2 text-sm transition-colors rounded ${
                          pathname === item.href
                            ? 'bg-[#135e96] text-white font-medium'
                            : 'text-gray-400 hover:bg-[#2d2d2d] hover:text-white'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
            )}
          </ul>
        </nav>
      </div>
    </aside>
  )
}
