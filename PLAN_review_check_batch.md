# クチコミチェック機能のバッチ処理化 実装計画

## 概要

現在、アンケート送信後に即時実行されているクチコミチェックを、1時間後と1日後にバッチ処理で実行するように変更する。
また、クチコミ確認後に施設承認→管理者承認の2段階承認フローを追加する。

## 現在の実装フロー

```
アンケート送信 → review_checks登録 → 即時Edge Function呼び出し → クチコミ確認 → メール送信
```

## 新しい実装フロー

```
アンケート送信 → review_checks登録 → review_check_tasks(2レコード)登録
                                         ↓
                              バッチ処理(1hour後/1day後)
                                         ↓
                              クチコミ確認 → ステータス更新
                                         ↓
                              [Confirmed] 施設承認依頼メール送信
                                         ↓
                              施設承認 → is_approved=true → 管理者承認依頼メール送信
                                         ↓
                              管理者承認 → is_giftcode_sent=true
```

---

## 1. データベース変更

### 1.1 `review_check_tasks` テーブルの作成

```sql
CREATE TABLE review_check_tasks (
  id BIGSERIAL PRIMARY KEY,
  review_check_id BIGINT NOT NULL REFERENCES review_checks(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,  -- 実行予定時刻
  status TEXT NOT NULL DEFAULT 'pending',          -- pending, confirmed, already_confirmed, failed
  confirmed_review_id TEXT,                        -- 確認したレビューのID（Apifyから取得）
  executed_at TIMESTAMP WITH TIME ZONE,            -- 実際の実行時刻
  error_message TEXT,                              -- 失敗時のエラーメッセージ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_review_check_tasks_review_check_id ON review_check_tasks(review_check_id);
CREATE INDEX idx_review_check_tasks_status_scheduled ON review_check_tasks(status, scheduled_at);
```

### 1.2 `facility_details` テーブルの変更

#### 1.2.1 `review_approval_email` カラムを追加

```sql
ALTER TABLE facility_details ADD COLUMN review_approval_email TEXT;

COMMENT ON COLUMN facility_details.review_approval_email IS 'レビュー承認依頼メールを受け取るメールアドレス';
```

#### 1.2.2 `confirm_email` カラムを削除

```sql
ALTER TABLE facility_details DROP COLUMN confirm_email;
```

### 1.3 `review_checks` テーブルにカラムを追加

```sql
ALTER TABLE review_checks
  ADD COLUMN status TEXT NOT NULL DEFAULT 'pending',  -- pending, completed, failed
  ADD COLUMN facility_approval_token UUID DEFAULT gen_random_uuid(),
  ADD COLUMN admin_approval_token UUID DEFAULT gen_random_uuid();

COMMENT ON COLUMN review_checks.status IS 'クチコミチェック全体のステータス';
COMMENT ON COLUMN review_checks.facility_approval_token IS '施設承認用のセキュリティトークン';
COMMENT ON COLUMN review_checks.admin_approval_token IS '管理者承認用のセキュリティトークン';
```

### 1.4 ステータスの定義

#### `review_checks.status`（全体のステータス）

| ステータス | 説明 |
|-----------|------|
| `pending` | 処理中（承認待ちを含む） |
| `completed` | 完了（`is_giftcode_sent` = true） |
| `failed` | 失敗（両タスク失敗、またはエラー発生） |

**`failed` になる条件:**
- 紐づく `review_check_tasks` の2レコードが両方とも `failed` になった場合
- 施設承認依頼メールの送信に失敗した場合
- 管理者承認依頼メールの送信に失敗した場合
- その他の処理中にエラーが発生した場合

**`completed` になる条件:**
- `is_giftcode_sent` が `true` になった場合（管理者承認完了時）

#### `review_check_tasks.status`（個別タスクのステータス）

| ステータス | 説明 |
|-----------|------|
| `pending` | 未確認（バッチ処理待ち） |
| `confirmed` | クチコミ確認成功 |
| `already_confirmed` | 既に別タスクで確認済み |
| `failed` | クチコミ確認失敗 |

---

## 2. API変更

### 2.1 `/app/api/review-checks/route.ts` の修正

