-- Add uuid column to clinics table
ALTER TABLE clinics ADD COLUMN uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL;
