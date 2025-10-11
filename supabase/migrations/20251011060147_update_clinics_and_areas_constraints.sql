-- Make area_id nullable in clinics table
ALTER TABLE clinics ALTER COLUMN area_id DROP NOT NULL;

-- Add unique constraint on prefecture_id and name in areas table
ALTER TABLE areas ADD CONSTRAINT unique_area_prefecture_name UNIQUE (prefecture_id, name);
