-- Add code column to genres table
ALTER TABLE genres
ADD COLUMN code TEXT NOT NULL DEFAULT '';

-- Update existing records with appropriate codes
UPDATE genres SET code = 'pilates' WHERE id = 1;
UPDATE genres SET code = 'medical' WHERE id = 2;
UPDATE genres SET code = 'dermatology' WHERE id = 5;

-- Remove default after populating existing records
ALTER TABLE genres
ALTER COLUMN code DROP DEFAULT;
