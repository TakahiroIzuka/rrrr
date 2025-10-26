-- Add auth_user_id column to link with Supabase Auth
ALTER TABLE users ADD COLUMN auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);

-- Add comment to explain the column
COMMENT ON COLUMN users.auth_user_id IS 'References Supabase Auth user ID (auth.users.id)';
