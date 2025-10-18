import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: clinic, error } = await supabase
    .from('clinics')
    .select('genre_id')
    .eq('id', id)
    .single()

  if (error || !clinic) {
    return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
  }

  return NextResponse.json({ genre_id: clinic.genre_id })
}
