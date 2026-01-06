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
      return new NextResponse(
        `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>エラー</title>
<style>p{font-size:22px}@media(min-width:768px){p{font-size:18px}}</style></head>
<body style="font-family: sans-serif; margin: 0; padding: 12px;">
<p style="margin: 0;">無効なURLです。</p>
</body></html>`,
        { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      )
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
      return new NextResponse(
        `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>エラー</title>
<style>p{font-size:22px}@media(min-width:768px){p{font-size:18px}}</style></head>
<body style="font-family: sans-serif; margin: 0; padding: 12px;">
<p style="margin: 0;">レコードが見つかりません。</p>
</body></html>`,
        { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      )
    }

    if (reviewCheck.admin_approval_token !== token) {
      return new NextResponse(
        `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>エラー</title>
<style>p{font-size:22px}@media(min-width:768px){p{font-size:18px}}</style></head>
<body style="font-family: sans-serif; margin: 0; padding: 12px;">
<p style="margin: 0;">無効なURLです。</p>
</body></html>`,
        { status: 403, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      )
    }

    // 既に送信済みの場合はスキップ
    if (reviewCheck.is_giftcode_sent || reviewCheck.gift_code_status === 'sent') {
      return new NextResponse(
        `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>送信済み</title>
<style>p{font-size:22px}@media(min-width:768px){p{font-size:18px}}</style></head>
<body style="font-family: sans-serif; margin: 0; padding: 12px;">
<p style="margin: 0;">既にギフトコードは送信済みです。</p>
</body></html>`,
        { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      )
    }

    // 再送信可能なステータスか確認
    const currentStatus = reviewCheck.gift_code_status
    if (currentStatus !== 'out_of_stock' && currentStatus !== 'not_configured') {
      return new NextResponse(
        `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>エラー</title>
<style>p{font-size:22px}@media(min-width:768px){p{font-size:18px}}</style></head>
<body style="font-family: sans-serif; margin: 0; padding: 12px;">
<p style="margin: 0;">再送信対象ではありません。</p>
</body></html>`,
        { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      )
    }

    const facility = reviewCheck.facility
    const facilityName = facility?.detail?.[0]?.name || facility?.detail?.name || '施設'
    const facilityId = facility?.id
    const giftCodeAmountId = facility?.gift_code_amount_id

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    // 通知メール再送信用のヘルパー関数
    const sendShortageEmail = async (reason: 'out_of_stock' | 'not_configured', giftAmount: number | null) => {
      try {
        await fetch(`${supabaseUrl}/functions/v1/send-gift-code-shortage-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            facilityName,
            facilityId,
            giftAmount,
            reviewerName: reviewCheck.name,
            reviewerEmail: reviewCheck.email,
            reason,
            reviewCheckId: reviewCheck.id,
            adminApprovalToken: reviewCheck.admin_approval_token
          }),
        })
      } catch (emailError) {
        console.error('Error sending shortage email:', emailError)
      }
    }

    // ギフトコード金額が未設定の場合
    if (!giftCodeAmountId) {
      await sendShortageEmail('not_configured', null)

      return new NextResponse(
        `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>再送信失敗</title>
<style>p{font-size:22px}@media(min-width:768px){p{font-size:18px}}</style></head>
<body style="font-family: sans-serif; margin: 0; padding: 12px;">
<p style="margin: 0;">施設のギフトコード金額が未設定です。<br>設定完了後、再度通知メールのURLをクリックしてください。</p>
</body></html>`,
        { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      )
    }

    // アトミックにギフトコードを取得・使用済みに更新
    const { data: claimedCodes, error: claimError } = await supabase
      .rpc('claim_gift_code', { p_gift_code_amount_id: giftCodeAmountId })

    const claimedCode = claimedCodes?.[0]

    if (claimError || !claimedCode) {
      // 金額情報を取得
      const { data: amountData } = await supabase
        .from('gift_code_amounts')
        .select('amount')
        .eq('id', giftCodeAmountId)
        .single()

      await sendShortageEmail('out_of_stock', amountData?.amount || 0)

      return new NextResponse(
        `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>再送信失敗</title>
<style>p{font-size:22px}@media(min-width:768px){p{font-size:18px}}</style></head>
<body style="font-family: sans-serif; margin: 0; padding: 12px;">
<p style="margin: 0;">ギフトコードの在庫がありません。<br>在庫追加後、再度通知メールのURLをクリックしてください。</p>
</body></html>`,
        { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      )
    }

    // ギフトコードが取得できた場合、メール送信
    const giftAmount = claimedCode.amount || 0
    let emailSent = false

    try {
      const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-gift-code-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          email: reviewCheck.email,
          reviewerName: reviewCheck.name,
          facilityName,
          giftCode: claimedCode.code,
          giftAmount,
          expiresAt: claimedCode.expires_at
        }),
      })

      if (emailResponse.ok) {
        emailSent = true

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

    // メール送信失敗時はギフトコードを未使用に戻して通知メール送信
    if (!emailSent) {
      await supabase
        .from('gift_codes')
        .update({ used: false })
        .eq('id', claimedCode.id)

      await sendShortageEmail('out_of_stock', giftAmount)

      return new NextResponse(
        `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>再送信失敗</title>
<style>p{font-size:22px}@media(min-width:768px){p{font-size:18px}}</style></head>
<body style="font-family: sans-serif; margin: 0; padding: 12px;">
<p style="margin: 0;">メール送信に失敗しました。<br>再度通知メールのURLをクリックしてください。</p>
</body></html>`,
        { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      )
    }

    // review_checks を更新
    const { error: updateError } = await supabase
      .from('review_checks')
      .update({
        is_giftcode_sent: true,
        gift_code_status: 'sent'
      })
      .eq('id', reviewCheckId)

    if (updateError) {
      console.error('Error updating review check:', updateError)
      // 更新失敗時もギフトコードは送信済みなので成功として扱う
    }

    return new NextResponse(
      `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>再送信完了</title>
<style>p{font-size:22px}@media(min-width:768px){p{font-size:18px}}</style></head>
<body style="font-family: sans-serif; margin: 0; padding: 12px;">
<p style="margin: 0;">ギフトコードを再送信しました。</p>
</body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  } catch (error) {
    console.error('Error in resend-gift-code API:', error)
    return new NextResponse(
      `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>エラー</title>
<style>p{font-size:22px}@media(min-width:768px){p{font-size:18px}}</style></head>
<body style="font-family: sans-serif; margin: 0; padding: 12px;">
<p style="margin: 0;">サーバーエラーが発生しました。</p>
</body></html>`,
      { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }
}

// GETリクエストでも再送信できるようにする（メールのリンククリック用）
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return POST(request, { params })
}
