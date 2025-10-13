-- Seed services table
INSERT INTO services (id, code, name) VALUES
  (1, 'medical', 'メディカル'),
  (2, 'kuchikomiru', 'クチコミル'),
  (3, 'house-builder', '工務店'),
  (4, 'vacation-stay', '宿泊施設');

-- Seed genres table
INSERT INTO genres (code, name) VALUES
  ('pilates', 'ピラティス'),
  ('medical', '内科系'),
  ('surgery', '外科系'),
  ('dental', '歯科系'),
  ('dermatology', '皮膚科系');

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

-- Seed companies table
INSERT INTO companies (name) VALUES
  ('DAILY SKIN CLINIC'),
  ('STUDIO IVY'),
  ('西梅田シティクリニック');

-- Seed facilities table
INSERT INTO facilities (genre_id, prefecture_id, area_id, company_id, uuid, service_id) VALUES
  (5, 8, 2, 1, '251dbcf3-1f07-3b9a-f66c-54f339f41f62', 1),
  (5, 5, 1, 1, '97ad8f2a-f580-3426-6edf-5c4b2d630aa8', 1),
  (5, 9, 6, 1, '2341607c-6889-170b-ba19-a9453d753dd9', 1),
  (1, 9, 8, 2, '3462159b-aabf-edb1-a2b2-44366d637f5c', 1),
  (1, 9, 8, 2, '0fa9580f-c2b5-1ba6-f859-893fbee8633a', 1),
  (1, 9, 9, 2, '978813da-874b-8a97-9ed1-527bde7359d1', 1),
  (2, 5, 1, 3, '0511baf3-69d4-5719-ddb4-7ddacd3d2676', 1);

-- Seed clinic_details table
INSERT INTO clinic_details (clinic_id, name, star, user_review_count, lat, lng, site_url, postal_code, address, tel) VALUES
  (1, 'DAILY SKIN CLINIC 名古屋院', 4, 102, 35.21513224384904, 136.90848145863572, 'https://daily-skin-clinic.jp', '450-0002', '愛知県名古屋市中村区名駅4-26-9', '052-123-4567'),
  (2, 'DAILY SKIN CLINIC 心斎橋院', 4.7, 548, 34.675872736516, 135.49841414232787, 'https://daily-skin-clinic.jp', '542-0086', '大阪府大阪市中央区西心斎橋1-5-5', '06-1234-5678'),
  (3, 'DAILY SKIN CLINIC 新宿院', 4.5, 197, 35.69130895971996, 139.7036116918168, 'https://daily-skin-clinic.jp', '160-0022', '東京都新宿区新宿3-1-16', '03-1234-5678'),
  (4, 'STUDIO IVY 広尾ANNEX店', NULL, 0, 35.64839035285032, 139.7176866205972, 'https://studio-ivy.jp', '150-0012', '東京都渋谷区広尾5-16-3', '03-2345-6789'),
  (5, 'STUDIO IVY 恵比寿店', 5, 5, 35.64570669164102, 139.70429115767035, 'https://studio-ivy.jp', '150-0013', '東京都渋谷区恵比寿1-20-8', '03-3456-7890'),
  (6, 'STUDIO IVY 赤坂ANNEX店', 4.7, 3, 35.670664250365526, 139.7346120644181, 'https://studio-ivy.jp', '107-0052', '東京都港区赤坂4-2-6', '03-4567-8901'),
  (7, '西梅田シティクリニック', 3.3, 253, 34.69959423473339, 135.4954401355819, 'https://nishi-umeda-clinic.jp', '530-0001', '大阪府大阪市北区梅田2-5-25', '06-2345-6789');
