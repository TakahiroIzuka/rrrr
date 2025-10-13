-- Rename clinics table to facilities
ALTER TABLE clinics RENAME TO facilities;

-- Rename clinic_details table to facility_details
ALTER TABLE clinic_details RENAME TO facility_details;

-- Rename the foreign key column in facility_details
ALTER TABLE facility_details RENAME COLUMN clinic_id TO facility_id;

-- Update the constraint name for the foreign key (if it exists)
-- Note: The constraint name may have been automatically generated
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'clinic_details_clinic_id_fkey'
    AND table_name = 'facility_details'
  ) THEN
    ALTER TABLE facility_details RENAME CONSTRAINT clinic_details_clinic_id_fkey TO facility_details_facility_id_fkey;
  END IF;
END $$;
