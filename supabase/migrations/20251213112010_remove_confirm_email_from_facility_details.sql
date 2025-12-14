-- Remove confirm_email column from facility_details table
ALTER TABLE facility_details DROP COLUMN IF EXISTS confirm_email;
