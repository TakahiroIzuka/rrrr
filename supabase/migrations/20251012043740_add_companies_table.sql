-- Create companies table
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

-- Add index on name for faster searches
CREATE INDEX idx_companies_name ON companies(name);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to all users
CREATE POLICY "Allow public read access" ON companies
  FOR SELECT
  TO public
  USING (true);
