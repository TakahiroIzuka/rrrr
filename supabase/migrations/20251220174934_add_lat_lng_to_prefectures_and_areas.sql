-- Add lat/lng columns to prefectures table
ALTER TABLE prefectures
ADD COLUMN lat DOUBLE PRECISION,
ADD COLUMN lng DOUBLE PRECISION;

-- Add lat/lng columns to areas table
ALTER TABLE areas
ADD COLUMN lat DOUBLE PRECISION,
ADD COLUMN lng DOUBLE PRECISION;

-- Update prefectures with coordinates (prefecture capital/center)
UPDATE prefectures SET lat = 35.0116, lng = 135.7681 WHERE id = 1;  -- 京都府
UPDATE prefectures SET lat = 34.6913, lng = 135.1830 WHERE id = 2;  -- 兵庫県
UPDATE prefectures SET lat = 35.6047, lng = 140.1233 WHERE id = 3;  -- 千葉県
UPDATE prefectures SET lat = 35.8569, lng = 139.6489 WHERE id = 4;  -- 埼玉県
UPDATE prefectures SET lat = 34.6937, lng = 135.5023 WHERE id = 5;  -- 大阪府
UPDATE prefectures SET lat = 31.9111, lng = 131.4239 WHERE id = 6;  -- 宮崎県
UPDATE prefectures SET lat = 34.3963, lng = 132.4596 WHERE id = 7;  -- 広島県
UPDATE prefectures SET lat = 35.1802, lng = 136.9066 WHERE id = 8;  -- 愛知県
UPDATE prefectures SET lat = 35.6894, lng = 139.6917 WHERE id = 9;  -- 東京都
UPDATE prefectures SET lat = 32.7898, lng = 130.7417 WHERE id = 10; -- 熊本県
UPDATE prefectures SET lat = 35.4478, lng = 139.6425 WHERE id = 11; -- 神奈川県

-- Update areas with coordinates (city/ward office location)
UPDATE areas SET lat = 34.6937, lng = 135.5023 WHERE id = 1;  -- 大阪市
UPDATE areas SET lat = 35.1802, lng = 136.9066 WHERE id = 2;  -- 名古屋
UPDATE areas SET lat = 35.6461, lng = 139.6530 WHERE id = 3;  -- 世田谷区
UPDATE areas SET lat = 35.7074, lng = 139.6638 WHERE id = 4;  -- 中野区
UPDATE areas SET lat = 35.6940, lng = 139.7536 WHERE id = 5;  -- 千代田区
UPDATE areas SET lat = 35.6938, lng = 139.7035 WHERE id = 6;  -- 新宿区
UPDATE areas SET lat = 35.6994, lng = 139.6364 WHERE id = 7;  -- 杉並区
UPDATE areas SET lat = 35.6640, lng = 139.6982 WHERE id = 8;  -- 渋谷区
UPDATE areas SET lat = 35.6581, lng = 139.7513 WHERE id = 9;  -- 港区

-- Now make the columns NOT NULL
ALTER TABLE prefectures
ALTER COLUMN lat SET NOT NULL,
ALTER COLUMN lng SET NOT NULL;

ALTER TABLE areas
ALTER COLUMN lat SET NOT NULL,
ALTER COLUMN lng SET NOT NULL;
