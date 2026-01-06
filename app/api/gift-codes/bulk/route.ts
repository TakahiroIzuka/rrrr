import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface BulkImportResult {
  success: number
  errors: { row: number; code: string; message: string }[]
}

// POST: ギフトコードCSV一括登録
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
    const { rows } = body // Expected format: [{ code: string, amount: number }, ...]

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'データがありません' }, { status: 400 })
    }

    // Fetch all gift code amounts
    const { data: giftCodeAmounts } = await supabase
      .from('gift_code_amounts')
      .select('id, amount')

    if (!giftCodeAmounts || giftCodeAmounts.length === 0) {
      return NextResponse.json({ error: 'ギフトコード額マスタが登録されていません' }, { status: 400 })
    }

    const amountToIdMap = new Map(giftCodeAmounts.map(a => [a.amount, a.id]))

    // Fetch existing codes for duplicate check
    const { data: existingCodes } = await supabase
      .from('gift_codes')
      .select('code')

    const existingCodeSet = new Set(existingCodes?.map(c => c.code) || [])

    const result: BulkImportResult = {
      success: 0,
      errors: []
    }

    const codesToInsert: { code: string; gift_code_amount_id: number }[] = []
    const processedCodes = new Set<string>()

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNumber = i + 2 // 1-indexed, skip header
      const code = String(row.code || '').trim()
      const amount = parseInt(String(row.amount || ''))

      if (!code) {
        result.errors.push({ row: rowNumber, code: '-', message: 'コードが空です' })
        continue
      }

      if (!amount || isNaN(amount)) {
        result.errors.push({ row: rowNumber, code, message: '金額が無効です' })
        continue
      }

      // Check if amount exists in master
      const amountId = amountToIdMap.get(amount)
      if (!amountId) {
        result.errors.push({ row: rowNumber, code, message: `金額マスタ未登録 (${amount})` })
        continue
      }

      // Check for duplicate in existing database
      if (existingCodeSet.has(code)) {
        result.errors.push({ row: rowNumber, code, message: 'コード重複（既存）' })
        continue
      }

      // Check for duplicate in current import batch
      if (processedCodes.has(code)) {
        result.errors.push({ row: rowNumber, code, message: 'コード重複（インポート内）' })
        continue
      }

      processedCodes.add(code)
      codesToInsert.push({ code, gift_code_amount_id: amountId })
    }

    // Bulk insert valid codes
    if (codesToInsert.length > 0) {
      const { error } = await supabase
        .from('gift_codes')
        .insert(codesToInsert)

      if (error) {
        return NextResponse.json({ error: `登録エラー: ${error.message}` }, { status: 500 })
      }

      result.success = codesToInsert.length
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error bulk importing gift codes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
