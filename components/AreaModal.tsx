'use client'

import { useServiceName } from '@/contexts/ServiceContext'

interface AreaModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AreaModal({ isOpen, onClose }: AreaModalProps) {
  const serviceName = useServiceName()

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-[2000] flex items-start md:items-start justify-center p-4 md:pt-16"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] md:max-h-[80vh] overflow-y-auto relative mt-16 md:mt-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button (X) */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 md:top-4 md:right-4 rounded w-8 h-8 flex items-center justify-center transition-opacity hover:opacity-80 z-10"
          style={{ backgroundColor: 'rgb(227, 224, 215)', color: 'rgb(102, 102, 102)' }}
          aria-label="Close modal"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title Section */}
        <div className="px-4 py-4 md:px-6 md:py-6">
          <h2 className="font-semibold" style={{ color: 'rgb(165, 153, 126)' }}>
            <span className="text-2xl md:text-4xl block md:inline">SELECT AREA.</span>
            <span className="text-base md:text-xl block md:inline md:ml-2 mt-1 md:mt-0">各エリアから{serviceName}を探す</span>
          </h2>
        </div>

        {/* Area List Section - 未実装 */}
        <div className="px-4 py-3 md:px-6 md:py-4">
          <p className="text-gray-500 text-center py-8">エリア一覧は準備中です</p>
        </div>

        {/* Close Button Section */}
        <div className="px-4 py-3 md:px-6 md:py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 md:py-3 bg-white rounded-lg font-medium transition-colors hover:bg-gray-50 text-sm md:text-base"
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
