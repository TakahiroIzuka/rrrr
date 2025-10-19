import { createClient } from "@/lib/supabase/client";

/**
 * 指定された施設IDと日付で次の画像インデックスを取得
 * @param facilityId 施設ID
 * @param dateStr 日付文字列（yyyymmdd形式）
 * @returns 次のインデックス番号（0から始まる）
 */
async function getNextImageIndex(
  facilityId: number,
  dateStr: string
): Promise<number> {
  const supabase = createClient();

  // 同じfacility_idで、同じ日付のimage_pathを持つレコードを取得
  const { data, error } = await supabase
    .from("facility_images")
    .select("image_path")
    .eq("facility_id", facilityId)
    .like("image_path", `${facilityId}/${dateStr}/%`);

  if (error) {
    console.error("インデックス取得エラー:", error);
    return 0;
  }

  // パスから既存のインデックス番号を抽出
  const existingIndexes = (data || [])
    .map((record) => {
      // パス形式: {facilityId}/{dateStr}/{index}/{filename}
      const pathParts = record.image_path.split("/");
      if (pathParts.length >= 3) {
        const indexStr = pathParts[2];
        const index = parseInt(indexStr, 10);
        return isNaN(index) ? -1 : index;
      }
      return -1;
    })
    .filter((index) => index >= 0);

  // 最大値+1を返す（レコードがない場合は0）
  if (existingIndexes.length === 0) {
    return 0;
  }

  return Math.max(...existingIndexes) + 1;
}

/**
 * 施設画像のパスを生成
 * @param facilityId 施設ID
 * @param fileName ファイル名
 * @param index インデックス番号
 * @param isThumbnail サムネイルかどうか
 * @returns 画像のパス
 */
export function generateFacilityImagePath(
  facilityId: number,
  fileName: string,
  index: number,
  isThumbnail = false
): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ""); // yyyymmdd

  if (isThumbnail) {
    const fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));
    const fileExt = fileName.substring(fileName.lastIndexOf("."));
    return `${facilityId}/${dateStr}/${index}/thumb_${fileNameWithoutExt}${fileExt}`;
  }

  return `${facilityId}/${dateStr}/${index}/${fileName}`;
}

/**
 * 施設画像をアップロード
 * @param facilityId 施設ID
 * @param file アップロードするファイル
 * @returns アップロード結果
 */
export async function uploadFacilityImage(facilityId: number, file: File) {
  const supabase = createClient();

  // 日付文字列を取得
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ""); // yyyymmdd

  // 次のインデックス番号を取得
  const index = await getNextImageIndex(facilityId, dateStr);

  const originalPath = generateFacilityImagePath(facilityId, file.name, index);

  // オリジナル画像をアップロード
  const { data, error } = await supabase.storage
    .from("facility-images")
    .upload(originalPath, file);

  if (error) {
    throw new Error(`画像のアップロードに失敗しました: ${error.message}`);
  }

  return {
    originalPath,
    thumbnailPath: generateFacilityImagePath(facilityId, file.name, index, true),
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
 * 施設のservice_idを取得
 * @param facilityId 施設ID
 * @returns service_id
 */
async function getFacilityServiceId(facilityId: number): Promise<number | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("facilities")
    .select("service_id")
    .eq("id", facilityId)
    .single();

  if (error) {
    console.error("施設のservice_id取得エラー:", error);
    return null;
  }

  return data?.service_id ?? null;
}

/**
 * 施設画像をDBに保存（facility_id + display_orderが重複する場合は更新）
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

  // 施設のservice_idを取得
  const serviceId = await getFacilityServiceId(facilityId);

  // 既存のレコードを確認
  const { data: existingRecord } = await supabase
    .from("facility_images")
    .select("id")
    .eq("facility_id", facilityId)
    .eq("display_order", displayOrder)
    .single();

  if (existingRecord) {
    // 既存レコードが存在する場合は更新
    const { data, error } = await supabase
      .from("facility_images")
      .update({
        service_id: serviceId,
        image_path: imagePath,
        thumbnail_path: thumbnailPath,
        file_size: fileSize,
        mime_type: mimeType,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingRecord.id)
      .select()
      .single();

    if (error) {
      throw new Error(`DBの更新に失敗しました: ${error.message}`);
    }

    return data;
  } else {
    // 新規レコードを作成
    const { data, error } = await supabase
      .from("facility_images")
      .insert({
        facility_id: facilityId,
        service_id: serviceId,
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
 * 画像をリサイズ（Edge Function呼び出し）
 * オリジナル: 600x400、サムネイル: 225x150
 * @param bucketName バケット名
 * @param imagePath オリジナル画像のパス
 * @param thumbnailPath サムネイル画像のパス
 */
async function resizeImages(
  bucketName: string,
  imagePath: string,
  thumbnailPath: string
) {
  const supabase = createClient();

  const { data, error } = await supabase.functions.invoke("resize-image", {
    body: {
      bucketName,
      imagePath,
      thumbnailPath,
      originalWidth: 600,
      originalHeight: 400,
      thumbnailWidth: 225,
      thumbnailHeight: 150,
    },
  });

  if (error) {
    console.error("画像のリサイズに失敗しました:", error);
    throw new Error(`画像のリサイズに失敗しました: ${error.message}`);
  }

  return data;
}

/**
 * 施設画像を完全にアップロード（Storage + DB + サムネイル生成）
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
  const supabase = createClient();

  // 0. 既存レコードを確認し、古い画像があれば削除
  const { data: existingRecord } = await supabase
    .from("facility_images")
    .select("image_path, thumbnail_path")
    .eq("facility_id", facilityId)
    .eq("display_order", displayOrder)
    .single();

  if (existingRecord) {
    // 古い画像をStorageから削除
    try {
      const pathsToDelete = [existingRecord.image_path];
      if (existingRecord.thumbnail_path) {
        pathsToDelete.push(existingRecord.thumbnail_path);
      }
      await supabase.storage.from("facility-images").remove(pathsToDelete);
    } catch (error) {
      console.error("古い画像の削除エラー:", error);
      // 削除に失敗しても続行
    }
  }

  // 1. Storageにアップロード
  const { originalPath, thumbnailPath } = await uploadFacilityImage(
    facilityId,
    file
  );

  // 2. 画像リサイズ（Edge Function呼び出し）
  // オリジナル: 600x400、サムネイル: 225x150
  try {
    await resizeImages("facility-images", originalPath, thumbnailPath);
  } catch (error) {
    console.error("画像リサイズエラー:", error);
    // リサイズに失敗してもオリジナル画像のアップロードは成功しているので続行
  }

  // 3. DBに保存（既存レコードがあれば更新）
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