**変更内容:**
- Edge Function即時呼び出しを削除
- `review_check_tasks` に2レコード（1hour後、1day後）を挿入

**処理フロー:**
```typescript
// 1. review_checks にレコード挿入（トークンは自動生成）
const reviewCheck = await supabase.from('review_checks').insert({...}).select().single()

// 2. review_check_tasks に2レコード挿入
const now = new Date()
const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000)

await supabase.from('review_check_tasks').insert([
  { review_check_id: reviewCheck.id, scheduled_at: oneHourLater, status: 'pending' },
  { review_check_id: reviewCheck.id, scheduled_at: oneDayLater, status: 'pending' }
])
```

### 2.2 施設承認API（新規）`/app/api/review-checks/[id]/facility-approve/route.ts`

**役割:**
- 施設オーナーがメールのリンクをクリックして承認
- **トークン検証を実施**
- **既に承認済みの場合はスキップ**
- `review_checks.is_approved` を `true` に更新
- 管理者へ承認依頼メールを送信
- **メール送信失敗時は `review_checks.status` を `failed` に更新**

```typescript
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const reviewCheckId = params.id
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  // トークン検証
  const { data: reviewCheck } = await supabase
    .from('review_checks')
    .select('facility_approval_token, admin_approval_token, reviewer_name, facility_id, is_approved')
    .eq('id', reviewCheckId)
    .single()

  if (!reviewCheck || reviewCheck.facility_approval_token !== token) {
    return NextResponse.json({ error: '無効なトークンです' }, { status: 403 })
  }

  // 既に承認済みの場合はスキップ
  if (reviewCheck.is_approved) {
    return NextResponse.json({ message: '既に承認済みです' }, { status: 200 })
  }

  // review_checks.is_approved を true に更新
  await supabase
    .from('review_checks')
    .update({ is_approved: true })
    .eq('id', reviewCheckId)

  // 管理者へ承認依頼メールを送信（admin_approval_tokenを含むURLで）
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL
  const emailSent = await sendAdminApprovalRequestEmail(ADMIN_EMAIL, reviewCheckId, reviewCheck.admin_approval_token, ...)

  if (!emailSent) {
    console.error(`Failed to send admin approval email for review_check_id: ${reviewCheckId}`)
    // review_checks.status を failed に更新
    await supabase
      .from('review_checks')
      .update({ status: 'failed' })
      .eq('id', reviewCheckId)
    return NextResponse.json({ error: '管理者への通知メール送信に失敗しました' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
```

### 2.3 管理者承認API（新規）`/app/api/review-checks/[id]/admin-approve/route.ts`

**役割:**
- 管理者がメールのリンクをクリックして承認
- **トークン検証を実施**
- **既に承認済みの場合はスキップ**
- `review_checks.is_giftcode_sent` を `true` に更新
- **`review_checks.status` を `completed` に更新**

```typescript
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const reviewCheckId = params.id
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  // トークン検証
  const { data: reviewCheck } = await supabase
    .from('review_checks')
    .select('admin_approval_token, is_giftcode_sent')
    .eq('id', reviewCheckId)
    .single()

  if (!reviewCheck || reviewCheck.admin_approval_token !== token) {
    return NextResponse.json({ error: '無効なトークンです' }, { status: 403 })
  }

  // 既に承認済みの場合はスキップ
  if (reviewCheck.is_giftcode_sent) {
    return NextResponse.json({ message: '既に承認済みです' }, { status: 200 })
  }

  // review_checks.is_giftcode_sent を true に、status を completed に更新
  await supabase
    .from('review_checks')
    .update({ is_giftcode_sent: true, status: 'completed' })
    .eq('id', reviewCheckId)

  return NextResponse.json({ success: true })
}
```

---

## 3. Edge Function変更

### 3.1 既存 `check-review/index.ts` の修正

**変更内容:**
- `review_check_id` ではなく `review_check_task_id` を受け取る
- ステータス更新ロジックの追加
- 重複確認ロジックの追加（`already_confirmed` 判定）
- 失敗時のエラーメール送信
- **成功時（confirmed）に施設承認依頼メールを送信**
- **`confirm_email` 関連のコードを削除**
- **`review_approval_email` が未設定の場合はエラーログを出力**

