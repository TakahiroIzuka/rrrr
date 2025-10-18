-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create function to generate thumbnail via Edge Function
CREATE OR REPLACE FUNCTION public.generate_thumbnail_on_upload()
RETURNS TRIGGER AS $$
DECLARE
  file_name TEXT;
  file_path TEXT;
  thumbnail_path TEXT;
  file_extension TEXT;
  base_name TEXT;
  function_url TEXT;
  service_role_key TEXT;
BEGIN
  -- Only process files in facility-images bucket
  IF NEW.bucket_id != 'facility-images' THEN
    RETURN NEW;
  END IF;

  -- Get the file path
  file_path := NEW.name;

  -- Extract file name from path (last segment after /)
  file_name := (regexp_matches(file_path, '[^/]+$'))[1];

  -- Skip if this is already a thumbnail (starts with thumb_)
  IF file_name LIKE 'thumb_%' THEN
    RETURN NEW;
  END IF;

  -- Get file extension
  file_extension := lower(substring(file_name from '\.([^.]+)$'));

  -- Only process image files
  IF file_extension NOT IN ('jpg', 'jpeg', 'png', 'gif', 'webp') THEN
    RETURN NEW;
  END IF;

  -- Generate thumbnail path
  -- Extract base name without extension
  base_name := substring(file_name from '^(.+)\.[^.]+$');

  -- Create thumbnail path in the same directory
  thumbnail_path := regexp_replace(file_path, '[^/]+$', 'thumb_' || base_name || '.' || file_extension);

  -- Get Supabase URL and service role key from environment
  function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/resize-image';
  service_role_key := current_setting('app.settings.service_role_key', true);

  -- If settings are not available, use default local development URL
  IF function_url IS NULL OR function_url = '' THEN
    function_url := 'http://host.docker.internal:54321/functions/v1/resize-image';
  END IF;

  -- Call Edge Function asynchronously using pg_net
  PERFORM net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE(service_role_key, current_setting('request.jwt.claim.sub', true))
    ),
    body := jsonb_build_object(
      'bucketName', NEW.bucket_id,
      'imagePath', file_path,
      'thumbnailPath', thumbnail_path,
      'width', 150,
      'height', 150
    )
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the insert
    RAISE WARNING 'Failed to trigger thumbnail generation: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on storage.objects
CREATE TRIGGER on_facility_image_upload
  AFTER INSERT ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_thumbnail_on_upload();

-- Add comment
COMMENT ON FUNCTION public.generate_thumbnail_on_upload() IS
  'Automatically generates thumbnails for uploaded facility images by calling the resize-image Edge Function';
