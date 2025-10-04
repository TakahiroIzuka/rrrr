'use client'

export default function Header() {
  return (
    <header className="bg-white text-gray-700 h-24 relative z-[1000] border-gray-200" style={{ borderTop: '5px solid #a3977d' }}>
      <div className="flex justify-between items-center h-full px-8">
        <div className="flex items-center gap-4">
          <img
            src="/mrr/logo_header.png"
            alt="メディカルクチコミランキング"
            className="h-16"
          />
        </div>

        <nav className="flex gap-4 items-end">
          <button className="bg-white text-[#acd1e6] px-2.5 py-1 rounded-md font-medium text-xs transition-all duration-200 hover:bg-white/50 hover:backdrop-blur-sm hover:text-[#d4e8f0] flex flex-col items-center leading-tight gap-1 relative overflow-hidden group mb-1">
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-40 transition-opacity duration-200"></span>
            <span className="pb-1 border-b-2 border-[#acd1e6] group-hover:border-[#d4e8f0] transition-colors duration-200 relative z-10">マップで絞り込み検索</span>
            <span className="text-[10px] font-normal relative z-10">Map search</span>
          </button>
          <button className="bg-white text-[#acd1e6] px-2.5 py-1 rounded-md font-medium text-xs transition-all duration-200 hover:bg-white/50 hover:backdrop-blur-sm hover:text-[#d4e8f0] flex flex-col items-center leading-tight gap-1 relative overflow-hidden group mb-1">
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-40 transition-opacity duration-200"></span>
            <span className="pb-1 border-b-2 border-[#acd1e6] group-hover:border-[#d4e8f0] transition-colors duration-200 relative z-10">リストで絞り込み検索</span>
            <span className="text-[10px] font-normal relative z-10">List search</span>
          </button>
          <button className="bg-[#acd1e6] text-white px-3 py-1.5 rounded-md font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 relative overflow-hidden group mb-2">
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200"></span>
            <span className="relative z-10">業種から探す</span>
            <span className="flex items-center justify-center w-4 h-4 bg-white rounded-full relative z-10" style={{ transform: 'translateY(0px)' }}>
              <span className="text-[#acd1e6] font-bold text-xl leading-none" style={{ transform: 'translate(0.5px, -2px)' }}>›</span>
            </span>
          </button>
        </nav>
      </div>
    </header>
  )
}