**新しい処理フロー:**

```typescript
// 1. review_check_task と関連する review_check を取得
const { data: task } = await supabase
  .from('review_check_tasks')
  .select('*, review_checks(*)')
  .eq('id', review_check_task_id)
  .single()

// 2. 既に同じ review_check_id で confirmed のタスクがあるか確認
const { data: existingConfirmed } = await supabase
  .from('review_check_tasks')
  .select('id, confirmed_review_id')
  .eq('review_check_id', task.review_check_id)
  .eq('status', 'confirmed')
  .neq('id', task.id)
  .single()

// 3. クチコミ確認処理
const reviews = await fetchGoogleMapReviews(googleMapUrl)
const { matched, reviewUrl, reviewId } = findMatchingReview(reviews, googleAccountName)

// 4. ステータス更新
if (matched) {
  if (existingConfirmed && existingConfirmed.confirmed_review_id === reviewId) {
    // 既に確認済み → already_confirmed
    await updateTaskStatus(task.id, 'already_confirmed')
    // 何もしない
  } else {
    // 新規確認 → confirmed
    await updateTaskStatus(task.id, 'confirmed', reviewId)
    await updateReviewCheck(task.review_check_id, { is_sent: true })

    // review_approval_email の確認
    if (!facilityDetail.review_approval_email) {
      console.error(`review_approval_email is not set for facility_id: ${task.review_checks.facility_id}`)
      // review_checks.status を failed に更新
      await updateReviewCheck(task.review_check_id, { status: 'failed' })
    } else {
      // 施設承認依頼メールを送信（facility_approval_tokenを含むURLで）
      const emailSent = await sendFacilityApprovalRequestEmail(
        facilityDetail.review_approval_email,
        task.review_check_id,
        task.review_checks.facility_approval_token,
        ...
      )
      if (!emailSent) {
        console.error(`Failed to send facility approval email for review_check_id: ${task.review_check_id}`)
        // review_checks.status を failed に更新
        await updateReviewCheck(task.review_check_id, { status: 'failed' })
      }
    }
  }
} else {
  // 確認失敗 → failed
  await updateTaskStatus(task.id, 'failed', null, 'クチコミが見つかりませんでした')
  await sendErrorEmail(...)  // アンケート送信者へ

  // 両方のタスクが failed かチェック
  const { data: allTasks } = await supabase
    .from('review_check_tasks')
    .select('status')
    .eq('review_check_id', task.review_check_id)

  const allFailed = allTasks?.every(t => t.status === 'failed')
  if (allFailed) {
    // review_checks.status を failed に更新
    await updateReviewCheck(task.review_check_id, { status: 'failed' })
  }
}
```

### 3.2 新規 `process-review-tasks/index.ts` の作成（バッチ処理用）

**役割:**
- 実行予定時刻を過ぎた `pending` ステータスのタスクを取得
- 各タスクに対して `check-review` Edge Functionを呼び出す

**処理フロー:**

```typescript
// 1. 実行すべきタスクを取得
const { data: tasks } = await supabase
  .from('review_check_tasks')
  .select('id')
  .eq('status', 'pending')
  .lte('scheduled_at', new Date().toISOString())
  .order('scheduled_at', { ascending: true })
  .limit(100)  // バッチサイズ制限

// 2. 各タスクに対して check-review を呼び出し
for (const task of tasks) {
  await fetch(`${supabaseUrl}/functions/v1/check-review`, {
    method: 'POST',
    body: JSON.stringify({ review_check_task_id: task.id })
  })
}
```

---

## 4. メール送信

### 4.1 施設承認依頼メール（新規）

- **送信タイミング:** クチコミ確認成功時（status = confirmed）
- **送信先:** `facility_details.review_approval_email`
- **内容:** トークン付き承認リンクの通知メール

