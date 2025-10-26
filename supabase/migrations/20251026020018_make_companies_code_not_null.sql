-- Make companies.code NOT NULL
-- First, update any existing NULL values (if any)
UPDATE companies SET code = 'company_' || id WHERE code IS NULL;

-- Then add NOT NULL constraint
ALTER TABLE companies ALTER COLUMN code SET NOT NULL;
