-- Step 1: Add name column to clinic_details table
ALTER TABLE clinic_details
ADD COLUMN name TEXT;

-- Step 2: Copy name data from clinics to clinic_details
UPDATE clinic_details cd
SET name = c.name
FROM clinics c
WHERE cd.clinic_id = c.id;

-- Step 3: Make name column NOT NULL after data is copied
ALTER TABLE clinic_details
ALTER COLUMN name SET NOT NULL;

-- Step 4: Remove name column from clinics table
ALTER TABLE clinics
DROP COLUMN name;