```typescript
async function sendFacilityApprovalRequestEmail(
  toEmail: string,
  reviewCheckId: number,
  facilityApprovalToken: string,
  reviewerName: string,
  facilityName: string,
  reviewUrl: string
): Promise<boolean> {
  const approvalUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/review-checks/${reviewCheckId}/facility-approve?token=${facilityApprovalToken}`

  const body = `${facilityName} のオーナー様

新しいクチコミの確認が完了しました。
以下のリンクから承認をお願いします。

━━━━━━━━━━━━━━━━━━━━━━━━
施設名: ${facilityName}
投稿者: ${reviewerName} 様
クチコミURL: ${reviewUrl}
━━━━━━━━━━━━━━━━━━━━━━━━

▼ 承認する場合は以下のリンクをクリックしてください
${approvalUrl}

※このメールは自動送信されています。
※このリンクは本メールの受信者専用です。第三者への共有はお控えください。
`
  // SMTP送信処理
}
```

### 4.2 管理者承認依頼メール（新規）

- **送信タイミング:** 施設承認完了時（is_approved = true）
- **送信先:** 環境変数 `ADMIN_EMAILS` で設定した複数の管理者メールアドレス（カンマ区切り）
- **内容:** トークン付き承認リンクの通知メール

```typescript
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'admin@example.com').split(',').map(email => email.trim()).filter(Boolean)

