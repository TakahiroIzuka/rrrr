import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { facility_id, reviewer_name, google_account_name, email, review_star } = body

    // バリデーション
    if (!facility_id || !reviewer_name || !google_account_name || !email || !review_star) {
      return NextResponse.json(
        { error: '必須項目が入力されていません' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // review_checksにレコードを登録（status: 'pending'で登録、トークンは自動生成）
    const { data, error } = await supabase
      .from('review_checks')
      .insert({
        facility_id,
        reviewer_name,
        google_account_name,
        email,
        review_star,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting review check:', error)
      return NextResponse.json(
        { error: 'データの保存に失敗しました' },
        { status: 500 }
      )
    }

    // review_check_tasksに2レコード挿入（1分後と3分後）※テスト用
    const now = new Date()
    const oneMinuteLater = new Date(now.getTime() + 1 * 60 * 1000)
    const threeMinutesLater = new Date(now.getTime() + 3 * 60 * 1000)

    const { error: tasksError } = await supabase
      .from('review_check_tasks')
      .insert([
        {
          review_check_id: data.id,
          scheduled_at: oneMinuteLater.toISOString(),
          status: 'pending',
        },
        {
          review_check_id: data.id,
          scheduled_at: threeMinutesLater.toISOString(),
          status: 'pending',
        },
      ])

    if (tasksError) {
      console.error('Error inserting review check tasks:', tasksError)
      // タスク作成に失敗した場合でも、review_checkは作成されているのでエラーは返さない
      // ただしログは残す
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error in review-checks API:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
