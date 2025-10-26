-- Add company_id column with foreign key constraint
ALTER TABLE users ADD COLUMN company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL;

-- Add index on company_id for faster lookups
CREATE INDEX idx_users_company_id ON users(company_id);
