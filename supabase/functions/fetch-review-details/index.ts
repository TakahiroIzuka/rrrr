import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FacilityDetail {
  facility_id: number
  name: string
  google_place_id: string | null
  star: number | null
  user_review_count: number | null
}

interface PlaceDetailsResponse {
  rating?: number
  userRatingCount?: number
}

async function fetchPlaceDetails(
  placeId: string,
  apiKey: string
): Promise<PlaceDetailsResponse> {
  const response = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'rating,userRatingCount',
      },
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Place Details API error: ${response.status} - ${errorText}`)
  }

  return await response.json()
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const googlePlacesApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY')

    if (!googlePlacesApiKey) {
      console.error('GOOGLE_PLACES_API_KEY is not set')
      return new Response(
        JSON.stringify({ error: 'GOOGLE_PLACES_API_KEY is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 全施設を取得
    const { data: facilities, error: facilitiesError } = await supabase
      .from('facility_details')
      .select('facility_id, name, google_place_id, star, user_review_count')

    if (facilitiesError) {
      console.error('Error fetching facilities:', facilitiesError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch facilities' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!facilities || facilities.length === 0) {
      console.log('No facilities found')
      return new Response(
        JSON.stringify({ message: 'No facilities found', processed: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${facilities.length} facilities to process`)

    const results: { facilityId: number; facilityName: string; status: string; error?: string }[] = []

    for (const facility of facilities as FacilityDetail[]) {
      // タスクレコードを作成
      const { data: task, error: taskError } = await supabase
        .from('fetch_review_detail_tasks')
        .insert({
          facility_id: facility.facility_id,
          facility_name: facility.name,
          status: 'pending',
        })
        .select()
        .single()

      if (taskError) {
        console.error(`Error creating task for facility ${facility.facility_id}:`, taskError)
        results.push({
          facilityId: facility.facility_id,
          facilityName: facility.name,
          status: 'failed',
          error: 'Failed to create task',
        })
        continue
      }

      // google_place_idが未設定の場合はスキップ
      if (!facility.google_place_id) {
        await supabase
          .from('fetch_review_detail_tasks')
          .update({
            status: 'skipped',
            error_message: 'google_place_id is not set',
          })
          .eq('id', task.id)

        console.log(`Facility ${facility.facility_id} (${facility.name}): skipped - no google_place_id`)
        results.push({
          facilityId: facility.facility_id,
          facilityName: facility.name,
          status: 'skipped',
          error: 'google_place_id is not set',
        })
        continue
      }

      try {
        // Place Details APIを呼び出し
        const placeDetails = await fetchPlaceDetails(facility.google_place_id, googlePlacesApiKey)

        // facility_detailsを更新
        const { error: updateError } = await supabase
          .from('facility_details')
          .update({
            star: placeDetails.rating ?? null,
            user_review_count: placeDetails.userRatingCount ?? null,
          })
          .eq('facility_id', facility.facility_id)

        if (updateError) {
          throw new Error(`Failed to update facility_details: ${updateError.message}`)
        }

        // タスクを完了に更新
        await supabase
          .from('fetch_review_detail_tasks')
          .update({ status: 'completed' })
          .eq('id', task.id)

        console.log(
          `Facility ${facility.facility_id} (${facility.name}): completed - ` +
          `rating=${placeDetails.rating}, userRatingCount=${placeDetails.userRatingCount}`
        )
        results.push({
          facilityId: facility.facility_id,
          facilityName: facility.name,
          status: 'completed',
        })

        // レート制限対策: 100msウェイト
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)

        await supabase
          .from('fetch_review_detail_tasks')
          .update({
            status: 'failed',
            error_message: errorMessage,
          })
          .eq('id', task.id)

        console.error(`Facility ${facility.facility_id} (${facility.name}): failed - ${errorMessage}`)
        results.push({
          facilityId: facility.facility_id,
          facilityName: facility.name,
          status: 'failed',
          error: errorMessage,
        })
      }
    }

    const completedCount = results.filter(r => r.status === 'completed').length
    const skippedCount = results.filter(r => r.status === 'skipped').length
    const failedCount = results.filter(r => r.status === 'failed').length

    console.log(
      `Processed ${results.length} facilities: ` +
      `${completedCount} completed, ${skippedCount} skipped, ${failedCount} failed`
    )

    return new Response(
      JSON.stringify({
        message: 'Facilities processed',
        total: results.length,
        completed: completedCount,
        skipped: skippedCount,
        failed: failedCount,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in fetch-review-details function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
