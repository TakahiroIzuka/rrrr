# Supabase Edge Functions

## resize-image

施設画像のサムネイル（150x150px）を自動生成するEdge Functionです。

### 🔄 自動サムネイル生成

**Database Triggerにより、画像アップロード時に自動的にサムネイルが生成されます。**

- ✅ アプリケーションからのアップロード → 自動でサムネイル生成
- ✅ Supabase Studioからのアップロード → 自動でサムネイル生成
- ✅ Storage APIへの直接アップロード → 自動でサムネイル生成

対象ファイル：
- バケット: `facility-images`
- 画像形式: jpg, jpeg, png, gif, webp
- 除外: `thumb_` で始まるファイル（サムネイル自身）

### ローカル環境での実行

1. **Edge Functionを起動**

```bash
npx supabase functions serve resize-image --no-verify-jwt
```

2. **別のターミナルで開発サーバーを起動**

```bash
npm run dev
```

3. **画像をアップロード**

- アプリケーションから画像をアップロード
- または、Supabase Studio (http://localhost:54323/project/default/storage/buckets) から直接アップロード

いずれの方法でも、自動的にサムネイルが生成されます。

### 本番環境へのデプロイ

```bash
npx supabase functions deploy resize-image
```

### 手動テスト

curlでEdge Functionを直接テストする場合：

```bash
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/resize-image' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"bucketName":"facility-images","imagePath":"1/20251018/test.jpg","thumbnailPath":"1/20251018/thumb_test.jpg","width":150,"height":150}'
```

### トラブルシューティング

#### Edge Runtimeが起動しない場合

```bash
npx supabase stop
npx supabase start
```

#### サムネイル生成が失敗する場合

1. ブラウザのコンソールログを確認
2. Edge Functionのログを確認：
   ```bash
   npx supabase functions serve resize-image --no-verify-jwt
   ```

### 注意事項

- ローカル環境では`--no-verify-jwt`オプションを使用してJWT検証をスキップできます
- 本番環境では適切な認証が必要です
- 画像のリサイズには時間がかかる場合があります（特に大きな画像の場合）

## 技術詳細

### Database Trigger による自動実行

`storage.objects` テーブルに対するDatabase Triggerが設定されており、画像がアップロードされると自動的にサムネイル生成が実行されます。

**Trigger関数**: `public.generate_thumbnail_on_upload()`
- マイグレーション: `20251018051547_create_thumbnail_trigger.sql`
- トリガー名: `on_facility_image_upload`

**動作フロー**:
1. 画像が `facility-images` バケットにアップロードされる
2. Database Trigger が発火
3. pg_net エクステンションを使用してEdge Functionを非同期呼び出し
4. Edge Function がサムネイルを生成してStorageに保存

**サムネイルパスの規則**:
- オリジナル: `{facility_id}/{date}/image.jpg`
- サムネイル: `{facility_id}/{date}/thumb_image.jpg`
