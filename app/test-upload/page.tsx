"use client";

import { ImageUpload } from "@/components/facility/ImageUpload";
import { useState } from "react";

export default function TestUploadPage() {
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">画像アップロードテスト</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">施設ID: 1 の画像をアップロード</h2>
        <ImageUpload
          facilityId={1}
          onUploadSuccess={(imageData) => {
            console.log("アップロード成功:", imageData);
            setUploadedImages((prev) => [...prev, imageData]);
            alert("画像のアップロードに成功しました！");
          }}
          onUploadError={(error) => {
            console.error("アップロードエラー:", error);
            alert(`エラー: ${error.message}`);
          }}
        />
      </div>

      {uploadedImages.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">アップロード済み画像</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {uploadedImages.map((image, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">画像 {index + 1}</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium">オリジナル画像:</p>
                    <img
                      src={image.publicUrl}
                      alt="Original"
                      className="w-full max-w-xs rounded"
                    />
                    <a
                      href={image.publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 text-sm"
                    >
                      URLを開く
                    </a>
                  </div>
                  <div>
                    <p className="text-sm font-medium">サムネイル画像:</p>
                    {image.thumbnailUrl ? (
                      <>
                        <img
                          src={image.thumbnailUrl}
                          alt="Thumbnail"
                          className="w-32 h-32 rounded border"
                        />
                        <a
                          href={image.thumbnailUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 text-sm"
                        >
                          URLを開く
                        </a>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">サムネイル生成中...</p>
                    )}
                  </div>
                  <div className="text-xs text-gray-600">
                    <p>パス: {image.image_path}</p>
                    <p>サムネイルパス: {image.thumbnail_path}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold mb-2">テスト手順:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>画像を選択してアップロード</li>
          <li>
            アップロード成功後、Supabase Studioで確認:{" "}
            <a
              href="http://localhost:54323/project/default/storage/buckets/facility-images"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500"
            >
              http://localhost:54323
            </a>
          </li>
          <li>オリジナル画像（600×400px）とサムネイル（thumb_プレフィックス、225×150px）が保存されているか確認</li>
          <li>画像サイズが正しくリサイズされているか確認</li>
        </ol>
      </div>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold mb-2">注意事項:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Edge Functionが起動していることを確認してください</li>
          <li>
            起動コマンド:{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">
              npx supabase functions serve resize-image --no-verify-jwt
            </code>
          </li>
          <li>画像リサイズ（600×400px、225×150px）には数秒かかる場合があります</li>
          <li>ページをリロードするとアップロード履歴はクリアされます</li>
        </ul>
      </div>
    </div>
  );
}
