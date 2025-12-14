// review_check_tasks のステータス
export type ReviewCheckTaskStatus = 'pending' | 'confirmed' | 'already_confirmed' | 'failed'

// review_checks のステータス
export type ReviewCheckStatus = 'pending' | 'completed' | 'failed'

// review_check_tasks テーブルの型定義
export interface ReviewCheckTask {
  id: number
  review_check_id: number
  scheduled_at: string
  status: ReviewCheckTaskStatus
  confirmed_review_id: string | null
  executed_at: string | null
  error_message: string | null
  created_at: string
  updated_at: string
}

// review_checks テーブルの型定義
export interface ReviewCheck {
  id: number
  facility_id: number
  reviewer_name: string
  google_account_name: string
  email: string
  review_url: string | null
  review_star: number | null
  status: ReviewCheckStatus
  is_approved: boolean
  is_giftcode_sent: boolean
  facility_approval_token: string
  admin_approval_token: string
  created_at: string
  updated_at: string
}

// facility_details に追加されたフィールド
export interface FacilityDetailReviewFields {
  review_approval_email: string | null
}
