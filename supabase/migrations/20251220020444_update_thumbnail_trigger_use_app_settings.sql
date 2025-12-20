-- Update function to use app_settings table instead of current_setting
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
  supabase_url TEXT;
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

  -- Get Supabase URL and service role key from app_settings table
  SELECT value INTO supabase_url FROM app_settings WHERE key = 'supabase_url';
  SELECT value INTO service_role_key FROM app_settings WHERE key = 'service_role_key';

  -- Build function URL
  IF supabase_url IS NOT NULL AND supabase_url != '' THEN
    function_url := supabase_url || '/functions/v1/resize-image';
  ELSE
    -- Fallback to local development URL
    function_url := 'http://host.docker.internal:54321/functions/v1/resize-image';
  END IF;

  -- Call Edge Function asynchronously using pg_net
  PERFORM net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE(service_role_key, '')
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

-- Add comment
COMMENT ON FUNCTION public.generate_thumbnail_on_upload() IS
  'Automatically generates thumbnails for uploaded facility images by calling the resize-image Edge Function. Reads configuration from app_settings table.';
