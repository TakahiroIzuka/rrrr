-- Remove code column and add service_id column to facilities table
ALTER TABLE facilities DROP COLUMN IF EXISTS code;

-- Add service_id column with foreign key to services table
ALTER TABLE facilities ADD COLUMN service_id INTEGER REFERENCES services(id);

-- Add index for performance
CREATE INDEX idx_facilities_service_id ON facilities(service_id);
