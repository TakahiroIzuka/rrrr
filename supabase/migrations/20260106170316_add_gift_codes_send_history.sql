-- gift_codesテーブルに送信履歴カラムを追加
ALTER TABLE gift_codes
  ADD COLUMN sent_email TEXT,
  ADD COLUMN sent_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN review_check_id BIGINT REFERENCES review_checks(id) ON DELETE SET NULL;

-- インデックス追加（検索用）
CREATE INDEX idx_gift_codes_sent_email ON gift_codes(sent_email);
CREATE INDEX idx_gift_codes_review_check_id ON gift_codes(review_check_id);

-- コメント追加
COMMENT ON COLUMN gift_codes.sent_email IS '送信先メールアドレス';
COMMENT ON COLUMN gift_codes.sent_at IS 'ギフトコード送信日時';
COMMENT ON COLUMN gift_codes.review_check_id IS '紐付けるreview_checkのID';
