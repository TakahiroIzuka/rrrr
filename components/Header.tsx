'use client'

export default function Header() {
  return (
    <header className="bg-white text-gray-700 px-8 py-8 shadow-md relative z-[1000] border-b border-gray-200">
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
          <h1 className="m-0 text-2xl font-bold text-gray-700" style={{ fontFamily: "'Kosugi Maru', sans-serif" }}>
            🏥 メディカルクチコミランキング
          </h1>
        </div>

        <nav className="flex gap-8 items-center">
          <a
            href="/"
            className="text-gray-600 no-underline text-sm font-medium transition-colors duration-200 hover:text-gray-700"
          >
            ホーム
          </a>
          <a
            href="/clinics"
            className="text-gray-600 no-underline text-sm font-medium transition-colors duration-200 hover:text-gray-700"
          >
            クリニック一覧
          </a>
        </nav>
      </div>
    </header>
  )
}