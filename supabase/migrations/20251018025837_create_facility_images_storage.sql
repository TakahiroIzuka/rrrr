-- Create storage bucket for facility images (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('facility-images', 'facility-images', true);

-- Policy: Authenticated users can upload facility images
CREATE POLICY "Authenticated users can upload facility images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'facility-images');

-- Policy: Anyone can view facility images
CREATE POLICY "Anyone can view facility images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'facility-images');

-- Policy: Authenticated users can update facility images
CREATE POLICY "Authenticated users can update facility images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'facility-images')
WITH CHECK (bucket_id = 'facility-images');

-- Policy: Authenticated users can delete facility images
CREATE POLICY "Authenticated users can delete facility images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'facility-images');
