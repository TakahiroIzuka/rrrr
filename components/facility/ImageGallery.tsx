"use client";

import { useEffect, useState } from "react";
import { getFacilityImages, getFacilityImageUrl } from "@/lib/utils/imageUpload";

interface FacilityImage {
  id: number;
  facility_id: number;
  image_path: string;
  thumbnail_path: string | null;
  display_order: number;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
  updated_at: string;
}

interface ImageGalleryProps {
  facilityId: number;
}

export function ImageGallery({ facilityId }: ImageGalleryProps) {
  const [images, setImages] = useState<FacilityImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadImages = async () => {
      try {
        setLoading(true);
        const data = await getFacilityImages(facilityId);
        setImages(data);
      } catch (err) {
        console.error("Failed to load images:", err);
        setError("画像の読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [facilityId]);

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (images.length === 0) {
    return <div className="text-center py-8 text-gray-500">画像がありません</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((image) => (
        <div key={image.id} className="relative aspect-square">
          <img
            src={getFacilityImageUrl(image.image_path)}
            alt={`施設画像 ${image.display_order + 1}`}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      ))}
    </div>
  );
}
