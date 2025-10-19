"use client";

import { useState } from "react";
import { uploadFacilityImageComplete } from "@/lib/utils/imageUpload";

interface ImageData {
  id: number;
  facility_id: number;
  image_path: string;
  thumbnail_path: string | null;
  display_order: number;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
  updated_at: string;
  publicUrl: string;
  thumbnailUrl: string | null;
}

interface ImageUploadProps {
  facilityId: number;
  onUploadSuccess?: (imageData: ImageData) => void;
  onUploadError?: (error: Error) => void;
}

export function ImageUpload({
  facilityId,
  onUploadSuccess,
  onUploadError,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    // プレビュー表示
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    // アップロード
    setUploading(true);
    try {
      const result = await uploadFacilityImageComplete(facilityId, selectedFile);
      onUploadSuccess?.(result);
      // アップロード成功後、プレビューと選択ファイルをクリア
      setPreview(null);
      setSelectedFile(null);
      // ファイル入力もリセット
      const fileInput = document.getElementById("image-upload") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      onUploadError?.(error as Error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label
          htmlFor="image-upload"
          className="cursor-pointer inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
        >
          画像を選択
        </label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
      </div>

      {preview && (
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">プレビュー:</p>
            <img
              src={preview}
              alt="Preview"
              className="max-w-md rounded-lg border"
            />
          </div>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
          >
            {uploading ? "アップロード中..." : "アップロード"}
          </button>
        </div>
      )}
    </div>
  );
}
