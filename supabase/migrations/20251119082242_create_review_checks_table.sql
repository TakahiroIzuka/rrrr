-- Create review_checks table
CREATE TABLE review_checks (
  id BIGSERIAL PRIMARY KEY,
  facility_id INTEGER NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  reviewer_name TEXT,
  google_account_name TEXT,
  email TEXT,
  review_url TEXT,
  review_star NUMERIC,
  is_posted BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  is_giftcode_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on facility_id for faster lookups
CREATE INDEX idx_review_checks_facility_id ON review_checks(facility_id);
