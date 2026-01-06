-- gift_code_status のデフォルト値を 'none' から 'unsent' に変更
ALTER TABLE review_checks
ALTER COLUMN gift_code_status SET DEFAULT 'unsent';

-- 既存の 'none' データを 'unsent' に更新
UPDATE review_checks
SET gift_code_status = 'unsent'
WHERE gift_code_status = 'none';
