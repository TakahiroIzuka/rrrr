-- gift_codesテーブルに有効期限カラムを追加
ALTER TABLE gift_codes
ADD COLUMN expires_at DATE;