async function sendAdminApprovalRequestEmail(
  reviewCheckId: number,
  adminApprovalToken: string,
  reviewerName: string,
  facilityName: string,
  reviewUrl: string
): Promise<boolean> {
  const approvalUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/review-checks/${reviewCheckId}/admin-approve?token=${adminApprovalToken}`

  const body = `管理者様

施設オーナーによるクチコミ承認が完了しました。
以下のリンクから最終承認をお願いします。

━━━━━━━━━━━━━━━━━━━━━━━━
施設名: ${facilityName}
投稿者: ${reviewerName} 様
クチコミURL: ${reviewUrl}
施設承認: 完了
━━━━━━━━━━━━━━━━━━━━━━━━

▼ 承認する場合は以下のリンクをクリックしてください
${approvalUrl}

※このメールは自動送信されています。
※このリンクは本メールの受信者専用です。第三者への共有はお控えください。
`
  // SMTP送信処理
}
```

### 4.3 失敗時メール（新規）

- **送信タイミング:** クチコミ確認失敗時（status = failed）
- **送信先:** アンケート送信者のメールアドレス（`review_checks.email`）
- **内容:** クチコミが確認できなかった旨の通知

```typescript
async function sendErrorNotificationEmail(
  toEmail: string,
  reviewerName: string,
  facilityName: string
): Promise<boolean> {
  const body = `${reviewerName} 様

${facilityName} のクチコミ投稿確認ができませんでした。

以下の理由が考えられます：
- クチコミがまだ公開されていない
- Googleアカウント名が一致しない
- クチコミが削除された

お手数ですが、クチコミ投稿状況をご確認ください。

※このメールは自動送信されています。
`
  // SMTP送信処理
}
```

---

## 5. バッチ実行のスケジューリング（pg_cron使用）

```sql
-- pg_cron拡張の有効化（Supabase Dashboardから設定）
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 5分ごとにバッチ処理を実行
SELECT cron.schedule(
  'process-review-tasks',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://[project-ref].supabase.co/functions/v1/process-review-tasks',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
```

---

## 6. 既存コードの削除・変更

### 6.1 既存の即時実行処理の削除

現在の即時実行フローを完全に削除し、バッチ処理に置き換える。

#### 削除対象

1. **API**
   - `/app/api/review-checks/route.ts`
     - `triggerReviewCheck()` 関数を削除
     - Edge Function即時呼び出し処理を削除

2. **Edge Function**
   - `supabase/functions/check-review/index.ts`
     - 現在の `review_check_id` を受け取る処理を `review_check_task_id` に変更
     - 既存の即時実行ロジックを新しいバッチ対応ロジックに置き換え

### 6.2 confirm_email 関連コードの削除

以下のファイルから `confirm_email` 関連のコードを削除する:

1. **Edge Function**
   - `supabase/functions/check-review/index.ts`
     - `confirm_email` の取得処理を削除
     - `sendReviewNotificationEmail` 関数を削除（`sendFacilityApprovalRequestEmail` に置き換え）

2. **マイグレーション**
   - 既存の `confirm_email` 追加マイグレーションは履歴として残す
   - 新規マイグレーションで `DROP COLUMN` を実行

3. **管理画面（存在する場合）**
   - `confirm_email` の編集フォームを削除
   - `review_approval_email` の編集フォームを追加

---

## 7. 承認フロー全体図

```
┌─────────────────────────────────────────────────────────────────────┐
│                        承認フロー                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. アンケート送信                                                   │
│     └─→ review_checks 登録（status=pending, トークン自動生成）       │
│     └─→ review_check_tasks 2レコード登録 (1hour後, 1day後)           │
│                                                                     │
│  2. バッチ処理（5分ごと）                                            │
│     └─→ scheduled_at を過ぎた pending タスクを処理                   │
│                                                                     │
│  3. クチコミ確認                                                     │
│     ├─→ [成功] task.status = confirmed                              │
│     │   └─→ is_sent = true                                         │
│     │   ├─→ review_approval_email が設定済み                        │
│     │   │   ├─→ メール送信成功 → 施設承認依頼メール送信              │
│     │   │   └─→ メール送信失敗 → review_checks.status = failed      │
│     │   └─→ review_approval_email が未設定                          │
│     │       └─→ review_checks.status = failed                       │
│     │                                                               │
│     ├─→ [失敗] task.status = failed                                 │
│     │   └─→ エラーメール送信 (→ アンケート送信者)                    │
│     │   └─→ 両タスクとも failed の場合                              │
│     │       └─→ review_checks.status = failed                       │
│     │                                                               │
│     └─→ [既確認] task.status = already_confirmed                    │
│         └─→ 何もしない                                              │
│                                                                     │
│  4. 施設承認（トークン付きリンクをクリック）                         │
│     └─→ トークン検証                                                │
│     └─→ is_approved = true                                          │
│     ├─→ メール送信成功 → 管理者承認依頼メール送信                    │
│     └─→ メール送信失敗 → review_checks.status = failed              │
│                                                                     │
│  5. 管理者承認（トークン付きリンクをクリック）                       │
│     └─→ トークン検証                                                │
│     └─→ is_giftcode_sent = true                                     │
│     └─→ review_checks.status = completed                            │
│     └─→ [完了]                                                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 8. 実装順序

### Phase 1: データベース
1. `review_check_tasks` テーブルのマイグレーション作成
2. `facility_details.review_approval_email` カラム追加のマイグレーション作成
3. `facility_details.confirm_email` カラム削除のマイグレーション作成
4. `review_checks` に `facility_approval_token`, `admin_approval_token` カラム追加のマイグレーション作成

### Phase 2: API変更
5. `/app/api/review-checks/route.ts` の修正
   - `review_check_tasks` への2レコード挿入を追加
   - Edge Function即時呼び出しを削除

6. `/app/api/review-checks/[id]/facility-approve/route.ts` の新規作成
   - トークン検証
   - 施設承認処理
   - 管理者承認依頼メール送信

7. `/app/api/review-checks/[id]/admin-approve/route.ts` の新規作成
   - トークン検証
   - 管理者承認処理

### Phase 3: Edge Function
8. `check-review/index.ts` の修正
   - `review_check_task_id` 対応
   - ステータス更新ロジック
   - 重複確認ロジック
   - 失敗時エラーメール送信
   - 成功時施設承認依頼メール送信（トークン付き）
   - `confirm_email` 関連コード削除
   - `review_approval_email` 未設定時のエラーログ出力

9. `process-review-tasks/index.ts` の新規作成
   - バッチ処理ロジック

### Phase 4: スケジューリング
10. pg_cronの設定（Supabase Dashboard または マイグレーション）

### Phase 5: 環境変数
11. 必要な環境変数の追加
   - `ADMIN_EMAILS`: 管理者メールアドレス（カンマ区切りで複数指定可能）
   - `NEXT_PUBLIC_BASE_URL`: 承認リンク用のベースURL

### Phase 6: 管理画面（オプション）
12. `review_check_tasks` の一覧表示機能（必要に応じて）
13. `facility_details.review_approval_email` の編集機能
14. `confirm_email` 関連のUI削除

---

## 9. 型定義の追加

```typescript
// types/database.ts に追加

export type ReviewCheckTaskStatus = 'pending' | 'confirmed' | 'failed' | 'already_confirmed'

export interface ReviewCheckTask {
  id: number
  review_check_id: number
  scheduled_at: string
  status: ReviewCheckTaskStatus
  confirmed_review_id: string | null
  executed_at: string | null
  error_message: string | null
  created_at: string
  updated_at: string
}

export type ReviewCheckStatus = 'pending' | 'completed' | 'failed'

// review_checks の型定義を更新
export interface ReviewCheck {
  id: number
  facility_id: number
  reviewer_name: string
  google_account_name: string
  email: string
  review_url: string | null
  review_star: number | null
  status: ReviewCheckStatus         // 追加
  is_sent: boolean
  is_approved: boolean
  is_giftcode_sent: boolean
  facility_approval_token: string   // 追加
  admin_approval_token: string      // 追加
  created_at: string
  updated_at: string
}
```

---

## 10. 考慮事項

### 10.1 既存データの移行
- 既存の `review_checks` はそのまま維持（移行不要）
- 既存レコードには `facility_approval_token`, `admin_approval_token` が NULL になるため、マイグレーションで既存レコードにもUUIDを生成する

```sql
-- 既存レコードにトークンを設定
UPDATE review_checks
SET
  facility_approval_token = gen_random_uuid(),
  admin_approval_token = gen_random_uuid()
WHERE facility_approval_token IS NULL;
```

### 10.2 タイムゾーン
- `scheduled_at` はUTCで保存
- 日本時間での1hour/1dayを計算する場合は注意

### 10.3 リトライ
- `failed` ステータスのタスクに対するリトライ機能は今回のスコープ外
- 必要に応じて将来追加可能

### 10.4 承認リンクのセキュリティ
- **トークンベース認証を導入**
- 各 `review_checks` レコードに `facility_approval_token` と `admin_approval_token` を持つ
- 承認API実行時にトークンを検証し、不一致の場合は403エラーを返す
- トークンはUUID形式で推測不可能

### 10.5 review_approval_email が未設定の場合
- エラーログを出力する
- メール送信はスキップする
- タスクのステータスは `confirmed` のまま（クチコミ確認自体は成功しているため）

---

## 11. テスト項目

### 基本フロー
1. アンケート送信時に `review_check_tasks` が2レコード作成されること
2. アンケート送信時に `review_checks` にトークンが自動生成されること
3. アンケート送信時に `review_checks.status` が `pending` になること
4. 1時間後のタスクが正しく実行されること
5. 1日後のタスクが正しく実行されること

### クチコミ確認（タスク処理）
6. クチコミ確認成功時に `task.status` が `confirmed` になること
7. クチコミ確認成功時に施設承認依頼メールが送られること（`review_approval_email` 設定時）
8. `review_approval_email` 未設定時に `review_checks.status` が `failed` になること
9. 施設承認依頼メール送信失敗時に `review_checks.status` が `failed` になること
10. クチコミ確認失敗時に `task.status` が `failed` になること
11. クチコミ確認失敗時にアンケート送信者へエラーメールが送られること
12. 両タスクとも `failed` の場合に `review_checks.status` が `failed` になること
13. 既に確認済みの場合に `task.status` が `already_confirmed` になること
14. 既に確認済みの場合にメールが送られないこと

### 施設承認
15. 施設承認APIで正しいトークンの場合のみ承認されること
16. 施設承認APIで不正なトークンの場合は403エラーになること
17. 施設承認後に `is_approved` が `true` になること
18. 施設承認後に管理者承認依頼メールが送られること
19. 管理者承認依頼メール送信失敗時に `review_checks.status` が `failed` になること

### 管理者承認
20. 管理者承認APIで正しいトークンの場合のみ承認されること
21. 管理者承認APIで不正なトークンの場合は403エラーになること
22. 管理者承認後に `is_giftcode_sent` が `true` になること
23. 管理者承認後に `review_checks.status` が `completed` になること
