-- facility_imagesテーブルにis_logoカラムを追加
ALTER TABLE facility_images
ADD COLUMN is_logo BOOLEAN DEFAULT FALSE;

-- ロゴは1施設につき1枚の制約（部分インデックス）
CREATE UNIQUE INDEX idx_facility_logo_unique
ON facility_images (facility_id)
WHERE is_logo = TRUE;

-- コメント追加
COMMENT ON COLUMN facility_images.is_logo IS 'ロゴ画像かどうか（TRUE: ロゴ、FALSE: 施設画像）';
