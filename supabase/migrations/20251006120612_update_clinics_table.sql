-- Remove prefecture_id from clinics table
ALTER TABLE clinics DROP COLUMN prefecture_id;

-- Make area_id NOT NULL
ALTER TABLE clinics ALTER COLUMN area_id SET NOT NULL;
