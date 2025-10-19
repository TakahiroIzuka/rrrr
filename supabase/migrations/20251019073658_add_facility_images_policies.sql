-- Enable RLS on facility_images table
ALTER TABLE facility_images ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view facility images (for development)
CREATE POLICY "Anyone can view facility images"
ON facility_images FOR SELECT
TO public
USING (true);

-- Policy: Anyone can insert facility images (for development)
CREATE POLICY "Anyone can insert facility images"
ON facility_images FOR INSERT
TO public
WITH CHECK (true);

-- Policy: Anyone can update facility images (for development)
CREATE POLICY "Anyone can update facility images"
ON facility_images FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Policy: Anyone can delete facility images (for development)
CREATE POLICY "Anyone can delete facility images"
ON facility_images FOR DELETE
TO public
USING (true);

-- Update storage policies to allow public access (for development)
-- Drop existing authenticated-only policies
DROP POLICY IF EXISTS "Authenticated users can upload facility images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update facility images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete facility images" ON storage.objects;

-- Create new public policies
CREATE POLICY "Anyone can upload facility images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'facility-images');

CREATE POLICY "Anyone can update facility images"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'facility-images')
WITH CHECK (bucket_id = 'facility-images');

CREATE POLICY "Anyone can delete facility images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'facility-images');
