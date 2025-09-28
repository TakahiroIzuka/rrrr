// app/instruments/page.tsx
import { createClient } from '@/utils/supabase/server'

export default async function Instruments() {
  const supabase = await createClient()
  const { data: instruments, error } = await supabase.from('instruments').select()

  if (error) {
    return <div>Error: {JSON.stringify(error, null, 2)}</div>
  }

  return (
    <div>
      <h1>Instruments</h1>
      <pre>{JSON.stringify(instruments, null, 2)}</pre>
    </div>
  )
}
