-- Create facility_images table
CREATE TABLE facility_images (
  id BIGSERIAL PRIMARY KEY,
  facility_id INTEGER NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  image_path TEXT NOT NULL,
  thumbnail_path TEXT,
  display_order INT DEFAULT 0,
  file_size INT,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on facility_id for faster lookups
CREATE INDEX idx_facility_images_facility_id ON facility_images(facility_id);

-- Create index on display_order for sorting
CREATE INDEX idx_facility_images_display_order ON facility_images(facility_id, display_order);
