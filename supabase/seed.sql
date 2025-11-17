-- Seed services table
INSERT INTO services (id, code, name) VALUES
  (1, 'medical', 'メディカル'),
  (2, 'house-builder', '住宅会社'),
  (3, 'vacation-stay', '宿泊施設');

-- Seed genres table
INSERT INTO genres (id, code, name, service_id) VALUES
  (1, 'pilates', 'ピラティス', 1),
  (2, 'medical', '内科系', 1),
  (3, 'surgery', '外科系', 1),
  (4, 'dental', '歯科系', 1),
  (5, 'dermatology', '皮膚科系', 1),
  (6, 'house-maker-term', 'ハウスメーカー', 2),
  (7, 'house-builder-term', 'ビルダー', 2),
  (8, 'first-class-architect-office-term', '一級建築士事務所', 2),
  (9, 'real-estate-company-term', '不動産会社', 2),
  (10, 'koumuten-term', '工務店', 2),
  (11, 'construction-company-term', '建設会社', 2);

-- Seed prefectures table
INSERT INTO prefectures (id, name) VALUES
  (1, '京都府'),
  (2, '兵庫県'),
  (3, '千葉県'),
  (4, '埼玉県'),
  (5, '大阪府'),
  (6, '宮崎県'),
  (7, '広島県'),
  (8, '愛知県'),
  (9, '東京都'),
  (10, '熊本県'),
  (11, '神奈川県');

-- Seed areas table
INSERT INTO areas (id, prefecture_id, name) VALUES
  (1, 5, '大阪市'),
  (2, 8, '名古屋'),
  (3, 9, '世田谷区'),
  (4, 9, '中野区'),
  (5, 9, '千代田区'),
  (6, 9, '新宿区'),
  (7, 9, '杉並区'),
  (8, 9, '渋谷区'),
  (9, 9, '港区');

-- Seed companies table
INSERT INTO companies (id, code, name) VALUES
  (1, 'dairy_skin_clinic', 'DAILY SKIN CLINIC'),
  (2, 'studio_ivy', 'STUDIO IVY'),
  (3, 'umeda_clinic', '西梅田シティクリニック'),
  (4, 'ito_construction', '株式会社伊藤建設'),
  (5, 'seiei_corporation', '株式会社清栄コーポレーション');

-- Seed facilities table
INSERT INTO facilities (id, genre_id, prefecture_id, area_id, company_id, uuid, service_id) VALUES
  (1, 5, 8, 2, 1, '251dbcf3-1f07-3b9a-f66c-54f339f41f62', 1),
  (2, 5, 5, 1, 1, '97ad8f2a-f580-3426-6edf-5c4b2d630aa8', 1),
  (3, 5, 9, 6, 1, '2341607c-6889-170b-ba19-a9453d753dd9', 1),
  (4, 1, 9, 8, 2, '3462159b-aabf-edb1-a2b2-44366d637f5c', 1),
  (5, 1, 9, 8, 2, '0fa9580f-c2b5-1ba6-f859-893fbee8633a', 1),
  (6, 1, 9, 9, 2, '978813da-874b-8a97-9ed1-527bde7359d1', 1),
  (7, 2, 5, 1, 3, '0511baf3-69d4-5719-ddb4-7ddacd3d2676', 1),
  (8, 10, 11, NULL, 4, '03132990-a519-4774-a8d3-bb844a04057e', 2),
  (9, 6, 1, NULL, 5, '39273fe5-5908-49a3-9d68-e1a0d3418771', 2);

