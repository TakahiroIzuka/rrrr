-- Create kuchikomiru_details table
CREATE TABLE kuchikomiru_details (
  id SERIAL PRIMARY KEY,
  facility_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  star NUMERIC,
  user_review_count INTEGER,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  site_url TEXT,
  postal_code TEXT,
  address TEXT,
  tel TEXT,
  google_map_url TEXT
);

-- Add foreign key constraint to facilities table
ALTER TABLE kuchikomiru_details
ADD CONSTRAINT fk_kuchikomiru_details_facility
FOREIGN KEY (facility_id)
REFERENCES facilities(id)
ON DELETE CASCADE;

-- Add index on facility_id for faster joins
CREATE INDEX idx_kuchikomiru_details_facility_id ON kuchikomiru_details(facility_id);

-- Add index on lat/lng for location-based queries
CREATE INDEX idx_kuchikomiru_details_location ON kuchikomiru_details(lat, lng);

-- Enable Row Level Security
ALTER TABLE kuchikomiru_details ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to all users
CREATE POLICY "Allow public read access" ON kuchikomiru_details
  FOR SELECT
  TO public
  USING (true);
