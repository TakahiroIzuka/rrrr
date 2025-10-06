-- Seed genres table
INSERT INTO genres (name) VALUES
  ('ピラティス'),
  ('内科系'),
  ('外科系'),
  ('歯科系'),
  ('皮膚科系');

-- Seed prefectures table
INSERT INTO prefectures (name) VALUES
  ('京都府'),
  ('兵庫県'),
  ('千葉県'),
  ('埼玉県'),
  ('大阪府'),
  ('宮崎県'),
  ('広島県'),
  ('愛知県'),
  ('東京都'),
  ('熊本県'),
  ('神奈川県');

-- Seed areas table
INSERT INTO areas (prefecture_id, name) VALUES
  (5, '大阪市'),
  (8, '名古屋'),
  (9, '世田谷区'),
  (9, '中野区'),
  (9, '千代田区'),
  (9, '新宿区'),
  (9, '杉並区'),
  (9, '渋谷区'),
  (9, '港区');

-- Seed clinics table
INSERT INTO clinics (genre_id, area_id, name, star, user_review_count, lat, lng) VALUES
  (5, 2, 'DAILY SKIN CLINIC 名古屋院', 4, 102, 35.21513224384904, 136.90848145863572),
  (5, 1, 'DAILY SKIN CLINIC 心斎橋院', 4.7, 548, 34.675872736516, 135.49841414232787),
  (5, 6, 'DAILY SKIN CLINIC 新宿院', 4.5, 197, 35.69130895971996, 139.7036116918168),
  (1, 8, 'STUDIO IVY 広尾ANNEX店', NULL, 0, 35.64839035285032, 139.7176866205972),
  (1, 8, 'STUDIO IVY 恵比寿店', 5, 5, 35.64570669164102, 139.70429115767035),
  (1, 9, 'STUDIO IVY 赤坂ANNEX店', 4.7, 3, 35.670664250365526, 139.7346120644181),
  (2, 1, '西梅田シティクリニック', 3.3, 253, 34.69959423473339, 135.4954401355819);