-- Seed facility_details table
INSERT INTO facility_details (facility_id, name, star, user_review_count, lat, lng, site_url, postal_code, address, tel) VALUES
  (1, 'DAILY SKIN CLINIC 名古屋院', 4, 102, 35.21513224384904, 136.90848145863572, 'https://dailyskinclinic.jp', '450-0002', '愛知県名古屋市中村区名駅4-26-9', '052-123-4567'),
  (2, 'DAILY SKIN CLINIC 心斎橋院', 4.7, 548, 34.675872736516, 135.49841414232787, 'https://dailyskinclinic.jp', '542-0086', '大阪府大阪市中央区西心斎橋1-5-5', '06-1234-5678'),
  (3, 'DAILY SKIN CLINIC 新宿院', 4.5, 197, 35.69130895971996, 139.7036116918168, 'https://dailyskinclinic.jp', '160-0022', '東京都新宿区新宿3-1-16', '03-1234-5678'),
  (4, 'STUDIO IVY 広尾ANNEX店', NULL, 0, 35.64839035285032, 139.7176866205972, 'https://www.pilates-ivy.jp', '150-0012', '東京都渋谷区広尾5-16-3', '03-2345-6789'),
  (5, 'STUDIO IVY 恵比寿店', 5, 5, 35.64570669164102, 139.70429115767035, 'https://www.pilates-ivy.jp', '150-0013', '東京都渋谷区恵比寿1-20-8', '03-3456-7890'),
  (6, 'STUDIO IVY 赤坂ANNEX店', 4.7, 3, 35.670664250365526, 139.7346120644181, 'https://www.pilates-ivy.jp', '107-0052', '東京都港区赤坂4-2-6', '03-4567-8901'),
  (7, '西梅田シティクリニック', 3.3, 253, 34.69959423473339, 135.4954401355819, 'https://nishiumeda.city-clinic.jp', '530-0001', '大阪府大阪市北区梅田2-5-25', '06-2345-6789'),
  (8, '伊藤建設', 4.8, 21, 35.341983436514866, 139.48383143989673, 'https://itokensetsu.com', '251-0052', '神奈川県藤沢市藤沢1015-23', '0466512322'),
  (9, '清栄コーポレーション', 3.5, 16, 35.0133426, 135.7567308, 'https://www.seiei-1997.co.jp', '604-0847', '京都市中京区烏丸通二条下ル秋野々町514番\n清栄ビル京都烏丸2階', '0120170161');

-- Seed users table with Supabase Auth integration
-- Note: All passwords are 'pass1234'
-- type: 'admin' = company_id is NULL, 'user' = company_id is NOT NULL

-- Create auth users and link them to users table
DO $$
DECLARE
  admin_auth_id UUID;
  daily_skin_auth_id UUID;
  studio_ivy_auth_id UUID;
  umeda_clinic_auth_id UUID;
BEGIN
  -- Create Supabase Auth users
  admin_auth_id := create_auth_user('admin@example.com', 'pass1234');
  daily_skin_auth_id := create_auth_user('user@dailyskinclinic.jp', 'pass1234');
  studio_ivy_auth_id := create_auth_user('user@studio-ivy.jp', 'pass1234');
  umeda_clinic_auth_id := create_auth_user('user@nishiumeda-clinic.jp', 'pass1234');

  -- Insert into users table with auth_user_id
  INSERT INTO users (email, type, company_id, auth_user_id) VALUES
    ('admin@example.com', 'admin', NULL, admin_auth_id),
    ('user@dailyskinclinic.jp', 'user', 1, daily_skin_auth_id),
    ('user@studio-ivy.jp', 'user', 2, studio_ivy_auth_id),
    ('user@nishiumeda-clinic.jp', 'user', 3, umeda_clinic_auth_id);
END $$;

-- Fix all sequences after inserting data with explicit IDs
-- This ensures auto-increment continues from the correct number
-- Use pg_get_serial_sequence to dynamically find the correct sequence name
SELECT setval(pg_get_serial_sequence('services', 'id'), (SELECT MAX(id) FROM services));
SELECT setval(pg_get_serial_sequence('genres', 'id'), (SELECT MAX(id) FROM genres));
SELECT setval(pg_get_serial_sequence('prefectures', 'id'), (SELECT MAX(id) FROM prefectures));
SELECT setval(pg_get_serial_sequence('areas', 'id'), (SELECT MAX(id) FROM areas));
SELECT setval(pg_get_serial_sequence('companies', 'id'), (SELECT MAX(id) FROM companies));
SELECT setval(pg_get_serial_sequence('facilities', 'id'), (SELECT MAX(id) FROM facilities));
