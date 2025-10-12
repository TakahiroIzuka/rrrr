-- Create clinic_details table
CREATE TABLE clinic_details (
  id SERIAL PRIMARY KEY,
  clinic_id INTEGER NOT NULL,
  star NUMERIC,
  user_review_count INTEGER,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  site_url TEXT,
  postal_code TEXT,
  address TEXT,
  tel TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint to clinics table
ALTER TABLE clinic_details
ADD CONSTRAINT fk_clinic_details_clinic
FOREIGN KEY (clinic_id)
REFERENCES clinics(id)
ON DELETE CASCADE;

-- Add index on clinic_id for faster joins
CREATE INDEX idx_clinic_details_clinic_id ON clinic_details(clinic_id);

-- Add index on lat/lng for location-based queries
CREATE INDEX idx_clinic_details_location ON clinic_details(lat, lng);

-- Enable Row Level Security
ALTER TABLE clinic_details ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to all users
CREATE POLICY "Allow public read access" ON clinic_details
  FOR SELECT
  TO public
  USING (true);
