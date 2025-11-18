-- Enable RLS on facility_details table if not already enabled
ALTER TABLE facility_details ENABLE ROW LEVEL SECURITY;

-- Facility details policies
CREATE POLICY "Allow public read access on facility_details" ON facility_details
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to insert facility_details" ON facility_details
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update facility_details" ON facility_details
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete facility_details" ON facility_details
  FOR DELETE
  TO authenticated
  USING (true);
