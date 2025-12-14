-- Add review_approval_email column to facility_details table
ALTER TABLE facility_details ADD COLUMN review_approval_email TEXT;

-- Add comment for documentation
COMMENT ON COLUMN facility_details.review_approval_email IS 'レビュー承認依頼メールを受け取るメールアドレス';
