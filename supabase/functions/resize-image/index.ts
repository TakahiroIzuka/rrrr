import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ResizeRequest {
  bucketName: string;
  imagePath: string;
  thumbnailPath: string;
  originalWidth?: number;
  originalHeight?: number;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the request body
    const {
      bucketName,
      imagePath,
      thumbnailPath,
      originalWidth = 600,
      originalHeight = 400,
      thumbnailWidth = 225,
      thumbnailHeight = 150,
    }: ResizeRequest = await req.json();

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Download the original image from storage
    const { data: originalImageBlob, error: downloadError } = await supabase.storage
      .from(bucketName)
      .download(imagePath);

    if (downloadError) {
      throw new Error(`Failed to download image: ${downloadError.message}`);
    }

    // Convert blob to array buffer
    const arrayBuffer = await originalImageBlob.arrayBuffer();
    const imageData = new Uint8Array(arrayBuffer);

    // Import imagescript
    const { Image } = await import("https://deno.land/x/imagescript@1.2.15/mod.ts");
    const image = await Image.decode(imageData);

    // 1. Resize original image to 600x400
    const resizedOriginal = image.resize(originalWidth, originalHeight);
    const originalBuffer = await resizedOriginal.encodeJPEG(85); // 85% quality

    // Upload resized original image (overwrite)
    const { error: originalUploadError } = await supabase.storage
      .from(bucketName)
      .upload(imagePath, originalBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (originalUploadError) {
      throw new Error(`Failed to upload resized original: ${originalUploadError.message}`);
    }

    // 2. Resize to thumbnail size (225x150)
    const thumbnail = image.resize(thumbnailWidth, thumbnailHeight);
    const thumbnailBuffer = await thumbnail.encodeJPEG(85); // 85% quality

    // Upload thumbnail to storage
    const { error: thumbnailUploadError } = await supabase.storage
      .from(bucketName)
      .upload(thumbnailPath, thumbnailBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (thumbnailUploadError) {
      throw new Error(`Failed to upload thumbnail: ${thumbnailUploadError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        imagePath,
        thumbnailPath,
        message: "Images resized successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
