import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ApifyReview {
  name?: string
  reviewerName?: string
  [key: string]: unknown
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

// レビューの名前をチェック
function checkReviewerMatch(reviews: ApifyReview[], googleAccountName: string): boolean {
  for (const review of reviews) {
    const reviewerName = review.name || review.reviewerName || ''
    if (reviewerName && reviewerName === googleAccountName) {
      return true
    }
  }
  return false
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

    // review_checksレコードを取得
    const { data: reviewCheck, error: reviewError } = await supabase
      .from('review_checks')
      .select('id, facility_id, google_account_name')
      .eq('id', review_check_id)
      .single()

    if (reviewError || !reviewCheck) {
      console.error('Error fetching review check:', reviewError)
      return new Response(
        JSON.stringify({ error: 'Review check not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 施設のgoogle_map_urlを取得
    const { data: facilityDetail, error: facilityError } = await supabase
      .from('facility_details')
      .select('google_map_url')
      .eq('facility_id', reviewCheck.facility_id)
      .single()

    if (facilityError) {
      console.error('Error fetching facility detail:', facilityError)
      return new Response(
        JSON.stringify({ error: 'Facility not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const googleMapUrl = facilityDetail?.google_map_url

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
    const isSent = checkReviewerMatch(reviews, reviewCheck.google_account_name)

    if (isSent) {
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
    }

    return new Response(
      JSON.stringify({ success: true, is_sent: isSent }),
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
