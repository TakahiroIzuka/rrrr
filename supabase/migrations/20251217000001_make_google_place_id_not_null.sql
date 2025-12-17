-- Make google_place_id NOT NULL
-- First, update any existing NULL values to empty string
UPDATE facility_details SET google_place_id = '' WHERE google_place_id IS NULL;

-- Then add NOT NULL constraint
ALTER TABLE facility_details ALTER COLUMN google_place_id SET NOT NULL;

-- Set default value for new records
ALTER TABLE facility_details ALTER COLUMN google_place_id SET DEFAULT '';
