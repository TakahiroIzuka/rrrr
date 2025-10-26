-- Add name column (nullable)
ALTER TABLE users ADD COLUMN name TEXT;

-- Add code column with unique constraint (not null)
-- First add as nullable, then update existing rows, then add not null constraint
ALTER TABLE users ADD COLUMN code TEXT;

-- Update existing rows with a unique code based on id
-- This ensures existing data gets a code value before we add NOT NULL constraint
UPDATE users SET code = 'user_' || id WHERE code IS NULL;

-- Now add the NOT NULL constraint
ALTER TABLE users ALTER COLUMN code SET NOT NULL;

-- Add unique constraint on code
ALTER TABLE users ADD CONSTRAINT users_code_unique UNIQUE (code);

-- Add index on code for faster searches
CREATE INDEX idx_users_code ON users(code);
