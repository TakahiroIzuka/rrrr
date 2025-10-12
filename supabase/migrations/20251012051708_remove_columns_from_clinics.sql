-- Remove star, user_review_count, lat, lng columns from clinics table
-- These columns are now in clinic_details table

ALTER TABLE clinics
DROP COLUMN IF EXISTS star,
DROP COLUMN IF EXISTS user_review_count,
DROP COLUMN IF EXISTS lat,
DROP COLUMN IF EXISTS lng;
