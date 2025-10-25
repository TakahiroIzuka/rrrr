-- Enable RLS on master tables if not already enabled
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE prefectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;

-- Services policies
CREATE POLICY "Allow public read access on services" ON services
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to insert services" ON services
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update services" ON services
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete services" ON services
  FOR DELETE
  TO authenticated
  USING (true);

-- Genres policies
CREATE POLICY "Allow public read access on genres" ON genres
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to insert genres" ON genres
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update genres" ON genres
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete genres" ON genres
  FOR DELETE
  TO authenticated
  USING (true);

-- Prefectures policies
CREATE POLICY "Allow public read access on prefectures" ON prefectures
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to insert prefectures" ON prefectures
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update prefectures" ON prefectures
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete prefectures" ON prefectures
  FOR DELETE
  TO authenticated
  USING (true);

-- Areas policies
CREATE POLICY "Allow public read access on areas" ON areas
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to insert areas" ON areas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update areas" ON areas
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete areas" ON areas
  FOR DELETE
  TO authenticated
  USING (true);
