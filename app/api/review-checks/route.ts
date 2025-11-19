import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Edge Functionを非同期で呼び出し
async function triggerReviewCheck(reviewCheckId: number) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    return
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/check-review`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ review_check_id: reviewCheckId }),
      }
    )

    if (!response.ok) {
      console.error('Edge Function call failed:', response.statusText)
    }
  } catch (error) {
    console.error('Error calling Edge Function:', error)
  }
}

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

    // review_checksにレコードを登録（is_sent: falseで登録）
    const { data, error } = await supabase
      .from('review_checks')
      .insert({
        facility_id,
        reviewer_name,
        google_account_name,
        email,
        review_star,
        is_sent: false,
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

    // Edge Functionを非同期で呼び出し（レスポンスを待たない）
    triggerReviewCheck(data.id)

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error in review-checks API:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
