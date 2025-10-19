-- Add service_id column to facility_images table
ALTER TABLE facility_images
ADD COLUMN service_id INTEGER REFERENCES services(id) ON DELETE CASCADE;

-- Add unique constraint on facility_id and display_order
ALTER TABLE facility_images
ADD CONSTRAINT unique_facility_display_order UNIQUE (facility_id, display_order);

-- Create index on service_id for faster lookups
CREATE INDEX idx_facility_images_service_id ON facility_images(service_id);
