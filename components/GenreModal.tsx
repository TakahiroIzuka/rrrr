'use client'

import Link from 'next/link'

interface Genre {
  id: number
  name: string
  code: string
}

interface GenreModalProps {
  isOpen: boolean
  onClose: () => void
  genres: Genre[]
}

export default function GenreModal({ isOpen, onClose, genres }: GenreModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-[2000] flex items-start justify-center p-4 pt-16"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button (X) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded w-8 h-8 flex items-center justify-center transition-opacity hover:opacity-80 z-10"
          style={{ backgroundColor: 'rgb(227, 224, 215)', color: 'rgb(102, 102, 102)' }}
          aria-label="Close modal"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title Section */}
        <div className="px-6 py-6">
          <h2 className="font-semibold whitespace-nowrap" style={{ color: 'rgb(165, 153, 126)' }}>
            <span className="text-4xl">SELECT GENRE.</span> <span className="text-xl">ジャンルから探す</span>
          </h2>
        </div>

        {/* Genre List Section */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-3 gap-3">
            {genres.map((genre) => (
              <Link
                key={genre.id}
                href={`/clinic/genres/${genre.id}`}
                className="block w-full px-4 py-3 border rounded-lg transition-colors hover:bg-gray-50"
                style={{
                  borderColor: 'rgb(165, 153, 126)',
                  color: 'rgb(165, 153, 126)'
                }}
                onClick={onClose}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="font-semibold text-lg leading-none">{genre.name}</span>
                  <span className="flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0 relative" style={{ backgroundColor: 'rgb(165, 153, 126)' }}>
                    <span className="text-white font-bold absolute" style={{ fontSize: '22px', top: '50%', left: '50%', transform: 'translate(-50%, -54%)' }}>›</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Close Button Section */}
        <div className="px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-white rounded-lg font-medium transition-colors hover:bg-gray-50"
            style={{
              border: '2.5px solid rgb(165, 153, 126)',
              color: 'rgb(165, 153, 126)'
            }}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}
