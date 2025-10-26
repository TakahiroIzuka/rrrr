-- Remove name and code columns from users table
-- These columns are not needed as Supabase Auth handles user information

-- First drop the unique constraint on code
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_code_unique;

-- Drop the check constraint on code
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_code_not_empty;

-- Drop the columns
ALTER TABLE users DROP COLUMN IF EXISTS code;
ALTER TABLE users DROP COLUMN IF EXISTS name;
