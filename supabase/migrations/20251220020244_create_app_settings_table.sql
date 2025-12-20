-- Create app_settings table for storing configuration values
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Enable RLS to restrict access (no policies = only accessible from SECURITY DEFINER functions)
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Add comment
COMMENT ON TABLE app_settings IS 'Application settings table for storing configuration values like Supabase URL and service role key';
