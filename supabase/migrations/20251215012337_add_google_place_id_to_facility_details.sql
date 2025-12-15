-- Add google_place_id column to facility_details
ALTER TABLE facility_details ADD COLUMN google_place_id TEXT;

-- Add comment for documentation
COMMENT ON COLUMN facility_details.google_place_id IS 'Google Place ID（Place Details API用）';

-- Create index
CREATE INDEX idx_facility_details_google_place_id ON facility_details(google_place_id);
