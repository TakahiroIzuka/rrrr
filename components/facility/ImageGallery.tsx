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
      {images.map((image) => {
        // サムネイルがあればサムネイルを、なければオリジナル画像を表示
        const displayImagePath = image.thumbnail_path || image.image_path;
        const originalImageUrl = getFacilityImageUrl(image.image_path);

        return (
          <div key={image.id} className="relative aspect-square">
            <a href={originalImageUrl} target="_blank" rel="noopener noreferrer">
              <img
                src={getFacilityImageUrl(displayImagePath)}
                alt={`施設画像 ${image.display_order + 1}`}
                className="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
              />
            </a>
          </div>
        );
      })}
    </div>
  );
}
