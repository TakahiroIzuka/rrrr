-- Remove created_at and updated_at columns from clinic_details table
ALTER TABLE clinic_details
DROP COLUMN IF EXISTS created_at,
DROP COLUMN IF EXISTS updated_at;
