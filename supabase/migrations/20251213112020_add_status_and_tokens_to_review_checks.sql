-- Add status and approval token columns to review_checks table
ALTER TABLE review_checks
  ADD COLUMN status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN facility_approval_token UUID DEFAULT gen_random_uuid(),
  ADD COLUMN admin_approval_token UUID DEFAULT gen_random_uuid();

-- Add comments for documentation
COMMENT ON COLUMN review_checks.status IS 'クチコミチェック全体のステータス: pending, completed, failed';
COMMENT ON COLUMN review_checks.facility_approval_token IS '施設承認用のセキュリティトークン';
COMMENT ON COLUMN review_checks.admin_approval_token IS '管理者承認用のセキュリティトークン';

-- Update existing records with tokens (they would have NULL values from the default)
UPDATE review_checks
SET
  facility_approval_token = gen_random_uuid(),
  admin_approval_token = gen_random_uuid()
WHERE facility_approval_token IS NULL;

-- Create index for status
CREATE INDEX idx_review_checks_status ON review_checks(status);
