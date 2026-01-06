import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: 金額一覧取得（管理者のみ）
export async function GET() {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: currentUser } = await supabase
      .from('users')
      .select('type')
      .eq('auth_user_id', authUser.id)
      .single()

    if (currentUser?.type !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('gift_code_amounts')
      .select('*')
      .order('amount', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching gift code amounts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: 金額登録
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: currentUser } = await supabase
      .from('users')
      .select('type')
      .eq('auth_user_id', authUser.id)
      .single()

    if (currentUser?.type !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { amount } = body

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: '金額は正の整数で入力してください' }, { status: 400 })
    }

    // Check for duplicate
    const { data: existing } = await supabase
      .from('gift_code_amounts')
      .select('id')
      .eq('amount', amount)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'この金額は既に登録されています' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('gift_code_amounts')
      .insert({ amount })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating gift code amount:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
