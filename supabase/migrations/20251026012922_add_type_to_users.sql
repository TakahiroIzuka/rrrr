-- Add type column with CHECK constraint for 'admin' or 'user'
ALTER TABLE users ADD COLUMN type TEXT;

-- Update existing rows: if company_id is NULL, set type to 'admin', otherwise 'user'
UPDATE users SET type = CASE 
  WHEN company_id IS NULL THEN 'admin'
  ELSE 'user'
END;

-- Now add NOT NULL constraint to type
ALTER TABLE users ALTER COLUMN type SET NOT NULL;

-- Add CHECK constraint to ensure type is either 'admin' or 'user'
ALTER TABLE users ADD CONSTRAINT users_type_check CHECK (type IN ('admin', 'user'));

-- Add CHECK constraint to ensure:
-- - If type is 'admin', company_id must be NULL
-- - If type is 'user', company_id must NOT be NULL
ALTER TABLE users ADD CONSTRAINT users_type_company_constraint CHECK (
  (type = 'admin' AND company_id IS NULL) OR
  (type = 'user' AND company_id IS NOT NULL)
);
