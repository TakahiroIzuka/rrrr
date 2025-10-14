-- Reorder columns in tables
-- PostgreSQL doesn't support reordering columns directly, so we need to recreate the tables

-- 1. Reorder genres table columns: id, service_id, code, name
ALTER TABLE genres RENAME TO genres_old;

CREATE TABLE genres (
  id SERIAL PRIMARY KEY,
  service_id INTEGER NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL
);

-- Copy data from old table
INSERT INTO genres (id, service_id, code, name)
SELECT id, service_id, code, name FROM genres_old;

-- Restore sequence value
SELECT setval('genres_id_seq', (SELECT MAX(id) FROM genres));

-- Drop old table
DROP TABLE genres_old CASCADE;

-- Recreate foreign key constraints
ALTER TABLE genres
ADD CONSTRAINT genres_service_id_fkey
FOREIGN KEY (service_id)
REFERENCES services(id)
ON DELETE CASCADE;

-- Recreate index
CREATE INDEX idx_genres_service_id ON genres(service_id);

-- 2. Reorder facilities table columns: id, service_id, company_id, genre_id, prefecture_id, area_id, uuid
ALTER TABLE facilities RENAME TO facilities_old;

CREATE TABLE facilities (
  id SERIAL PRIMARY KEY,
  service_id INTEGER REFERENCES services(id),
  company_id INTEGER,
  genre_id INTEGER NOT NULL REFERENCES genres(id),
  prefecture_id INTEGER,
  area_id INTEGER REFERENCES areas(id),
  uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL
);

-- Copy data from old table
INSERT INTO facilities (id, service_id, company_id, genre_id, prefecture_id, area_id, uuid)
SELECT id, service_id, company_id, genre_id, prefecture_id, area_id, uuid FROM facilities_old;

-- Restore sequence value
SELECT setval('clinics_id_seq', (SELECT MAX(id) FROM facilities));

-- Drop old table (CASCADE will handle dependent constraints)
DROP TABLE facilities_old CASCADE;

-- Recreate foreign key constraints
ALTER TABLE facilities
ADD CONSTRAINT fk_facilities_prefecture
FOREIGN KEY (prefecture_id)
REFERENCES prefectures(id)
ON DELETE SET NULL;

ALTER TABLE facilities
ADD CONSTRAINT fk_facilities_company
FOREIGN KEY (company_id)
REFERENCES companies(id)
ON DELETE SET NULL;

-- Recreate indexes
CREATE INDEX idx_facilities_service_id ON facilities(service_id);
CREATE INDEX idx_clinics_company_id ON facilities(company_id);
CREATE INDEX idx_clinics_prefecture_id ON facilities(prefecture_id);

-- 3. Reorder facility_details table columns: id, facility_id, name, star, user_review_count, google_map_url, site_url, postal_code, address, tel, lat, lng
ALTER TABLE facility_details RENAME TO facility_details_old;

CREATE TABLE facility_details (
  id SERIAL PRIMARY KEY,
  facility_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  star NUMERIC,
  user_review_count INTEGER,
  google_map_url TEXT,
  site_url TEXT,
  postal_code TEXT,
  address TEXT,
  tel TEXT,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL
);

-- Copy data from old table
INSERT INTO facility_details (id, facility_id, name, star, user_review_count, google_map_url, site_url, postal_code, address, tel, lat, lng)
SELECT id, facility_id, name, star, user_review_count, google_map_url, site_url, postal_code, address, tel, lat, lng FROM facility_details_old;

-- Restore sequence value
SELECT setval(pg_get_serial_sequence('facility_details', 'id'), (SELECT MAX(id) FROM facility_details));

-- Drop old table
DROP TABLE facility_details_old;

-- Recreate foreign key constraint
ALTER TABLE facility_details
ADD CONSTRAINT fk_facility_details_facility
FOREIGN KEY (facility_id)
REFERENCES facilities(id)
ON DELETE CASCADE;

-- Recreate indexes
CREATE INDEX idx_facility_details_facility_id ON facility_details(facility_id);
CREATE INDEX idx_facility_details_location ON facility_details(lat, lng);

-- Enable Row Level Security
ALTER TABLE facility_details ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow public read access" ON facility_details
  FOR SELECT
  TO public
  USING (true);
