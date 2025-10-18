import { createClient } from "@/lib/supabase/client";

/**
 * 施設画像のパスを生成
 * @param facilityId 施設ID
 * @param fileName ファイル名
 * @param isThumbnail サムネイルかどうか
 * @returns 画像のパス
 */
export function generateFacilityImagePath(
  facilityId: number,
  fileName: string,
  isThumbnail = false
): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ""); // yyyymmdd

  if (isThumbnail) {
    const fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));
    const fileExt = fileName.substring(fileName.lastIndexOf("."));
    return `${facilityId}/${dateStr}/thumb_${fileNameWithoutExt}${fileExt}`;
  }

  return `${facilityId}/${dateStr}/${fileName}`;
}

/**
 * 施設画像をアップロード
 * @param facilityId 施設ID
 * @param file アップロードするファイル
 * @returns アップロード結果
 */
export async function uploadFacilityImage(facilityId: number, file: File) {
  const supabase = createClient();

  const originalPath = generateFacilityImagePath(facilityId, file.name);

  // オリジナル画像をアップロード
  const { data, error } = await supabase.storage
    .from("facility-images")
    .upload(originalPath, file);

  if (error) {
    throw new Error(`画像のアップロードに失敗しました: ${error.message}`);
  }

  return {
    originalPath,
    thumbnailPath: generateFacilityImagePath(facilityId, file.name, true),
    data,
  };
}

/**
 * 施設画像の公開URLを取得
 * @param imagePath 画像のパス
 * @returns 公開URL
 */
export function getFacilityImageUrl(imagePath: string): string {
  const supabase = createClient();

  const { data } = supabase.storage
    .from("facility-images")
    .getPublicUrl(imagePath);

  return data.publicUrl;
}

/**
 * 施設画像を削除
 * @param imagePath 削除する画像のパス
 */
export async function deleteFacilityImage(imagePath: string) {
  const supabase = createClient();

  const { error } = await supabase.storage
    .from("facility-images")
    .remove([imagePath]);

  if (error) {
    throw new Error(`画像の削除に失敗しました: ${error.message}`);
  }
}

/**
 * 施設画像をDBに保存
 * @param facilityId 施設ID
 * @param imagePath 画像のパス
 * @param thumbnailPath サムネイル画像のパス
 * @param fileSize ファイルサイズ
 * @param mimeType MIMEタイプ
 * @param displayOrder 表示順序
 */
export async function saveFacilityImageToDb(
  facilityId: number,
  imagePath: string,
  thumbnailPath: string | null = null,
  fileSize: number | null = null,
  mimeType: string | null = null,
  displayOrder = 0
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("facility_images")
    .insert({
      facility_id: facilityId,
      image_path: imagePath,
      thumbnail_path: thumbnailPath,
      file_size: fileSize,
      mime_type: mimeType,
      display_order: displayOrder,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`DBへの保存に失敗しました: ${error.message}`);
  }

  return data;
}

/**
 * 施設の画像を取得
 * @param facilityId 施設ID
 * @returns 施設の画像リスト
 */
export async function getFacilityImages(facilityId: number) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("facility_images")
    .select("*")
    .eq("facility_id", facilityId)
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(`画像の取得に失敗しました: ${error.message}`);
  }

  return data;
}

/**
 * 施設画像を完全にアップロード（Storage + DB）
 * @param facilityId 施設ID
 * @param file アップロードするファイル
 * @param displayOrder 表示順序
 * @returns アップロード結果
 */
export async function uploadFacilityImageComplete(
  facilityId: number,
  file: File,
  displayOrder = 0
) {
  // 1. Storageにアップロード
  const { originalPath, thumbnailPath } = await uploadFacilityImage(
    facilityId,
    file
  );

  // 2. DBに保存
  const imageData = await saveFacilityImageToDb(
    facilityId,
    originalPath,
    thumbnailPath,
    file.size,
    file.type,
    displayOrder
  );

  return {
    ...imageData,
    publicUrl: getFacilityImageUrl(originalPath),
    thumbnailUrl: thumbnailPath ? getFacilityImageUrl(thumbnailPath) : null,
  };
}
