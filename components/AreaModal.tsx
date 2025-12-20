'use client'

import Link from 'next/link'
import { useServiceCode, useServiceName } from '@/contexts/ServiceContext'

interface Prefecture {
  id: number
  name: string
}

interface Area {
  id: number
  name: string
  prefecture_id: number
}

interface AreasGrouped {
  prefecture: Prefecture
  areas: Area[]
}

interface AreaModalProps {
  isOpen: boolean
  onClose: () => void
  areasGrouped: AreasGrouped[]
}

export default function AreaModal({ isOpen, onClose, areasGrouped }: AreaModalProps) {
  const serviceCode = useServiceCode()
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

        {/* Area List Section */}
        <div className="px-4 py-3 md:px-6 md:py-4">
          {areasGrouped.length === 0 ? (
            <p className="text-gray-500 text-center py-8">該当するエリアがありません</p>
          ) : (
            <div className="space-y-6">
              {areasGrouped.map((group) => (
                <div key={group.prefecture.id}>
                  {/* Prefecture Header */}
                  <div className="relative mb-5">
                    <Link
                      href={`/${serviceCode}/prefectures/${group.prefecture.id}`}
                      className="w-full px-4 py-2 md:py-2.5 bg-white rounded-lg font-medium transition-colors hover:bg-gray-50 text-sm md:text-base flex items-center justify-center gap-2"
                      style={{
                        border: '2.5px solid rgb(165, 153, 126)',
                        color: 'rgb(165, 153, 126)'
                      }}
                      onClick={onClose}
                    >
                      {group.prefecture.name}
                      <span
                        className="flex items-center justify-center w-5 h-5 rounded-full"
                        style={{ backgroundColor: 'rgb(165, 153, 126)' }}
                      >
                        <span className="font-bold text-xl leading-none text-white" style={{ transform: 'translate(0.5px, -2px)' }}>›</span>
                      </span>
                    </Link>
                    {/* 下向き三角形 */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-0 h-0 border-l-[14px] border-r-[14px] border-t-[14px] border-l-transparent border-r-transparent"
                      style={{ borderTopColor: 'rgb(165, 153, 126)' }}
                    ></div>
                  </div>

                  {/* Areas Grid */}
                  {group.areas.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 px-4">
                      {group.areas.map((area) => (
                        <Link
                          key={area.id}
                          href={`/${serviceCode}/prefectures/${group.prefecture.id}/areas/${area.id}`}
                          className="px-2 py-1.5 border rounded-lg transition-colors hover:bg-gray-50 flex items-center justify-center gap-1"
                          style={{
                            borderColor: 'rgb(165, 153, 126)',
                            color: 'rgb(165, 153, 126)'
                          }}
                          onClick={onClose}
                        >
                          <span className="font-medium text-sm">{area.name}</span>
                          <span
                            className="flex items-center justify-center w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: 'rgb(165, 153, 126)' }}
                          >
                            <span className="font-bold text-base leading-none text-white" style={{ transform: 'translate(0.5px, -1.5px)' }}>›</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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
