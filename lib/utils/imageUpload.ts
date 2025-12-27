import { createClient } from "@/lib/supabase/client";

/**
 * 施設画像のパスを生成（オリジナルとサムネイルのペア）
 * @param facilityId 施設ID
 * @param fileName ファイル名
 * @returns オリジナルとサムネイルのパス
 */
export function generateFacilityImagePaths(
  facilityId: number,
  fileName: string
): { originalPath: string; thumbnailPath: string } {
  const timestamp = Date.now();

  return {
    originalPath: `${facilityId}/images/${timestamp}_${fileName}`,
    thumbnailPath: `${facilityId}/images/thumb_${timestamp}_${fileName}`,
  };
}

/**
 * 施設画像をアップロード
 * @param facilityId 施設ID
 * @param file アップロードするファイル
 * @returns アップロード結果
 */
export async function uploadFacilityImage(facilityId: number, file: File) {
  const supabase = createClient();

  const { originalPath, thumbnailPath } = generateFacilityImagePaths(facilityId, file.name);

  // オリジナル画像をアップロード
  const { data, error } = await supabase.storage
    .from("facility-images")
    .upload(originalPath, file, {
      upsert: true
    });

  if (error) {
    throw new Error(`画像のアップロードに失敗しました: ${error.message}`);
  }

  return {
    originalPath,
    thumbnailPath,
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
      thumbnailWidth: 350,
      thumbnailHeight: 234,
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
/**
 * ロゴ画像のパスを生成
 * @param facilityId 施設ID
 * @param fileName ファイル名
 * @returns 画像のパス
 */
export function generateFacilityLogoPath(
  facilityId: number,
  fileName: string
): string {
  return `${facilityId}/logo/${fileName}`;
}

/**
 * ロゴ画像をStorageにアップロード
 * @param facilityId 施設ID
 * @param file アップロードするファイル
 * @returns アップロード結果
 */
export async function uploadFacilityLogoToStorage(facilityId: number, file: File) {
  const supabase = createClient();

  const logoPath = generateFacilityLogoPath(facilityId, file.name);

  const { data, error } = await supabase.storage
    .from("facility-images")
    .upload(logoPath, file, {
      upsert: true,
    });

  if (error) {
    throw new Error(`ロゴ画像のアップロードに失敗しました: ${error.message}`);
  }

  return {
    logoPath,
    data,
  };
}

/**
 * ロゴ画像をDBに保存
 * @param facilityId 施設ID
 * @param imagePath 画像のパス
 * @param fileSize ファイルサイズ
 * @param mimeType MIMEタイプ
 */
export async function saveFacilityLogoToDb(
  facilityId: number,
  logoPath: string,
  fileSize: number | null = null,
  mimeType: string | null = null
) {
  const supabase = createClient();

  const serviceId = await getFacilityServiceId(facilityId);

  // 既存のロゴレコードを確認
  const { data: existingRecord } = await supabase
    .from("facility_images")
    .select("id")
    .eq("facility_id", facilityId)
    .eq("is_logo", true)
    .single();

  if (existingRecord) {
    // 既存レコードを更新
    const { data, error } = await supabase
      .from("facility_images")
      .update({
        service_id: serviceId,
        image_path: null,
        thumbnail_path: logoPath,
        file_size: fileSize,
        mime_type: mimeType,
        display_order: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingRecord.id)
      .select()
      .single();

    if (error) {
      throw new Error(`ロゴのDB更新に失敗しました: ${error.message}`);
    }

    return data;
  } else {
    // 新規レコードを作成
    const { data, error } = await supabase
      .from("facility_images")
      .insert({
        facility_id: facilityId,
        service_id: serviceId,
        image_path: null,
        thumbnail_path: logoPath,
        file_size: fileSize,
        mime_type: mimeType,
        display_order: null,
        is_logo: true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`ロゴのDB保存に失敗しました: ${error.message}`);
    }

    return data;
  }
}

/**
 * ロゴ画像をリサイズ（150x150、サムネイルなし）
 * @param bucketName バケット名
 * @param imagePath 画像のパス
 */
async function resizeLogoImage(bucketName: string, imagePath: string) {
  const supabase = createClient();

  const { data, error } = await supabase.functions.invoke("resize-image", {
    body: {
      bucketName,
      imagePath,
      thumbnailPath: null, // サムネイルなし
      originalWidth: 150,
      originalHeight: 150,
    },
  });

  if (error) {
    console.error("ロゴ画像のリサイズに失敗しました:", error);
    throw new Error(`ロゴ画像のリサイズに失敗しました: ${error.message}`);
  }

  return data;
}

/**
 * 施設のロゴ画像を取得
 * @param facilityId 施設ID
 * @returns ロゴ画像データ
 */
export async function getFacilityLogo(facilityId: number) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("facility_images")
    .select("*")
    .eq("facility_id", facilityId)
    .eq("is_logo", true)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`ロゴ画像の取得に失敗しました: ${error.message}`);
  }

  return data;
}

/**
 * ロゴ画像を完全にアップロード（Storage + リサイズ + DB）
 * @param facilityId 施設ID
 * @param file アップロードするファイル
 * @returns アップロード結果
 */
export async function uploadFacilityLogoComplete(
  facilityId: number,
  file: File
) {
  const supabase = createClient();

  // 0. 既存のロゴがあれば削除
  const { data: existingRecord } = await supabase
    .from("facility_images")
    .select("thumbnail_path")
    .eq("facility_id", facilityId)
    .eq("is_logo", true)
    .single();

  if (existingRecord?.thumbnail_path) {
    try {
      await supabase.storage
        .from("facility-images")
        .remove([existingRecord.thumbnail_path]);
    } catch (error) {
      console.error("古いロゴ画像の削除エラー:", error);
    }
  }

  // 1. Storageにアップロード
  const { logoPath } = await uploadFacilityLogoToStorage(facilityId, file);

  // 2. 画像リサイズ（200x200、サムネイルなし）
  try {
    await resizeLogoImage("facility-images", logoPath);
  } catch (error) {
    console.error("ロゴリサイズエラー:", error);
  }

  // 3. DBに保存
  const logoData = await saveFacilityLogoToDb(
    facilityId,
    logoPath,
    file.size,
    file.type
  );

  return {
    ...logoData,
    publicUrl: getFacilityImageUrl(logoPath),
  };
}

/**
 * ロゴ画像を削除
 * @param facilityId 施設ID
 */
export async function deleteFacilityLogo(facilityId: number) {
  const supabase = createClient();

  const { data: existingRecord } = await supabase
    .from("facility_images")
    .select("id, thumbnail_path")
    .eq("facility_id", facilityId)
    .eq("is_logo", true)
    .single();

  if (!existingRecord) {
    return;
  }

  // Storageから削除
  if (existingRecord.thumbnail_path) {
    try {
      await supabase.storage
        .from("facility-images")
        .remove([existingRecord.thumbnail_path]);
    } catch (error) {
      console.error("ロゴ画像のStorage削除エラー:", error);
    }
  }

  // DBから削除
  const { error } = await supabase
    .from("facility_images")
    .delete()
    .eq("id", existingRecord.id);

  if (error) {
    throw new Error(`ロゴ画像のDB削除に失敗しました: ${error.message}`);
  }
}

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
