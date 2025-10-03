'use client'

export default function MarqueeText() {
  return (
    <div className="overflow-hidden py-1" style={{ backgroundColor: '#fff9f0' }}>
      <div className="whitespace-nowrap animate-marquee-full inline-block">
        <span className="text-sm text-black">
         メディカルクチコミランキングの評価基準は、Googleマップのクチコミ情報の数値（評価平均×評価人数=Ｘ）を算出して、ランキング順位を表示しております。 ※Googleマップのクチコミ情報は、ページを読み込む度に最新情報が同期されます。
        </span>
      </div>
    </div>
  )
}
