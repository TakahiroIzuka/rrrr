-- Rename facility_details table to clinic_details
ALTER TABLE facility_details RENAME TO clinic_details;

-- Rename the foreign key column
ALTER TABLE clinic_details RENAME COLUMN facility_id TO clinic_id;

-- Update the foreign key constraint name if needed
-- The constraint will automatically follow the rename
