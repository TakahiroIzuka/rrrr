-- Allow NULL in image_path column for logo images (which only use thumbnail_path)
ALTER TABLE facility_images ALTER COLUMN image_path DROP NOT NULL;
