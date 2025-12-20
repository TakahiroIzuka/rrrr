'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Breadcrumb from './Breadcrumb'

interface QuestionnaireFormProps {
  facilityId: number
  facilityName: string
  genreColor: string
  serviceCode: string
  googleReviewUrl?: string
  genreCode?: string
}

export default function QuestionnaireForm({ facilityId, facilityName, genreColor, serviceCode, googleReviewUrl, genreCode }: QuestionnaireFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [useDefaultImage, setUseDefaultImage] = useState(false)
  const [formData, setFormData] = useState({
    satisfaction: '',
    hasGoogleAccount: '',
    feedback: '',
    name: '',
    email: '',
    googleAccountName: '',
    privacyConsent: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // バリデーション
    if (!formData.satisfaction) {
      alert('満足度を選択してください')
      return
    }
    if (!formData.name) {
      alert('お名前を入力してください')
      return
    }
    if (!formData.email) {
      alert('メールアドレスを入力してください')
      return
    }
    if (!formData.googleAccountName) {
      alert('Googleアカウントで登録されているお名前を入力してください')
      return
    }
    if (!formData.privacyConsent) {
      alert('個人情報のお取り扱いについて同意してください')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/review-checks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          facility_id: facilityId,
          reviewer_name: formData.name,
          google_account_name: formData.googleAccountName,
          email: formData.email,
          review_star: Number(formData.satisfaction),
        }),
      })

      if (!response.ok) {
        throw new Error('送信に失敗しました')
      }

      alert('アンケートを送信しました。ありがとうございました。')

      // 入力項目を初期化
      setFormData({
        satisfaction: '',
        hasGoogleAccount: '',
        feedback: '',
        name: '',
        email: '',
        googleAccountName: '',
        privacyConsent: false
      })
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('送信に失敗しました。もう一度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    router.push(`/${serviceCode}`)
  }

  return (
    <>
      {/* パンくずリスト */}
      <Breadcrumb
        items={[
          { label: 'トップ', href: `/${serviceCode}` },
          { label: `${facilityName}への5段階評価アンケート` }
        ]}
      />

      <div className="max-w-6xl mx-2.5 md:mx-auto bg-white rounded-2xl shadow-2xl pt-2.5 pb-[30px] md:py-12 px-2.5 md:px-32 mt-2.5 md:mt-12">
      {/* タイトル */}
      <h1 className="text-lg md:text-xl font-bold text-gray-800 mb-2">
        {facilityName}への<br className="md:hidden" />
        5段階評価アンケートはこちらから
      </h1>

      {/* 英語タイトル */}
      <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-8">
        <div style={{ width: '30px', height: '4px', backgroundColor: 'rgb(165, 153, 126)' }} className="md:w-[40px] md:h-[5px]"></div>
        <p
          className="text-xs md:text-base font-semibold"
          style={{ color: 'rgb(165, 153, 126)', letterSpacing: '0.2em' }}
        >
          Questionnaire Form
        </p>
      </div>

      {/* 説明欄 */}
      <div className="bg-white rounded-lg p-4 md:p-6 mb-6 md:mb-8 text-center">
        <p className="text-sm md:text-base text-gray-700 leading-relaxed">
          {facilityName}への率直なご意見、ご感想をいただけませんか？<br />
          お預かりしたアンケート内容は、今後の顧客満足度改善に向けて使用させていただきます。<br />
          お客様の声がスタッフの励みになりますので、ご協力の程、宜しくお願いします。
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* 5段階評価アンケート */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <div className="flex items-center gap-1 md:gap-2">
              <div className="w-3 h-3 md:w-4 md:h-4 rounded-full" style={{ backgroundColor: genreColor }}></div>
              <h2 className="text-base md:text-lg text-gray-800">
                5段階評価アンケートをご入力ください
              </h2>
            </div>
            <div className="flex-1 h-0.5" style={{ backgroundColor: genreColor }}></div>
          </div>

          {/* 満足度 */}
          <div className="mb-[10px] flex flex-col md:flex-row md:items-stretch gap-3">
            <label className="md:w-1/2 text-black text-xs md:text-sm text-center flex items-center justify-center p-3" style={{ backgroundColor: 'rgb(234, 227, 219)' }}>
              <span>{facilityName}へのご満足度<span className="ml-2 px-2 py-1 rounded text-white text-xs" style={{ backgroundColor: 'rgb(235, 106, 82)' }}>必須</span></span>
            </label>
            <div className="md:w-1/2 flex flex-col items-center md:items-start gap-3">
              {[5, 4, 3, 2, 1].map((star) => (
                <label key={star} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="satisfaction"
                    value={star}
                    checked={formData.satisfaction === String(star)}
                    onChange={(e) => setFormData({ ...formData, satisfaction: e.target.value })}
                    className="mr-2"
                  />
                  <span className="flex items-center">
                    <Image
                      src={`/common/star_${star}.0.png`}
                      alt={`${star}星`}
                      width={100}
                      height={20}
                      className="w-auto h-4 md:h-[18px]"
                      style={{
                        opacity: !formData.satisfaction ? 0.85 : (formData.satisfaction === String(star) ? 1 : 0.85),
                        filter: !formData.satisfaction ? 'saturate(0.3)' : (formData.satisfaction === String(star) ? 'none' : 'saturate(0.3)')
                      }}
                    />
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 星3,4,5選択時: Googleアカウント */}
          <div
            className="mb-[10px] flex flex-col md:flex-row md:items-stretch gap-3 transition-all duration-500 ease-in-out overflow-hidden"
            style={{
              maxHeight: (formData.satisfaction === '3' || formData.satisfaction === '4' || formData.satisfaction === '5') ? '500px' : '0',
              opacity: (formData.satisfaction === '3' || formData.satisfaction === '4' || formData.satisfaction === '5') ? 1 : 0,
              marginBottom: (formData.satisfaction === '3' || formData.satisfaction === '4' || formData.satisfaction === '5') ? '10px' : '0'
            }}
          >
            <label className="md:w-1/2 text-black text-xs md:text-sm text-center flex items-center justify-center p-3" style={{ backgroundColor: 'rgb(234, 227, 219)' }}>
              <span>Googleアカウント（Gmail）をお持ちですか？</span>
            </label>
            <div className="md:w-1/2">
              <div className="flex gap-8 mb-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="hasGoogleAccount"
                    value="yes"
                    checked={formData.hasGoogleAccount === 'yes'}
                    onChange={(e) => setFormData({ ...formData, hasGoogleAccount: e.target.value })}
                    className="mr-2"
                  />
                  はい
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="hasGoogleAccount"
                    value="no"
                    checked={formData.hasGoogleAccount === 'no'}
                    onChange={(e) => setFormData({ ...formData, hasGoogleAccount: e.target.value })}
                    className="mr-2"
                  />
                  いいえ
                </label>
              </div>
              <p className="text-sm text-gray-400">
                ※ Googleアカウントをお持ちでない方は、<a href="https://www.google.com/intl/ja/account/about/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">こちらからGoogleアカウントのホームにアクセス</a>し、「アカウントを作成する」を選択してください。<br />
                ※ Googleアカウントで登録されているお名前でクチコミが反映されます。
              </p>
            </div>
          </div>

          {/* はい選択時: Googleクチコミ投稿 */}
          <div
            className="mb-[10px] flex flex-col md:flex-row md:items-stretch gap-3 transition-all duration-500 ease-in-out overflow-hidden"
            style={{
              maxHeight: formData.hasGoogleAccount === 'yes' ? '500px' : '0',
              opacity: formData.hasGoogleAccount === 'yes' ? 1 : 0,
              marginBottom: formData.hasGoogleAccount === 'yes' ? '10px' : '0'
            }}
          >
            <label className="md:w-1/2 text-black text-xs md:text-sm text-center flex items-center justify-center p-3" style={{ backgroundColor: 'rgb(234, 227, 219)' }}>
              <span>Googleクチコミ投稿はこちらから</span>
            </label>
            <div className="md:w-1/2">
              <a
                href={googleReviewUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-2 rounded text-white text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'rgb(10, 108, 255)' }}
              >
                Googleクチコミ投稿はこちらから
                <span className="flex items-center justify-center w-5 h-5 bg-white rounded-full flex-shrink-0">
                  <span className="font-bold text-base leading-none" style={{ color: 'rgb(10, 108, 255)', transform: 'translate(0.5px, -1px)' }}>›</span>
                </span>
              </a>
              {/* インセンティブ画像 */}
              <div className="mt-3">
                <Image
                  src={useDefaultImage
                    ? `/${serviceCode}/default/info-incentive.png`
                    : `/${serviceCode}/${genreCode || 'default'}/info-incentive.png`
                  }
                  alt="特典情報"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                  onError={() => setUseDefaultImage(true)}
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">
                ※ Googleクチコミ投稿後は、こちらの画面にお戻りいただき、残りの情報を入力、送信を完了させてください。該当するクチコミの本人照合の確認をさせていただいた上で、特典をプレゼント致します。
              </p>
            </div>
          </div>

          {/* 星1,2選択時 または いいえ選択時: ご意見・ご感想 */}
          <div
            className="mb-[10px] flex flex-col md:flex-row md:items-stretch gap-3 transition-all duration-500 ease-in-out overflow-hidden"
            style={{
              maxHeight: (formData.satisfaction === '1' || formData.satisfaction === '2' || formData.hasGoogleAccount === 'no') ? '500px' : '0',
              opacity: (formData.satisfaction === '1' || formData.satisfaction === '2' || formData.hasGoogleAccount === 'no') ? 1 : 0,
              marginBottom: (formData.satisfaction === '1' || formData.satisfaction === '2' || formData.hasGoogleAccount === 'no') ? '10px' : '0'
            }}
          >
            <label className="md:w-1/2 text-black text-xs md:text-sm text-center flex items-center justify-center p-3" style={{ backgroundColor: 'rgb(234, 227, 219)' }}>
              <span>{facilityName}への率直なご意見、ご感想をいただけませんか？お預かりしたアンケート内容は、今後の顧客満足度改善に向けて使用させていただきます。※Googleクチコミ投稿はこちらから<span className="ml-2 px-2 py-1 rounded text-white text-xs" style={{ backgroundColor: 'rgb(165, 153, 126)' }}>任意</span></span>
            </label>
            <div className="md:w-1/2">
              <textarea
                value={formData.feedback}
                onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-400 mt-2">
                ※ 出来るだけ詳しくご記載いただければ幸いです。
              </p>
            </div>
          </div>
        </div>

        {/* 基本情報 */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <div className="flex items-center gap-1 md:gap-2">
              <div className="w-3 h-3 md:w-4 md:h-4 rounded-full" style={{ backgroundColor: genreColor }}></div>
              <h2 className="text-base md:text-lg text-gray-800">
                お客様の基本情報をご入力ください
              </h2>
            </div>
            <div className="flex-1 h-0.5" style={{ backgroundColor: genreColor }}></div>
          </div>

          {/* お名前 */}
          <div className="mb-[10px] flex flex-col md:flex-row md:items-stretch gap-3">
            <label className="md:w-1/2 text-black text-xs md:text-sm text-center flex items-center justify-center px-3 md:px-5 py-3 md:py-[25px]" style={{ backgroundColor: 'rgb(234, 227, 219)' }}>
              <span>お名前<span className="ml-2 px-2 py-1 rounded text-white text-xs" style={{ backgroundColor: 'rgb(235, 106, 82)' }}>必須</span></span>
            </label>
            <div className="md:w-1/2">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-0.5 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-400 mt-2">
                ※ お名前はフルネームでご記入ください。
              </p>
            </div>
          </div>

          {/* メールアドレス */}
          <div className="mb-[10px] flex flex-col md:flex-row md:items-stretch gap-3">
            <label className="md:w-1/2 text-black text-xs md:text-sm text-center flex items-center justify-center px-3 md:px-5 py-3 md:py-[25px]" style={{ backgroundColor: 'rgb(234, 227, 219)' }}>
              <span>メールアドレス<span className="ml-2 px-2 py-1 rounded text-white text-xs" style={{ backgroundColor: 'rgb(235, 106, 82)' }}>必須</span></span>
            </label>
            <div className="md:w-1/2">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-0.5 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-400 mt-2">
                ※ メールアドレスはお間違えのないようにご確認ください。
              </p>
            </div>
          </div>

          {/* Googleアカウント名 */}
          <div className="mb-[10px] flex flex-col md:flex-row md:items-stretch gap-3">
            <label className="md:w-1/2 text-black text-xs md:text-sm text-center flex items-center justify-center px-3 md:px-5 py-3 md:py-[25px]" style={{ backgroundColor: 'rgb(234, 227, 219)' }}>
              <span>Googleアカウントで登録されているお名前<span className="ml-2 px-2 py-1 rounded text-white text-xs" style={{ backgroundColor: 'rgb(235, 106, 82)' }}>必須</span></span>
            </label>
            <div className="md:w-1/2">
              <input
                type="text"
                value={formData.googleAccountName}
                onChange={(e) => setFormData({ ...formData, googleAccountName: e.target.value })}
                className="w-full px-4 py-0.5 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-400 mt-2">
                ※ 該当するクチコミの照合と本人確認をいたしますので、半角・全角・英数字等のお間違えのないようにご記入ください。
              </p>
            </div>
          </div>

          {/* 個人情報同意 */}
          <div className="mb-[10px] flex flex-col md:flex-row md:items-stretch gap-3">
            <label className="md:w-1/2 text-black text-xs md:text-sm text-center flex items-center justify-center px-3 md:px-5 py-3 md:py-[25px]" style={{ backgroundColor: 'rgb(234, 227, 219)' }}>
              <span>個人情報のお取り扱いについて<span className="ml-2 px-2 py-1 rounded text-white text-xs" style={{ backgroundColor: 'rgb(235, 106, 82)' }}>必須</span></span>
            </label>
            <div className="md:w-1/2 flex flex-col justify-center">
              <label className="flex items-start cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={formData.privacyConsent}
                  onChange={(e) => setFormData({ ...formData, privacyConsent: e.target.checked })}
                  className="mt-1 mr-3"
                />
                <span className="text-black text-sm">
                  個人情報のお取り扱いについて同意する。
                </span>
              </label>
              <p className="text-sm text-gray-400">
                ※ こちらの「個人情報のお取り扱いについて」をご確認の上、お進み下さい。
              </p>
            </div>
          </div>
        </div>

        {/* ボタン */}
        <div className="flex flex-col gap-4 md:gap-8 items-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-64 px-8 py-3 rounded-md text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: genreColor }}
          >
            {isSubmitting ? '送信中...' : '送信'}
          </button>
          <button
            type="button"
            onClick={handleBack}
            className="w-full md:w-auto px-24 md:px-48 py-4 text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'rgb(165, 153, 126)' }}
          >
            戻る
          </button>
        </div>
      </form>
    </div>
    </>
  )
}
