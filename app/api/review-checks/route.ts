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

    const { data, error } = await supabase
      .from('review_checks')
      .insert({
        facility_id,
        reviewer_name,
        google_account_name,
        email,
        review_star,
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

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error in review-checks API:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
