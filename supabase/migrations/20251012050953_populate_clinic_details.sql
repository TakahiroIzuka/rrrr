-- Populate clinic_details table from existing clinics data
INSERT INTO clinic_details (clinic_id, star, user_review_count, lat, lng, site_url, postal_code, address, tel)
SELECT
  id,
  star,
  user_review_count,
  lat,
  lng,
  NULL as site_url,
  NULL as postal_code,
  NULL as address,
  NULL as tel
FROM clinics
WHERE id NOT IN (SELECT clinic_id FROM clinic_details);
