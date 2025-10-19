"use client";

import { ImageUpload } from "@/components/facility/ImageUpload";
import { useState } from "react";

interface UploadedImage {
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

export default function UploadPage() {
  const [facilityId, setFacilityId] = useState<number>(1);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleUploadSuccess = (imageData: UploadedImage) => {
    console.log("アップロード成功:", imageData);
    setUploadedImages((prev) => [...prev, imageData]);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleUploadError = (error: Error) => {
    console.error("アップロードエラー:", error);
    setErrorMessage(error.message);
    setShowError(true);
    setTimeout(() => setShowError(false), 5000);
  };

  return (
    <div className="container mx-auto max-w-4xl p-8">
      <h1 className="text-3xl font-bold mb-8">画像アップロード</h1>

      {/* 成功メッセージ */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          画像のアップロードに成功しました！
        </div>
      )}

      {/* エラーメッセージ */}
      {showError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          エラー: {errorMessage}
        </div>
      )}

      {/* 施設ID入力 */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border">
        <label className="block mb-4">
          <span className="text-sm font-medium text-gray-700 mb-2 block">
            施設ID
          </span>
          <input
            type="number"
            value={facilityId}
            onChange={(e) => setFacilityId(Number(e.target.value))}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
          />
          <p className="mt-2 text-sm text-gray-500">
            アップロード先の施設IDを入力してください
          </p>
        </label>

        {/* アップロードコンポーネント */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">画像を選択</h2>
          <ImageUpload
            facilityId={facilityId}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
        </div>
      </div>

      {/* アップロード済み画像一覧 */}
      {uploadedImages.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">
            アップロード済み画像 ({uploadedImages.length}枚)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {uploadedImages.map((image, index) => (
              <div
                key={image.id}
                className="border rounded-lg p-6 bg-white shadow-sm"
              >
                <h3 className="font-semibold mb-4 text-lg">
                  画像 #{uploadedImages.length - index}
                </h3>
                <div className="space-y-4">
                  {/* オリジナル画像 */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      オリジナル画像:
                    </p>
                    <img
                      src={image.publicUrl}
                      alt="Original"
                      className="w-full rounded-lg border"
                    />
                    <a
                      href={image.publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm inline-block mt-2"
                    >
                      URLを開く →
                    </a>
                  </div>

                  {/* サムネイル画像 */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      サムネイル画像:
                    </p>
                    {image.thumbnailUrl ? (
                      <>
                        <img
                          src={image.thumbnailUrl}
                          alt="Thumbnail"
                          className="w-32 h-32 rounded-lg border object-cover"
                        />
                        <a
                          href={image.thumbnailUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm inline-block mt-2"
                        >
                          URLを開く →
                        </a>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">
                        サムネイル生成中...
                      </p>
                    )}
                  </div>

                  {/* メタ情報 */}
                  <div className="text-xs text-gray-600 space-y-1 pt-4 border-t">
                    <p>
                      <span className="font-medium">施設ID:</span>{" "}
                      {image.facility_id}
                    </p>
                    <p>
                      <span className="font-medium">パス:</span>{" "}
                      {image.image_path}
                    </p>
                    {image.thumbnail_path && (
                      <p>
                        <span className="font-medium">サムネイルパス:</span>{" "}
                        {image.thumbnail_path}
                      </p>
                    )}
                    {image.file_size && (
                      <p>
                        <span className="font-medium">ファイルサイズ:</span>{" "}
                        {(image.file_size / 1024).toFixed(2)} KB
                      </p>
                    )}
                    {image.mime_type && (
                      <p>
                        <span className="font-medium">ファイル形式:</span>{" "}
                        {image.mime_type}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 説明セクション */}
      <div className="space-y-4">
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold mb-3 text-blue-900">機能について:</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-blue-800">
            <li>画像を選択すると自動的にアップロードが開始されます</li>
            <li>
              オリジナル画像とサムネイル画像（150x150px）の両方がStorageに保存されます
            </li>
            <li>facility_imagesテーブルに画像情報が登録されます</li>
            <li>アップロード履歴はページをリロードするとクリアされます</li>
          </ul>
        </div>

        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold mb-3 text-yellow-900">注意事項:</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-yellow-800">
            <li>
              Edge Functionが起動していることを確認してください
              <br />
              起動コマンド:{" "}
              <code className="bg-yellow-100 px-2 py-1 rounded text-xs">
                npx supabase functions serve resize-image --no-verify-jwt
              </code>
            </li>
            <li>サムネイル生成には数秒かかる場合があります</li>
            <li>対応画像形式: JPEG, PNG, GIF, WebP など</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
