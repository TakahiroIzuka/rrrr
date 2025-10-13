-- Add service_id column to genres table
ALTER TABLE genres
ADD COLUMN service_id INTEGER;

-- Set all existing records to service_id = 1
UPDATE genres
SET service_id = 1;

-- Make the column NOT NULL after setting values
ALTER TABLE genres
ALTER COLUMN service_id SET NOT NULL;

-- Add foreign key constraint to services table
ALTER TABLE genres
ADD CONSTRAINT genres_service_id_fkey
FOREIGN KEY (service_id)
REFERENCES services(id)
ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_genres_service_id ON genres(service_id);
