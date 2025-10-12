import { notFound } from 'next/navigation'
import { getStarImage } from '@/lib/utils/starRating'
import Div2 from './Div2'
import ReviewCard from './ReviewCard'
import ScrollToReviewButton from './ScrollToReviewButton'
import { fetchClinicById } from '@/lib/data/clinics'

interface ClinicDetailPageProps {
  params: {
    id: string
  }
}

export default async function ClinicDetailPage({ params }: ClinicDetailPageProps) {
  const { clinic, error } = await fetchClinicById(params.id)

  if (error || !clinic) {
    notFound()
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="block py-1" style={{ backgroundColor: '#fff9f0' }}>
        <div className="mx-[30px]">
          <nav className="text-[12px]">
            <ol className="flex items-center gap-2">
              <li>
                <a href="/clinic" className="text-black hover:underline transition-colors">トップ</a>
              </li>
              <li className="text-black">&gt;</li>
              <li>
                <a href="/clinics" className="text-black hover:underline transition-colors">クリニック・施設一覧</a>
              </li>
              <li className="text-black">&gt;</li>
              <li className="text-black">{clinic.clinic_detail?.name}</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="mx-[10px] mb-[10px] pt-[10px] md:mx-20 md:pt-10 md:pb-24 md:mb-0">
        {/* コンテンツ */}
        <div className="bg-white rounded-xl shadow-lg p-[10px] md:p-[25px]">
          {/* div1 */}
          <div className="mb-2">
            <div className="flex flex-col md:flex-row gap-0 md:gap-4 pt-2 pb-0">
              {/* 左側 */}
              <div className="w-full md:w-[45%]">
                <h1 className="text-xl font-bold mb-3" style={{ fontFamily: 'Kosugi Maru, sans-serif' }}>{clinic.clinic_detail?.name}</h1>

                <div className="flex items-center mb-2 gap-1.5 pb-2 border-b border-[#a59878]">
                  <span className="text-gray-600 text-xs border border-gray-300 rounded px-2 py-0.5">
                    {clinic.prefecture?.name}
                  </span>
                  <span className="text-gray-600 text-xs border border-gray-300 rounded px-2 py-0.5">
                    {clinic.area?.name}
                  </span>
                </div>

                <div className="mb-0 md:mb-3 pb-2 border-b border-[#a59878]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <img
                      src="/common/ranking-icon.png"
                      alt="ランキング"
                      className="w-[18px] h-[18px]"
                    />
                    <span className="text-[#a69a7e] text-xs">クチコミ評価</span>
                    <img
                      src={clinic.clinic_detail?.star !== null ? getStarImage(clinic.clinic_detail?.star) : '/common/star_0.5.png'}
                      alt={clinic.clinic_detail?.star !== null ? `${clinic.clinic_detail?.star}星評価` : '評価なし'}
                      className="w-23 h-4"
                    />
                  </div>
                  <div className="text-black text-xs">
                    評価平均 <span className="text-[#a69a7e] font-normal text-2xl">{clinic.clinic_detail?.star ?? ''}</span> / 評価人数 <span className="text-[#a69a7e] font-normal text-2xl">{clinic.clinic_detail?.user_review_count}</span><span className="text-[#a69a7e] font-normal text-2xl">人</span>
                  </div>
                </div>
              </div>
              {/* 右側 */}
              <div className="w-full md:w-[55%] flex flex-col">
                {/* バー */}
                <div className="relative mb-4 mt-2 hidden md:block">
                  <div className="w-full px-4 py-2 text-sm border-2 rounded text-center" style={{ borderColor: 'rgb(220, 194, 219)', color: 'rgb(220, 194, 219)' }}>
                    クチコミ投稿に是非ご協力ください！
                  </div>
                  {/* 下向き三角形 */}
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[12px] border-l-transparent border-r-transparent" style={{ borderTopColor: 'rgb(220, 194, 219)' }}></div>
                </div>

                {/* ボタン */}
                <ScrollToReviewButton clinicName={clinic.clinic_detail?.name} />
              </div>
            </div>

            {/* バー */}
            <div className="px-4 py-2 text-white text-sm rounded text-center" style={{ backgroundColor: 'rgb(163, 151, 125)' }}>
              Googleクチコミの情報は、常に最新情報が表示されています。
            </div>
          </div>

          {/* div2 */}
          <Div2 clinic={clinic} />


          {/* div3 */}
          <div id="review-section" className="mb-2 p-4 rounded-lg" style={{ backgroundColor: 'rgb(255, 249, 240)', marginLeft: '3px', marginRight: '3px' }}>
            {/* バー */}
            <div className="relative mb-4">
              <div className="w-full px-4 py-2 text-sm border-2 rounded text-center bg-white" style={{ borderColor: 'rgb(220, 194, 219)', color: 'rgb(220, 194, 219)' }}>
                {clinic.clinic_detail?.name}のクチコミ一覧はこちら！
              </div>
              {/* 下向き三角形 */}
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[12px] border-l-transparent border-r-transparent" style={{ borderTopColor: 'rgb(220, 194, 219)' }}></div>
            </div>

            {/* カードグリッド */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5 mt-6 p-0 md:px-[15px]">
              <ReviewCard
                clinic={clinic}
                userImage="https://placehold.co/100x100/e3d5ca/000000?text=User"
                showDate={false}
              />
              {[
                'https://placehold.co/100x100/d4c4b0/000000?text=User',
                'https://placehold.co/100x100/c5b299/000000?text=User',
                'https://placehold.co/100x100/b6a082/000000?text=User',
                'https://placehold.co/100x100/a78e6b/000000?text=User'
              ].map((image, index) => (
                <ReviewCard
                  key={index}
                  clinic={clinic}
                  userImage={image}
                  showDate={true}
                />
              ))}
            </div>
          </div>

          {/* div4 */}
          <div className="p-4 flex justify-center">
            <a href="/clinic">
              <button className="text-white text-sm w-64 md:w-[390px] h-12 md:h-[60px]" style={{ backgroundColor: 'rgb(163, 151, 125)' }}>
                戻る
              </button>
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
