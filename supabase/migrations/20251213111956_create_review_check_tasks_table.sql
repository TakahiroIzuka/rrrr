-- Create review_check_tasks table
CREATE TABLE review_check_tasks (
  id BIGSERIAL PRIMARY KEY,
  review_check_id BIGINT NOT NULL REFERENCES review_checks(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  confirmed_review_id TEXT,
  executed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment for documentation
COMMENT ON TABLE review_check_tasks IS 'クチコミチェックのバッチ処理タスク';
COMMENT ON COLUMN review_check_tasks.scheduled_at IS '実行予定時刻';
COMMENT ON COLUMN review_check_tasks.status IS 'ステータス: pending, confirmed, already_confirmed, failed';
COMMENT ON COLUMN review_check_tasks.confirmed_review_id IS '確認したレビューのID（Apifyから取得）';
COMMENT ON COLUMN review_check_tasks.executed_at IS '実際の実行時刻';
COMMENT ON COLUMN review_check_tasks.error_message IS '失敗時のエラーメッセージ';

-- Create indexes
CREATE INDEX idx_review_check_tasks_review_check_id ON review_check_tasks(review_check_id);
CREATE INDEX idx_review_check_tasks_status_scheduled ON review_check_tasks(status, scheduled_at);
