-- Remove password column as Supabase Auth will handle authentication
ALTER TABLE users DROP COLUMN IF EXISTS password;
