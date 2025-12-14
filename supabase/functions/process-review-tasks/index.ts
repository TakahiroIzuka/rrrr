import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReviewCheckTask {
  id: number
  review_check_id: number
  scheduled_at: string
  status: string
}

serve(async (req) => {
  // CORSプリフライト
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Supabaseクライアントを作成
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 実行すべきタスクを取得
    // - status が 'pending'
    // - scheduled_at が現在時刻以前
    const { data: tasks, error: tasksError } = await supabase
      .from('review_check_tasks')
      .select('id, review_check_id, scheduled_at, status')
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(100)

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch tasks' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!tasks || tasks.length === 0) {
      console.log('No pending tasks to process')
      return new Response(
        JSON.stringify({ message: 'No pending tasks', processed: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${tasks.length} pending tasks to process`)

    const typedTasks = tasks as ReviewCheckTask[]
    const results: { taskId: number; success: boolean; error?: string }[] = []

    // 各タスクに対して check-review Edge Function を呼び出し
    for (const task of typedTasks) {
      try {
        const response = await fetch(
          `${supabaseUrl}/functions/v1/check-review`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({ review_check_task_id: task.id }),
          }
        )

        if (response.ok) {
          const result = await response.json()
          console.log(`Task ${task.id} processed successfully:`, result)
          results.push({ taskId: task.id, success: true })
        } else {
          const errorText = await response.text()
          console.error(`Task ${task.id} failed:`, errorText)
          results.push({ taskId: task.id, success: false, error: errorText })
        }
      } catch (error) {
        console.error(`Error processing task ${task.id}:`, error)
        results.push({ taskId: task.id, success: false, error: String(error) })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    console.log(`Processed ${results.length} tasks: ${successCount} success, ${failCount} failed`)

    return new Response(
      JSON.stringify({
        message: 'Tasks processed',
        total: results.length,
        success: successCount,
        failed: failCount,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in process-review-tasks function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
