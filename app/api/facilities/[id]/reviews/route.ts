import { NextResponse } from 'next/server'
import { createAnonClient } from '@/utils/supabase/server'

interface ApifyReview {
  name?: string
  reviewerName?: string
  text?: string
  stars?: number
  publishedAtDate?: string
  reviewImageUrls?: string[]
  reviewUrl?: string
  reviewId?: string
  likesCount?: number
  reviewerPhotoUrl?: string
  reviewerUrl?: string
  [key: string]: unknown
}

interface FormattedReview {
  reviewerName: string
  text: string
  stars: number
  publishedAt: string
  reviewImageUrls: string[]
  reviewUrl: string | null
  reviewerPhotoUrl: string | null
  reviewerUrl: string | null
}

// Google MapクチコミをApifyから取得
async function fetchGoogleMapReviews(googleMapUrl: string): Promise<ApifyReview[]> {
  const apifyToken = process.env.APIFY_TOKEN

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
    maxReviews: 50,
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const facilityId = parseInt(id)

    if (isNaN(facilityId)) {
      return NextResponse.json({ error: 'Invalid facility ID' }, { status: 400 })
    }

    // Get facility's google_map_url
    const supabase = createAnonClient()
    const { data: facilityDetail, error } = await supabase
      .from('facility_details')
      .select('google_map_url')
      .eq('facility_id', facilityId)
      .single()

    if (error || !facilityDetail?.google_map_url) {
      return NextResponse.json({ error: 'Facility not found or no Google Map URL' }, { status: 404 })
    }

    // Fetch reviews from Apify
    const apifyReviews = await fetchGoogleMapReviews(facilityDetail.google_map_url)

    // Format reviews for frontend
    const reviews: FormattedReview[] = apifyReviews.map(review => ({
      reviewerName: review.name || review.reviewerName || '匿名',
      text: review.text || '',
      stars: review.stars || 0,
      publishedAt: review.publishedAtDate || '',
      reviewImageUrls: review.reviewImageUrls || [],
      reviewUrl: review.reviewUrl || null,
      reviewerPhotoUrl: review.reviewerPhotoUrl || null,
      reviewerUrl: review.reviewerUrl || null,
    }))

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}
