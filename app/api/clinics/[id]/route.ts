import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()

  const { data: clinic, error } = await supabase
    .from('clinics')
    .select('genre_id')
    .eq('id', params.id)
    .single()

  if (error || !clinic) {
    return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
  }

  return NextResponse.json({ genre_id: clinic.genre_id })
}
