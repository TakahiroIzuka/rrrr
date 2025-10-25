-- Add policies for authenticated users to manage companies

-- Allow authenticated users to insert companies
CREATE POLICY "Allow authenticated users to insert companies" ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update companies
CREATE POLICY "Allow authenticated users to update companies" ON companies
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete companies
CREATE POLICY "Allow authenticated users to delete companies" ON companies
  FOR DELETE
  TO authenticated
  USING (true);
