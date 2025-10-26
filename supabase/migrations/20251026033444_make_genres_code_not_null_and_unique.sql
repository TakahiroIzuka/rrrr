-- Make genres.code NOT NULL and UNIQUE
-- First, update any existing NULL values (if any)
UPDATE genres SET code = 'genre_' || id WHERE code IS NULL OR code = '';

-- Then add NOT NULL constraint
ALTER TABLE genres ALTER COLUMN code SET NOT NULL;

-- Add UNIQUE constraint
ALTER TABLE genres ADD CONSTRAINT genres_code_unique UNIQUE (code);
