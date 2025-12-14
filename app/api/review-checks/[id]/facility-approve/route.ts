import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 管理者承認依頼メール送信（Supabase Edge Function経由）
async function sendAdminApprovalRequestEmail(
  reviewCheckId: number,
  adminApprovalToken: string,
  reviewerName: string,
  facilityName: string,
  reviewUrl: string | null
): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    return false
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/send-admin-approval-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          reviewCheckId,
          adminApprovalToken,
          reviewerName,
          facilityName,
          reviewUrl,
        }),
      }
    )

    if (response.ok) {
      const result = await response.json()
      console.log(`Admin approval email sent via Edge Function:`, result)
      return result.success
    } else {
      const errorText = await response.text()
      console.error(`Edge Function error: ${errorText}`)
      return false
    }
  } catch (error) {
    console.error('Error calling Edge Function:', error)
    return false
  }
}

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

    const supabase = await createClient()

    // トークン検証とレコード取得
    const { data: reviewCheck, error: reviewCheckError } = await supabase
      .from('review_checks')
      .select('facility_approval_token, admin_approval_token, reviewer_name, facility_id, is_approved, review_url')
      .eq('id', reviewCheckId)
      .single()

    if (reviewCheckError || !reviewCheck) {
      return NextResponse.json({ error: 'レコードが見つかりません' }, { status: 404 })
    }

    if (reviewCheck.facility_approval_token !== token) {
      return NextResponse.json({ error: '無効なトークンです' }, { status: 403 })
    }

    // 既に承認済みの場合はスキップ
    if (reviewCheck.is_approved) {
      return NextResponse.json({ message: '既に承認済みです' }, { status: 200 })
    }

    // 施設情報を取得
    const { data: facilityDetail, error: facilityError } = await supabase
      .from('facility_details')
      .select('name')
      .eq('facility_id', reviewCheck.facility_id)
      .single()

    if (facilityError || !facilityDetail) {
      console.error('Error fetching facility detail:', facilityError)
      return NextResponse.json({ error: '施設情報が見つかりません' }, { status: 404 })
    }

    // review_checks.is_approved を true に更新
    const { error: updateError } = await supabase
      .from('review_checks')
      .update({ is_approved: true })
      .eq('id', reviewCheckId)

    if (updateError) {
      console.error('Error updating review check:', updateError)
      return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 })
    }

    // 管理者へ承認依頼メールを送信（Edge Function経由）
    const emailSent = await sendAdminApprovalRequestEmail(
      parseInt(reviewCheckId),
      reviewCheck.admin_approval_token,
      reviewCheck.reviewer_name,
      facilityDetail.name,
      reviewCheck.review_url
    )

    if (!emailSent) {
      console.error(`Failed to send admin approval email for review_check_id: ${reviewCheckId}`)
      // review_checks.status を failed に更新
      await supabase
        .from('review_checks')
        .update({ status: 'failed' })
        .eq('id', reviewCheckId)
      return NextResponse.json({ error: '管理者への通知メール送信に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: '施設承認が完了しました' })
  } catch (error) {
    console.error('Error in facility-approve API:', error)
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
