-- Add confirm_email column to facility_details table
ALTER TABLE facility_details ADD COLUMN confirm_email TEXT;

-- Add comment for documentation
COMMENT ON COLUMN facility_details.confirm_email IS 'クチコミ投稿通知を受け取るメールアドレス';
