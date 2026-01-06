import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PUT: ギフトコード更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    const { code, gift_code_amount_id, used, expires_at } = body

    const updateData: {
      code?: string
      gift_code_amount_id?: number
      used?: boolean
      expires_at?: string | null
    } = {}

    if (code !== undefined) {
      if (typeof code !== 'string' || !code.trim()) {
        return NextResponse.json({ error: 'コードを入力してください' }, { status: 400 })
      }

      // Check for duplicate code (excluding current record)
      const { data: existing } = await supabase
        .from('gift_codes')
        .select('id')
        .eq('code', code.trim())
        .neq('id', parseInt(id))
        .single()

      if (existing) {
        return NextResponse.json({ error: 'このコードは既に登録されています' }, { status: 400 })
      }

      updateData.code = code.trim()
    }

    if (gift_code_amount_id !== undefined) {
      updateData.gift_code_amount_id = parseInt(gift_code_amount_id)
    }

    if (used !== undefined) {
      updateData.used = used
    }

    if (expires_at !== undefined) {
      updateData.expires_at = expires_at || null
    }

    const { data, error } = await supabase
      .from('gift_codes')
      .update(updateData)
      .eq('id', parseInt(id))
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

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating gift code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE: ギフトコード削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const { error } = await supabase
      .from('gift_codes')
      .delete()
      .eq('id', parseInt(id))

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting gift code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
