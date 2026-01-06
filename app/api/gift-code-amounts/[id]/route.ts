import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PUT: 金額更新
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
    const { amount } = body

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: '金額は正の整数で入力してください' }, { status: 400 })
    }

    // Check for duplicate (excluding current record)
    const { data: existing } = await supabase
      .from('gift_code_amounts')
      .select('id')
      .eq('amount', amount)
      .neq('id', parseInt(id))
      .single()

    if (existing) {
      return NextResponse.json({ error: 'この金額は既に登録されています' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('gift_code_amounts')
      .update({ amount })
      .eq('id', parseInt(id))
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating gift code amount:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE: 金額削除
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

    // Check if there are related gift_codes
    const { data: relatedCodes } = await supabase
      .from('gift_codes')
      .select('id')
      .eq('gift_code_amount_id', parseInt(id))
      .limit(1)

    if (relatedCodes && relatedCodes.length > 0) {
      return NextResponse.json(
        { error: 'このギフトコード額は使用中のため削除できません（ギフトコードが登録されています）' },
        { status: 400 }
      )
    }

    // Check if there are related facilities
    const { data: relatedFacilities } = await supabase
      .from('facilities')
      .select('id')
      .eq('gift_code_amount_id', parseInt(id))
      .limit(1)

    if (relatedFacilities && relatedFacilities.length > 0) {
      return NextResponse.json(
        { error: 'このギフトコード額は使用中のため削除できません（施設に設定されています）' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('gift_code_amounts')
      .delete()
      .eq('id', parseInt(id))

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting gift code amount:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
