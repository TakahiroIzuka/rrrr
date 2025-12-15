# Google Place APIによる施設レビュー取得バッチ処理

## 概要
1日1回、Google Place APIを使って全施設の星評価（rating）とレビュー人数（userRatingCount）を取得し、`facility_details`テーブルを更新する。

## 実装内容

### 1. データベース（マイグレーション）

#### 1.1 `fetch_review_detail_tasks`テーブル作成
```sql
CREATE TABLE fetch_review_detail_tasks (
  id BIGSERIAL PRIMARY KEY,
  facility_id INTEGER NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  facility_name TEXT NOT NULL,                       -- 施設名（facility_details.nameのコピー）
  status TEXT NOT NULL DEFAULT 'pending',            -- pending/completed/failed/skipped
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_fetch_review_detail_tasks_facility_id ON fetch_review_detail_tasks(facility_id);
CREATE INDEX idx_fetch_review_detail_tasks_status ON fetch_review_detail_tasks(status);
```

#### 1.2 `facility_details`にPlace IDカラム追加
```sql
ALTER TABLE facility_details ADD COLUMN google_place_id TEXT;
CREATE INDEX idx_facility_details_google_place_id ON facility_details(google_place_id);
```

### 2. Edge Function

#### `supabase/functions/fetch-review-details/index.ts`
処理フロー:
1. 全施設のタスクを作成（facility_id, facility_name）
2. 各タスクを処理:
   - `google_place_id`が未設定 → ステータスを`skipped`に更新
   - Place Details APIでrating, userRatingCountを取得
   - `facility_details`を更新
   - タスクステータスを`completed`に更新（失敗時は`failed`）

### 3. pg_cron設定

```sql
-- 毎日午前3時（JST）= UTC 18:00 に実行
SELECT cron.schedule(
  'fetch-review-details-daily',
  '0 18 * * *',
  $$
  SELECT net.http_post(
    url := 'https://[project-ref].supabase.co/functions/v1/fetch-review-details',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer [SERVICE_ROLE_KEY]"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

### 4. 環境変数
- `GOOGLE_PLACES_API_KEY`: Google Places API キー（Supabase Dashboardで設定）

## 実装順序

| # | タスク | ファイル |
|---|--------|---------|
| 1 | fetch_review_detail_tasksテーブル作成 | `supabase/migrations/YYYYMMDDHHMMSS_create_fetch_review_detail_tasks.sql` |
| 2 | google_place_idカラム追加 | `supabase/migrations/YYYYMMDDHHMMSS_add_google_place_id_to_facility_details.sql` |
| 3 | Edge Function作成 | `supabase/functions/fetch-review-details/index.ts` |
| 4 | 環境変数設定 | Supabase Dashboard |
| 5 | pg_cron設定 | SQLエディタで実行 |
| 6 | テスト | 手動実行で動作確認 |

## 参考ファイル
- `supabase/migrations/20251213111956_create_review_check_tasks_table.sql` - タスクテーブルパターン
- `supabase/functions/process-review-tasks/index.ts` - バッチ処理パターン

## API料金目安（9施設の場合）
- 約$5.4/月（Place Details API: 9施設 × 30日 × $0.02）
