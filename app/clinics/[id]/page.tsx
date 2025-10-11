import { createClient } from '@/utils/supabase/server'
import ErrorMessage from '@/components/ErrorMessage'
import { notFound } from 'next/navigation'
import { getStarImage } from '@/lib/utils/starRating'
import Div2 from './Div2'

interface ClinicDetailPageProps {
  params: {
    id: string
  }
}

export default async function ClinicDetailPage({ params }: ClinicDetailPageProps) {
  const supabase = await createClient()

  const { data: clinic, error } = await supabase
    .from('clinics')
    .select(`
      *,
      prefecture:prefectures(
        id,
        name
      ),
      area:areas(
        id,
        name
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !clinic) {
    notFound()
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="hidden md:block py-1" style={{ backgroundColor: '#fff9f0' }}>
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
              <li className="text-black">{clinic.name}</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* コンテンツ */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          {/* div1 */}
          <div className="mb-4 border-2 border-gray-300">
            <div className="flex gap-4 p-4 pb-0">
              {/* 左側 */}
              <div className="w-[45%]">
                <h1 className="text-xl font-bold mb-3" style={{ fontFamily: 'Kosugi Maru, sans-serif' }}>{clinic.name}</h1>

                <div className="flex items-center mb-2 gap-1.5 pb-2 border-b border-[#a59878]">
                  <span className="text-gray-600 text-xs border border-gray-300 rounded px-2 py-0.5">
                    {clinic.prefecture?.name}
                  </span>
                  <span className="text-gray-600 text-xs border border-gray-300 rounded px-2 py-0.5">
                    {clinic.area?.name}
                  </span>
                </div>

                <div className="mb-3 pb-2 border-b border-[#a59878]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <img
                      src="/common/ranking-icon.png"
                      alt="ランキング"
                      className="w-[18px] h-[18px]"
                    />
                    <span className="text-[#a69a7e] text-xs">クチコミ評価</span>
                    <img
                      src={clinic.star !== null ? getStarImage(clinic.star) : '/common/star_0.5.png'}
                      alt={clinic.star !== null ? `${clinic.star}星評価` : '評価なし'}
                      className="w-23 h-4"
                    />
                  </div>
                  <div className="text-black text-xs">
                    評価平均 <span className="text-[#a69a7e] font-normal text-2xl">{clinic.star ?? ''}</span> / 評価人数 <span className="text-[#a69a7e] font-normal text-2xl">{clinic.user_review_count}</span><span className="text-[#a69a7e] font-normal text-2xl">人</span>
                  </div>
                </div>
              </div>
              {/* 右側 */}
              <div className="w-[55%] flex flex-col">
                {/* バー */}
                <div className="relative mb-4 mt-2">
                  <div className="w-full px-4 py-2 text-sm border-2 rounded text-center" style={{ borderColor: 'rgb(220, 194, 219)', color: 'rgb(220, 194, 219)' }}>
                    クチコミ投稿に是非ご協力ください！
                  </div>
                  {/* 下向き三角形 */}
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[12px] border-l-transparent border-r-transparent" style={{ borderTopColor: 'rgb(220, 194, 219)' }}></div>
                </div>

                {/* ボタン */}
                <button className="w-full px-4 py-3 rounded text-white text-sm flex flex-col items-center justify-center gap-1 mt-2 mb-2" style={{ backgroundColor: 'rgb(220, 194, 219)' }}>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{clinic.name}のクチコミ一覧はこちら！</span>
                    <span className="flex items-center justify-center w-5 h-5 bg-white rounded-full flex-shrink-0">
                      <span className="font-bold text-base leading-none" style={{ color: 'rgb(220, 194, 219)', transform: 'translate(0.5px, -1px)' }}>›</span>
                    </span>
                  </div>
                  <span className="text-xs">Review List</span>
                </button>
              </div>
            </div>

            {/* バー */}
            <div className="mx-4 mb-4 px-4 py-2 text-white text-sm rounded text-center" style={{ backgroundColor: 'rgb(163, 151, 125)' }}>
              Googleクチコミの情報は、常に最新情報が表示されています。
            </div>
          </div>

          {/* div2 */}
          <Div2 clinic={clinic} />


          {/* div3 */}
          <div className="mb-4 border-2 border-gray-300 p-4">
            <p>div3</p>
          </div>

          {/* div4 */}
          <div className="border-2 border-gray-300 p-4">
            <p>div4</p>
          </div>
        </div>
      </div>
    </>
  )
}
