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
  url?: string
  [key: string]: unknown
}

// 簡易SMTPクライアント（ローカル開発用・本番はResend等を使用）
async function sendEmailViaSMTP(
  host: string,
  port: number,
  from: string,
  to: string,
  subject: string,
  body: string
): Promise<void> {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  const conn = await Deno.connect({ hostname: host, port })

  const read = async (): Promise<string> => {
    const buf = new Uint8Array(1024)
    const n = await conn.read(buf)
    return decoder.decode(buf.subarray(0, n || 0))
  }

  const write = async (data: string): Promise<void> => {
    await conn.write(encoder.encode(data + '\r\n'))
  }

  // SMTP会話
  await read() // 220 greeting
  await write(`EHLO localhost`)
  await read() // 250
  await write(`MAIL FROM:<${from}>`)
  await read() // 250
  await write(`RCPT TO:<${to}>`)
  await read() // 250
  await write('DATA')
  await read() // 354

  // メールヘッダーと本文
  const emailContent = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    '',
    body,
    '.',
  ].join('\r\n')

  await write(emailContent)
  await read() // 250
  await write('QUIT')

  conn.close()
}

// 施設オーナーへの通知メール送信関数
async function sendReviewNotificationEmail(
  toEmail: string,
  reviewerName: string,
  reviewerEmail: string,
  googleAccountName: string,
  facilityName: string,
  googleMapUrl: string
): Promise<boolean> {
  const smtpHost = Deno.env.get('SMTP_HOST') || 'supabase_inbucket_my-map'
  const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '1025')
  const fromEmail = Deno.env.get('SMTP_FROM') || 'noreply@example.com'

  const body = `${facilityName} のオーナー様

新しいクチコミが投稿されました。

━━━━━━━━━━━━━━━━━━━━━━━━
施設名: ${facilityName}
投稿者: ${reviewerName} 様
メールアドレス: ${reviewerEmail}
Googleアカウント名: ${googleAccountName}
送信確認: 済み
━━━━━━━━━━━━━━━━━━━━━━━━

Google Mapにてクチコミ内容をご確認ください。
${googleMapUrl}

※このメールは自動送信されています。
`

  try {
    await sendEmailViaSMTP(
      smtpHost,
      smtpPort,
      fromEmail,
      toEmail,
      `【${facilityName}】新しいクチコミが投稿されました`,
      body
    )
    console.log(`Review notification email sent to: ${toEmail}`)
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
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

// レビューの名前をチェックし、一致したレビューのURLを返す
function findMatchingReview(reviews: ApifyReview[], googleAccountName: string): { matched: boolean; reviewUrl: string | null } {
  for (const review of reviews) {
    const reviewerName = review.name || review.reviewerName || ''
    if (reviewerName && reviewerName === googleAccountName) {
      const reviewUrl = review.reviewUrl || review.url || null
      return { matched: true, reviewUrl }
    }
  }
  return { matched: false, reviewUrl: null }
}

serve(async (req) => {
  // CORSプリフライト
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { review_check_id } = await req.json()

    if (!review_check_id) {
      return new Response(
        JSON.stringify({ error: 'review_check_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Supabaseクライアントを作成
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // review_checksレコードを取得（メール送信用にemail, reviewer_nameも取得）
    const { data: reviewCheck, error: reviewError } = await supabase
      .from('review_checks')
      .select('id, facility_id, google_account_name, email, reviewer_name')
      .eq('id', review_check_id)
      .single()

    if (reviewError || !reviewCheck) {
      console.error('Error fetching review check:', reviewError)
      return new Response(
        JSON.stringify({ error: 'Review check not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 施設詳細からname, google_map_url, confirm_emailを取得
    const { data: facilityDetail, error: facilityDetailError } = await supabase
      .from('facility_details')
      .select('name, google_map_url, confirm_email')
      .eq('facility_id', reviewCheck.facility_id)
      .single()

    if (facilityDetailError || !facilityDetail) {
      console.error('Error fetching facility detail:', facilityDetailError)
      return new Response(
        JSON.stringify({ error: 'Facility detail not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const googleMapUrl = facilityDetail.google_map_url

    if (!googleMapUrl) {
      console.log('No google_map_url for facility')
      return new Response(
        JSON.stringify({ message: 'No google_map_url', is_sent: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Google Mapから最新5件のクチコミを取得
    const reviews = await fetchGoogleMapReviews(googleMapUrl)

    // google_account_nameと一致するレビューがあるかチェック
    const { matched, reviewUrl } = findMatchingReview(reviews, reviewCheck.google_account_name)

    if (matched) {
      // is_sentをtrueに更新
      const { error: updateError } = await supabase
        .from('review_checks')
        .update({ is_sent: true })
        .eq('id', review_check_id)

      if (updateError) {
        console.error('Error updating review check:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to update review check' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`Review match found for: ${reviewCheck.google_account_name}`)

      // 施設オーナーにメールを送信（confirm_emailが設定されている場合）
      const confirmEmail = facilityDetail.confirm_email
      if (confirmEmail) {
        // クチコミURLがない場合は施設URLをフォールバック
        const emailReviewUrl = reviewUrl || googleMapUrl
        const emailSent = await sendReviewNotificationEmail(
          confirmEmail,
          reviewCheck.reviewer_name,
          reviewCheck.email,
          reviewCheck.google_account_name,
          facilityDetail.name,
          emailReviewUrl
        )

        if (emailSent) {
          console.log(`Review notification email sent to: ${confirmEmail}`)
        } else {
          console.error(`Failed to send review notification email to: ${confirmEmail}`)
        }
      } else {
        console.log('No confirm_email set for facility')
      }
    }

    return new Response(
      JSON.stringify({ success: true, is_sent: matched }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in check-review function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
