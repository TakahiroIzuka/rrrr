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
      return NextResponse.json({ message: '既に承認済みです' }, { status: 200 })
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

    return NextResponse.json({ success: true, message: '管理者承認が完了しました' })
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
