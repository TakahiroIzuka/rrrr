import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ApifyReview {
  name?: string
  reviewerName?: string
  reviewUrl?: string
  reviewId?: string
  url?: string
  stars?: number
  [key: string]: unknown
}

interface ReviewCheckTask {
  id: number
  review_check_id: number
  scheduled_at: string
  status: string
  confirmed_review_id: string | null
  executed_at: string | null
  error_message: string | null
}

interface ReviewCheck {
  id: number
  facility_id: number
  google_account_name: string
  email: string
  reviewer_name: string
  facility_approval_token: string
  review_url: string | null
}

// メール送信（Resend API使用、ローカルはSMTPにフォールバック）
async function sendEmail(
  to: string,
  subject: string,
  body: string
): Promise<boolean> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  const fromEmail = Deno.env.get('EMAIL_FROM') || 'noreply@example.com'

  // Resend APIキーがある場合はResendを使用
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject: subject,
          text: body,
        }),
      })

      if (response.ok) {
        console.log(`Email sent via Resend to: ${to}`)
        return true
      } else {
        const errorData = await response.text()
        console.error(`Resend API error: ${errorData}`)
        return false
      }
    } catch (error) {
      console.error('Resend error:', error)
      return false
    }
  }

  // ローカル開発用: SMTP
  const smtpHost = Deno.env.get('SMTP_HOST') || 'supabase_inbucket_my-map'
  const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '1025')

  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  try {
    const conn = await Deno.connect({ hostname: smtpHost, port: smtpPort })

    const read = async (): Promise<string> => {
      const buf = new Uint8Array(1024)
      const n = await conn.read(buf)
      return decoder.decode(buf.subarray(0, n || 0))
    }

    const write = async (data: string): Promise<void> => {
      await conn.write(encoder.encode(data + '\r\n'))
    }

    await read()
    await write(`EHLO localhost`)
    await read()
    await write(`MAIL FROM:<${fromEmail}>`)
    await read()
    await write(`RCPT TO:<${to}>`)
    await read()
    await write('DATA')
    await read()

    const emailContent = [
      `From: ${fromEmail}`,
      `To: ${to}`,
      `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
      '',
      body,
      '.',
    ].join('\r\n')

    await write(emailContent)
    await read()
    await write('QUIT')

    conn.close()
    console.log(`Email sent via SMTP to: ${to}`)
    return true
  } catch (error) {
    console.error('SMTP error:', error)
    return false
  }
}

// 施設承認依頼メール送信関数
async function sendFacilityApprovalRequestEmail(
  toEmail: string,
  reviewCheckId: number,
  facilityApprovalToken: string,
  reviewerName: string,
  reviewerEmail: string,
  googleAccountName: string,
  facilityName: string,
  facilityUrl: string | null,
  reviewUrl: string | null
): Promise<boolean> {
  const baseUrl = Deno.env.get('NEXT_PUBLIC_BASE_URL') || 'http://localhost:3000'
  const approvalUrl = `${baseUrl}/api/review-checks/${reviewCheckId}/facility-approve?token=${facilityApprovalToken}`

  const body = `${facilityName} のオーナー様

新しいクチコミの確認が完了しました。
以下のリンクから承認をお願いします。

━━━━━━━━━━━━━━━━━━━━━━━━
お名前: ${reviewerName} 様
メールアドレス: ${reviewerEmail}
Googleアカウント名: ${googleAccountName}
施設URL: ${facilityUrl || '未設定'}
クチコミURL: ${reviewUrl || '未取得'}
━━━━━━━━━━━━━━━━━━━━━━━━

▼ 承認する場合は以下のリンクをクリックしてください
${approvalUrl}

※このメールは自動送信されています。
※このリンクは本メールの受信者専用です。第三者への共有はお控えください。
`

  return sendEmail(toEmail, `【${facilityName}】クチコミ承認のお願い`, body)
}

// エラー通知メール送信関数（アンケート送信者へ）
async function sendErrorNotificationEmail(
  toEmail: string,
  reviewerName: string,
  facilityName: string,
  googleMapUrl: string | null
): Promise<boolean> {
  const body = `${reviewerName} 様

${facilityName} のクチコミ投稿確認ができませんでした。

以下の理由が考えられます：
- Googleアカウント名が一致しない
- クチコミ評価が1または2で投稿されている
- クチコミがまだ公開されていない
- クチコミが削除された

お手数ですが、クチコミ投稿状況をご確認ください。
${googleMapUrl || ''}

※このメールは自動送信されています。
`

  return sendEmail(toEmail, `【${facilityName}】クチコミ確認のお知らせ`, body)
}

// Google MapクチコミをApifyから取得
async function fetchGoogleMapReviews(googleMapUrl: string): Promise<ApifyReview[]> {
  const apifyToken = Deno.env.get('APIFY_TOKEN')

  if (!googleMapUrl || !apifyToken) {
    console.log('Missing googleMapUrl or APIFY_TOKEN')
    return []
  }

  const input = {
    startUrls: [
      {
        url: googleMapUrl,
        language: 'ja'
      }
    ],
    language: 'ja',
    maxReviews: 5,
    reviewsSort: 'newest'
  }

  try {
    // Apify APIを直接呼び出し
    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/compass~Google-Maps-Reviews-Scraper/runs?token=${apifyToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      }
    )

    if (!runResponse.ok) {
      throw new Error(`Apify run failed: ${runResponse.statusText}`)
    }

    const runData = await runResponse.json()
    const datasetId = runData.data.defaultDatasetId

    // 処理が完了するまで待機
    let status = runData.data.status
    while (status === 'RUNNING' || status === 'READY') {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const statusResponse = await fetch(
        `https://api.apify.com/v2/actor-runs/${runData.data.id}?token=${apifyToken}`
      )
      const statusData = await statusResponse.json()
      status = statusData.data.status
    }

    // データセットからアイテムを取得
    const itemsResponse = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyToken}`
    )
    const items = await itemsResponse.json()

    return items as ApifyReview[]
  } catch (e) {
    console.error('fetchGoogleMapReviews raised error:', e)
    return []
  }
}

// レビューの名前をチェックし、一致したレビューのURLとIDと星を返す
function findMatchingReview(reviews: ApifyReview[], googleAccountName: string): { matched: boolean; reviewUrl: string | null; reviewId: string | null; stars: number | null } {
  for (const review of reviews) {
    const reviewerName = review.name || review.reviewerName || ''
    if (reviewerName && reviewerName === googleAccountName) {
      const reviewUrl = review.reviewUrl || review.url || null
      const reviewId = review.reviewId || null
      const stars = review.stars ?? null
      return { matched: true, reviewUrl, reviewId, stars }
    }
  }
  return { matched: false, reviewUrl: null, reviewId: null, stars: null }
}

serve(async (req) => {
  // CORSプリフライト
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { review_check_task_id } = await req.json()

    if (!review_check_task_id) {
      return new Response(
        JSON.stringify({ error: 'review_check_task_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Supabaseクライアントを作成
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // review_check_taskと関連するreview_checkを取得
    const { data: task, error: taskError } = await supabase
      .from('review_check_tasks')
      .select('*')
      .eq('id', review_check_task_id)
      .single()

    if (taskError || !task) {
      console.error('Error fetching review check task:', taskError)
      return new Response(
        JSON.stringify({ error: 'Review check task not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const typedTask = task as ReviewCheckTask

    // review_checksレコードを取得
    const { data: reviewCheck, error: reviewError } = await supabase
      .from('review_checks')
      .select('id, facility_id, google_account_name, email, reviewer_name, facility_approval_token, review_url')
      .eq('id', typedTask.review_check_id)
      .single()

    if (reviewError || !reviewCheck) {
      console.error('Error fetching review check:', reviewError)
      // タスクをfailedに更新
      await supabase
        .from('review_check_tasks')
        .update({ status: 'failed', executed_at: new Date().toISOString(), error_message: 'Review check not found' })
        .eq('id', review_check_task_id)
      return new Response(
        JSON.stringify({ error: 'Review check not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const typedReviewCheck = reviewCheck as ReviewCheck

    // 同じreview_check_idの他のタスクが既にalready_confirmedかチェック
    // → 既にalready_confirmedなら、このタスクもalready_confirmedにして終了（Apify呼び出しスキップ）
    const { data: siblingAlreadyConfirmed } = await supabase
      .from('review_check_tasks')
      .select('id')
      .eq('review_check_id', typedTask.review_check_id)
      .eq('status', 'already_confirmed')
      .neq('id', review_check_task_id)
      .limit(1)
      .single()

    if (siblingAlreadyConfirmed) {
      // このタスクもalready_confirmedに更新
      await supabase
        .from('review_check_tasks')
        .update({ status: 'already_confirmed', executed_at: new Date().toISOString() })
        .eq('id', review_check_task_id)

      console.log(`Sibling task already_confirmed, skipping check for task: ${review_check_task_id}`)

      return new Response(
        JSON.stringify({ success: true, status: 'already_confirmed', message: 'Sibling task already confirmed by another submission' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 施設詳細からname, google_map_url, review_approval_emailを取得
    const { data: facilityDetail, error: facilityDetailError } = await supabase
      .from('facility_details')
      .select('name, google_map_url, review_approval_email')
      .eq('facility_id', typedReviewCheck.facility_id)
      .single()

    if (facilityDetailError || !facilityDetail) {
      console.error('Error fetching facility detail:', facilityDetailError)
      // タスクをfailedに更新
      await supabase
        .from('review_check_tasks')
        .update({ status: 'failed', executed_at: new Date().toISOString(), error_message: 'Facility detail not found' })
        .eq('id', review_check_task_id)
      return new Response(
        JSON.stringify({ error: 'Facility detail not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const googleMapUrl = facilityDetail.google_map_url

    if (!googleMapUrl) {
      console.log('No google_map_url for facility')
      // タスクをfailedに更新
      await supabase
        .from('review_check_tasks')
        .update({ status: 'failed', executed_at: new Date().toISOString(), error_message: 'No google_map_url for facility' })
        .eq('id', review_check_task_id)
      return new Response(
        JSON.stringify({ message: 'No google_map_url', status: 'failed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Google Mapから最新5件のクチコミを取得
    const reviews = await fetchGoogleMapReviews(googleMapUrl)

    // google_account_nameと一致するレビューがあるかチェック
    const { matched, reviewUrl, reviewId, stars } = findMatchingReview(reviews, typedReviewCheck.google_account_name)

    // 名前が一致 かつ 星が3以上のみconfirmed処理
    if (matched && stars !== null && stars >= 3) {
      // 既に同じreviewIdで確認済みのタスクがあるかチェック（全てのreview_check_tasks対象）
      const { data: existingConfirmed } = await supabase
        .from('review_check_tasks')
        .select('id, review_check_id')
        .eq('confirmed_review_id', reviewId)
        .eq('status', 'confirmed')
        .neq('id', review_check_task_id)
        .limit(1)
        .single()

      if (existingConfirmed) {
        // このタスクをalready_confirmedに更新
        await supabase
          .from('review_check_tasks')
          .update({ status: 'already_confirmed', executed_at: new Date().toISOString() })
          .eq('id', review_check_task_id)

        // 同じreview_check_idの他のpendingタスクも全てalready_confirmedに更新
        await supabase
          .from('review_check_tasks')
          .update({ status: 'already_confirmed', executed_at: new Date().toISOString() })
          .eq('review_check_id', typedTask.review_check_id)
          .eq('status', 'pending')

        // review_checksのstatusもalready_confirmedに更新
        await supabase
          .from('review_checks')
          .update({ status: 'already_confirmed' })
          .eq('id', typedReviewCheck.id)

        console.log(`Review already confirmed by another review_check for: ${typedReviewCheck.google_account_name}`)

        return new Response(
          JSON.stringify({ success: true, status: 'already_confirmed', message: 'This review was already confirmed by another submission' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // confirmedに更新
      await supabase
        .from('review_check_tasks')
        .update({ status: 'confirmed', confirmed_review_id: reviewId, executed_at: new Date().toISOString() })
        .eq('id', review_check_task_id)

      // review_checksのreview_urlを保存
      await supabase
        .from('review_checks')
        .update({ review_url: reviewUrl })
        .eq('id', typedReviewCheck.id)

      console.log(`Review match found for: ${typedReviewCheck.google_account_name}`)

      // review_approval_emailの確認
      const reviewApprovalEmail = facilityDetail.review_approval_email
      if (!reviewApprovalEmail) {
        console.error(`review_approval_email is not set for facility_id: ${typedReviewCheck.facility_id}`)
        // review_checks.statusをfailedに更新
        await supabase
          .from('review_checks')
          .update({ status: 'failed' })
          .eq('id', typedReviewCheck.id)

        return new Response(
          JSON.stringify({ success: false, status: 'confirmed', error: 'review_approval_email not set' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // 施設承認依頼メールを送信
      const emailSent = await sendFacilityApprovalRequestEmail(
        reviewApprovalEmail,
        typedReviewCheck.id,
        typedReviewCheck.facility_approval_token,
        typedReviewCheck.reviewer_name,
        typedReviewCheck.email,
        typedReviewCheck.google_account_name,
        facilityDetail.name,
        googleMapUrl,
        reviewUrl
      )

      if (!emailSent) {
        console.error(`Failed to send facility approval email for review_check_id: ${typedReviewCheck.id}`)
        // review_checks.statusをfailedに更新
        await supabase
          .from('review_checks')
          .update({ status: 'failed' })
          .eq('id', typedReviewCheck.id)

        return new Response(
          JSON.stringify({ success: false, status: 'confirmed', error: 'Failed to send facility approval email' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, status: 'confirmed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // エラーメッセージを決定
      let errorMessage = 'Review not found'
      if (matched && stars === null) {
        errorMessage = 'Star not found'
      } else if (matched && stars !== null && stars <= 2) {
        errorMessage = 'Rating 1 or 2 star'
      }

      // failedに更新
      await supabase
        .from('review_check_tasks')
        .update({ status: 'failed', executed_at: new Date().toISOString(), error_message: errorMessage })
        .eq('id', review_check_task_id)

      // エラーメール送信（アンケート送信者へ）
      await sendErrorNotificationEmail(
        typedReviewCheck.email,
        typedReviewCheck.reviewer_name,
        facilityDetail.name,
        googleMapUrl
      )

      // 両方のタスクがfailedかチェック
      const { data: allTasks } = await supabase
        .from('review_check_tasks')
        .select('status')
        .eq('review_check_id', typedTask.review_check_id)

      const allFailed = allTasks?.every((t: { status: string }) => t.status === 'failed')
      if (allFailed) {
        // review_checks.statusをfailedに更新
        await supabase
          .from('review_checks')
          .update({ status: 'failed' })
          .eq('id', typedReviewCheck.id)
      }

      return new Response(
        JSON.stringify({ success: true, status: 'failed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Error in check-review function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
