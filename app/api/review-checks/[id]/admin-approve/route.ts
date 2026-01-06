import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewCheckId } = await params
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'トークンが必要です' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // トークン検証とレコード取得（施設情報も含む）
    const { data: reviewCheck, error: reviewCheckError } = await supabase
      .from('review_checks')
      .select(`
        *,
        facility:facilities(
          id,
          gift_code_amount_id,
          detail:facility_details!facility_id(name)
        )
      `)
      .eq('id', reviewCheckId)
      .single()

    if (reviewCheckError || !reviewCheck) {
      return NextResponse.json({ error: 'レコードが見つかりません' }, { status: 404 })
    }

    if (reviewCheck.admin_approval_token !== token) {
      return NextResponse.json({ error: '無効なトークンです' }, { status: 403 })
    }

    // 既に承認済みの場合はスキップ
    if (reviewCheck.is_giftcode_sent || reviewCheck.gift_code_status === 'sent') {
      return new NextResponse(
        `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>承認済み</title>
<style>p{font-size:22px}@media(min-width:768px){p{font-size:18px}}</style></head>
<body style="font-family: sans-serif; margin: 0; padding: 12px;">
<p style="margin: 0;">既に承認済みです。</p>
</body></html>`,
        { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      )
    }

    const facility = reviewCheck.facility
    const facilityName = facility?.detail?.[0]?.name || facility?.detail?.name || '施設'
    const giftCodeAmountId = facility?.gift_code_amount_id

    // ギフトコード処理
    let giftCodeStatus = 'unsent'
    let giftCodeMessage = ''

    if (!giftCodeAmountId) {
      // ギフトコード金額が未設定の場合
      giftCodeStatus = 'not_configured'
      giftCodeMessage = 'ギフトコード金額が未設定です。管理者に通知しました。'

      // 管理者へギフトコード未設定通知メール送信
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        await fetch(`${supabaseUrl}/functions/v1/send-gift-code-shortage-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            facilityName,
            facilityId: facility?.id,
            giftAmount: null,
            reviewerName: reviewCheck.reviewer_name,
            reviewerEmail: reviewCheck.email,
            reason: 'not_configured',
            reviewCheckId: reviewCheck.id,
            adminApprovalToken: reviewCheck.admin_approval_token
          }),
        })
      } catch (emailError) {
        console.error('Error sending gift code not configured email:', emailError)
      }
    } else {
      // アトミックにギフトコードを取得・使用済みに更新（レース条件防止）
      const { data: claimedCodes, error: claimError } = await supabase
        .rpc('claim_gift_code', { p_gift_code_amount_id: giftCodeAmountId })

      const claimedCode = claimedCodes?.[0]

      if (claimError || !claimedCode) {
        // ギフトコードが存在しない場合（在庫切れまたは有効期限切れ）
        giftCodeStatus = 'out_of_stock'
        giftCodeMessage = 'ギフトコードの在庫がありません。管理者に通知しました。'

        // 金額情報を取得
        const { data: amountData } = await supabase
          .from('gift_code_amounts')
          .select('amount')
          .eq('id', giftCodeAmountId)
          .single()

        // 管理者へギフトコード不足通知メール送信
        try {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

          await fetch(`${supabaseUrl}/functions/v1/send-gift-code-shortage-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseAnonKey}`,
            },
            body: JSON.stringify({
              facilityName,
              facilityId: facility?.id,
              giftAmount: amountData?.amount || 0,
              reviewerName: reviewCheck.reviewer_name,
              reviewerEmail: reviewCheck.email,
              reason: 'out_of_stock',
              reviewCheckId: reviewCheck.id,
              adminApprovalToken: reviewCheck.admin_approval_token
            }),
          })
        } catch (emailError) {
          console.error('Error sending gift code shortage email:', emailError)
        }
      } else {
        // ギフトコードが取得できた場合（既にused=trueに更新済み）
        const giftAmount = claimedCode.amount || 0

        // ギフトコードメール送信
        let emailSent = false
        try {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

          const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-gift-code-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseAnonKey}`,
            },
            body: JSON.stringify({
              email: reviewCheck.email,
              reviewerName: reviewCheck.reviewer_name,
              facilityName,
              giftCode: claimedCode.code,
              giftAmount,
              expiresAt: claimedCode.expires_at
            }),
          })

          if (emailResponse.ok) {
            emailSent = true
            giftCodeStatus = 'sent'
            giftCodeMessage = 'ギフトコードを送信しました。'

            // 送信履歴を記録
            await supabase
              .from('gift_codes')
              .update({
                sent_email: reviewCheck.email,
                sent_at: new Date().toISOString(),
                review_check_id: reviewCheck.id
              })
              .eq('id', claimedCode.id)
          } else {
            console.error('Failed to send gift code email')
          }
        } catch (emailError) {
          console.error('Error sending gift code email:', emailError)
        }

        // メール送信失敗時はギフトコードを未使用に戻す（ロールバック）
        if (!emailSent) {
          await supabase
            .from('gift_codes')
            .update({ used: false })
            .eq('id', claimedCode.id)

          giftCodeStatus = 'out_of_stock'
          giftCodeMessage = 'ギフトコードメールの送信に失敗しました。'
        }
      }
    }

    // review_checks を更新
    const { error: updateError } = await supabase
      .from('review_checks')
      .update({
        is_giftcode_sent: giftCodeStatus === 'sent',
        gift_code_status: giftCodeStatus,
        status: 'completed'
      })
      .eq('id', reviewCheckId)

    if (updateError) {
      console.error('Error updating review check:', updateError)
      // メール送信成功後なので、エラーを返さず成功扱いとする
    }

    // レスポンスメッセージを作成
    let resultMessage = '管理者承認が完了しました。'
    if (giftCodeStatus === 'sent') {
      resultMessage += '<br>ギフトコードを送信しました。'
    } else if (giftCodeStatus === 'out_of_stock') {
      resultMessage += '<br><span style="color: #dc2626;">ギフトコードの在庫がないため、送信できませんでした。</span>'
    } else if (giftCodeStatus === 'not_configured') {
      resultMessage += '<br><span style="color: #dc2626;">ギフトコード金額が未設定のため、送信できませんでした。</span>'
    }

    return new NextResponse(
      `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>管理者承認完了</title>
<style>p{font-size:22px}@media(min-width:768px){p{font-size:18px}}</style></head>
<body style="font-family: sans-serif; margin: 0; padding: 12px;">
<p style="margin: 0;">${resultMessage}</p>
</body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  } catch (error) {
    console.error('Error in admin-approve API:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

// GETリクエストでも承認できるようにする（メールのリンククリック用）
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return POST(request, { params })
}
