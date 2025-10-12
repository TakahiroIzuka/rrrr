'use client'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  logoPath: string
  genreCode?: string
  onMapClick?: () => void
  onListClick?: () => void
  onGenreClick?: () => void
}

export default function MobileMenu({
  isOpen,
  onClose,
  logoPath,
  genreCode,
  onMapClick,
  onListClick,
  onGenreClick
}: MobileMenuProps) {
  const menuColor = 'rgb(163, 151, 125)'

  return (
    <>
      {/* ヘッダー以外のオーバーレイ */}
      <div
        className={`fixed transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{
          backgroundColor: 'rgba(234, 227, 219, 0.8)',
          zIndex: 9000,
          top: '64px',
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: isOpen ? 'auto' : 'none'
        }}
        onClick={onClose}
      />
      {/* モーダル */}
      <div
        className={`fixed bg-white rounded-lg flex flex-col items-center justify-center gap-4 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          zIndex: 9001,
          top: '50%',
          left: '50%',
          transform: isOpen ? 'translate(-50%, -50%)' : 'translate(calc(100vw - 50%), -50%)',
          width: '350px',
          height: '350px',
          padding: '10px',
          pointerEvents: 'auto',
          transition: 'transform 300ms ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Logo */}
        <div className="w-full mb-3">
          <img src={logoPath} alt="Logo" className="w-full h-auto" />
        </div>

        {/* Map and List Search Buttons (Horizontal) */}
        <div className="flex gap-0.5 w-full">
          <button
            onClick={() => {
              onMapClick?.()
              onClose()
            }}
            className="flex-1 bg-white px-3 py-2 rounded-md font-semibold transition-all duration-200 hover:bg-gray-50 flex flex-col items-center leading-tight gap-1"
            style={{ color: menuColor, fontSize: '13px' }}
          >
            <span className="pb-1" style={{ borderBottom: '2.5px solid', borderColor: menuColor }}>
              マップで絞り込み検索
            </span>
            <span className="text-[10px] font-normal">Map search</span>
          </button>
          <button
            onClick={() => {
              onListClick?.()
              onClose()
            }}
            className="flex-1 bg-white px-3 py-2 rounded-md font-semibold transition-all duration-200 hover:bg-gray-50 flex flex-col items-center leading-tight gap-1"
            style={{ color: menuColor, fontSize: '13px' }}
          >
            <span className="pb-1" style={{ borderBottom: '2.5px solid', borderColor: menuColor }}>
              リストで絞り込み検索
            </span>
            <span className="text-[10px] font-normal">List search</span>
          </button>
        </div>

        {/* Genre Search Button */}
        <button
          onClick={() => {
            onGenreClick?.()
            onClose()
          }}
          className="w-full px-4 py-3 border-2 rounded-lg bg-white transition-colors hover:bg-gray-50 flex items-center justify-center gap-2"
          style={{ borderColor: menuColor, color: menuColor, fontSize: '14px', fontWeight: 500 }}
        >
          <span>業種から探す</span>
          <span className="flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0 relative" style={{ backgroundColor: menuColor }}>
            <span className="text-white font-bold absolute" style={{ fontSize: '22px', top: '50%', left: '50%', transform: 'translate(-50%, -54%)' }}>›</span>
          </span>
        </button>

        {/* Clinic Request Button */}
        <button
          className="w-full px-4 py-3 border-2 rounded-lg transition-colors hover:bg-gray-50 flex items-center justify-center gap-2"
          style={{ borderColor: menuColor, color: menuColor, fontSize: '13px', fontWeight: 500 }}
        >
          <span>クリニックの掲載リクエストはこちら</span>
          <span className="flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0 relative" style={{ backgroundColor: menuColor }}>
            <span className="text-white font-bold absolute" style={{ fontSize: '22px', top: '50%', left: '50%', transform: 'translate(-50%, -54%)' }}>›</span>
          </span>
        </button>
      </div>
    </>
  )
}
