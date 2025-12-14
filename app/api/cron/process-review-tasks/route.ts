import { NextResponse } from 'next/server'

// ローカルテスト用: process-review-tasks Edge Functionを呼び出すAPIルート
// 本番環境ではpg_cronが直接Edge Functionを呼び出すため、このAPIは不要

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Missing environment variables' },
        { status: 500 }
      )
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/process-review-tasks`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({}),
      }
    )

    const result = await response.json()

    return NextResponse.json(result, { status: response.status })
  } catch (error) {
    console.error('Error calling process-review-tasks:', error)
    return NextResponse.json(
      { error: 'Failed to call Edge Function' },
      { status: 500 }
    )
  }
}

// GETでも実行可能（ブラウザから直接アクセス用）
export async function GET() {
  return POST()
}
