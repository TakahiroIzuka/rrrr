import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
      .select('admin_approval_token, is_giftcode_sent')
      .eq('id', reviewCheckId)
      .single()

    if (reviewCheckError || !reviewCheck) {
      return NextResponse.json({ error: 'レコードが見つかりません' }, { status: 404 })
    }

    if (reviewCheck.admin_approval_token !== token) {
      return NextResponse.json({ error: '無効なトークンです' }, { status: 403 })
    }

    // 既に承認済みの場合はスキップ
    if (reviewCheck.is_giftcode_sent) {
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

    // review_checks.is_giftcode_sent を true に、status を completed に更新
    const { error: updateError } = await supabase
      .from('review_checks')
      .update({ is_giftcode_sent: true, status: 'completed' })
      .eq('id', reviewCheckId)

    if (updateError) {
      console.error('Error updating review check:', updateError)
      return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 })
    }

    return new NextResponse(
      `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>管理者承認完了</title>
<style>p{font-size:22px}@media(min-width:768px){p{font-size:18px}}</style></head>
<body style="font-family: sans-serif; margin: 0; padding: 12px;">
<p style="margin: 0;">管理者承認が完了しました。</p>
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
