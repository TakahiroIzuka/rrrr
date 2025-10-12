-- Add company_id column to clinics table
ALTER TABLE clinics
ADD COLUMN company_id INTEGER;

-- Add foreign key constraint
ALTER TABLE clinics
ADD CONSTRAINT fk_clinics_company
FOREIGN KEY (company_id)
REFERENCES companies(id)
ON DELETE SET NULL;

-- Add index on company_id for faster joins
CREATE INDEX idx_clinics_company_id ON clinics(company_id);
