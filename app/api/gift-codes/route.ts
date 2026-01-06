import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: ギフトコード一覧取得（管理者のみ）
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const amountId = searchParams.get('amount_id')

    let query = supabase
      .from('gift_codes')
      .select(`
        *,
        gift_code_amounts (
          id,
          amount
        )
      `)
      .order('created_at', { ascending: false })

    if (amountId) {
      query = query.eq('gift_code_amount_id', parseInt(amountId))
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching gift codes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: ギフトコード登録（単体）
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
    const { code, gift_code_amount_id, expires_at } = body

    if (!code || typeof code !== 'string' || !code.trim()) {
      return NextResponse.json({ error: 'コードを入力してください' }, { status: 400 })
    }

    if (!gift_code_amount_id) {
      return NextResponse.json({ error: '金額を選択してください' }, { status: 400 })
    }

    // Check for duplicate code
    const { data: existing } = await supabase
      .from('gift_codes')
      .select('id')
      .eq('code', code.trim())
      .single()

    if (existing) {
      return NextResponse.json({ error: 'このコードは既に登録されています' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('gift_codes')
      .insert({
        code: code.trim(),
        gift_code_amount_id: parseInt(gift_code_amount_id),
        expires_at: expires_at || null
      })
      .select(`
        *,
        gift_code_amounts (
          id,
          amount
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating gift code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
