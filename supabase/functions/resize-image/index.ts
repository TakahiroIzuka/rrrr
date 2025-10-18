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
  width?: number;
  height?: number;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { bucketName, imagePath, thumbnailPath, width = 150, height = 150 }: ResizeRequest =
      await req.json();

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Download the original image from storage
    const { data: originalImage, error: downloadError } = await supabase.storage
      .from(bucketName)
      .download(imagePath);

    if (downloadError) {
      throw new Error(`Failed to download image: ${downloadError.message}`);
    }

    // Convert blob to array buffer
    const arrayBuffer = await originalImage.arrayBuffer();
    const imageData = new Uint8Array(arrayBuffer);

    // Resize the image using imagescript
    const { Image } = await import("https://deno.land/x/imagescript@1.2.15/mod.ts");
    const image = await Image.decode(imageData);

    // Resize to thumbnail size (maintaining aspect ratio)
    const thumbnail = image.resize(width, height);

    // Encode as JPEG
    const thumbnailBuffer = await thumbnail.encodeJPEG(85); // 85% quality

    // Upload thumbnail to storage
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(thumbnailPath, thumbnailBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Failed to upload thumbnail: ${uploadError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        thumbnailPath,
        message: "Thumbnail created successfully",
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
