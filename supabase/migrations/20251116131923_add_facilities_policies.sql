-- Enable RLS on facilities table if not already enabled
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;

-- Facilities policies
CREATE POLICY "Allow public read access on facilities" ON facilities
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to insert facilities" ON facilities
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update facilities" ON facilities
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete facilities" ON facilities
  FOR DELETE
  TO authenticated
  USING (true);
