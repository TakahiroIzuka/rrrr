-- Create fetch_review_detail_tasks table
CREATE TABLE fetch_review_detail_tasks (
  id BIGSERIAL PRIMARY KEY,
  facility_id INTEGER NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  facility_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE fetch_review_detail_tasks IS 'Google Place APIによるレビュー詳細取得のバッチ処理タスク';
COMMENT ON COLUMN fetch_review_detail_tasks.facility_name IS '施設名（facility_details.nameのコピー）';
COMMENT ON COLUMN fetch_review_detail_tasks.status IS 'ステータス: pending, completed, failed, skipped';
COMMENT ON COLUMN fetch_review_detail_tasks.error_message IS '失敗時のエラーメッセージ';

-- Create indexes
CREATE INDEX idx_fetch_review_detail_tasks_facility_id ON fetch_review_detail_tasks(facility_id);
CREATE INDEX idx_fetch_review_detail_tasks_status ON fetch_review_detail_tasks(status);
