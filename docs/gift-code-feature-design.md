# ギフトコード送信機能 設計書

## 1. 概要

クチコミ投稿者へのインセンティブとして、管理者承認後にギフトコードをメール送信する機能を実装する。

---

## 2. データベース設計

### 2.1 新規テーブル

#### gift_code_amounts（ギフトコード金額マスタ）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | SERIAL | PRIMARY KEY | 主キー |
| amount | INTEGER | NOT NULL, UNIQUE | 金額（ユニーク） |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 更新日時 |

#### gift_codes（ギフトコード）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | BIGSERIAL | PRIMARY KEY | 主キー |
| gift_code_amount_id | INTEGER | NOT NULL, FK → gift_code_amounts(id) | 金額マスタID |
| code | TEXT | NOT NULL, UNIQUE | ギフトコード（ユニーク） |
| used | BOOLEAN | NOT NULL, DEFAULT FALSE | 使用済みフラグ |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 更新日時 |

### 2.2 既存テーブルの変更

#### facilities テーブルへの追加カラム

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| gift_code_amount_id | INTEGER | FK → gift_code_amounts(id), NULL許可 | 施設に紐づくギフトコード金額 |

#### review_checks テーブルへの追加カラム

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| gift_code_status | TEXT | DEFAULT 'none' | ギフトコード送信ステータス |

**gift_code_status の値:**
| 値 | 表示名 | 説明 |
|-----|--------|------|
| none | - | ギフトコード対象外（施設にgift_code_amount_id未設定） |
| pending | 未送信 | 送信待ち（承認前） |
| sent | 送信済 | ギフトコード送信完了 |
| out_of_stock | 在庫無 | 該当金額のギフトコードが不足 |

### 2.3 削除制約

`gift_code_amounts`のレコードは以下の条件で削除不可：
- `gift_codes`テーブルに紐づくレコードが存在する場合
- `facilities`テーブルに紐づくレコードが存在する場合

→ **ON DELETE RESTRICT** を設定

### 2.4 ER図

```
gift_code_amounts
├── id (PK)
├── amount (UNIQUE)
├── created_at
└── updated_at
        │
        ├──────────────────┐
        │                  │
        ▼                  ▼
   gift_codes          facilities
   ├── id (PK)         ├── id (PK)
   ├── gift_code_      ├── gift_code_
   │   amount_id (FK)  │   amount_id (FK)
   ├── code (UNIQUE)   ├── ... (既存カラム)
   ├── used            └──────────────────
   ├── created_at
   └── updated_at
```

### 2.5 マイグレーションSQL

```sql
-- ギフトコード金額マスタテーブル
CREATE TABLE gift_code_amounts (
  id SERIAL PRIMARY KEY,
  amount INTEGER NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ギフトコードテーブル
CREATE TABLE gift_codes (
  id BIGSERIAL PRIMARY KEY,
  gift_code_amount_id INTEGER NOT NULL REFERENCES gift_code_amounts(id) ON DELETE RESTRICT,
  code TEXT NOT NULL UNIQUE,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_gift_codes_amount_id ON gift_codes(gift_code_amount_id);
CREATE INDEX idx_gift_codes_used ON gift_codes(used);

-- facilitiesテーブルにカラム追加
ALTER TABLE facilities
ADD COLUMN gift_code_amount_id INTEGER REFERENCES gift_code_amounts(id) ON DELETE RESTRICT;

-- review_checksテーブルにギフトコードステータスカラム追加
ALTER TABLE review_checks
ADD COLUMN gift_code_status TEXT DEFAULT 'none';

-- updated_at自動更新トリガー（gift_code_amounts用）
CREATE OR REPLACE FUNCTION update_gift_code_amounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_gift_code_amounts_updated_at
  BEFORE UPDATE ON gift_code_amounts
  FOR EACH ROW
  EXECUTE FUNCTION update_gift_code_amounts_updated_at();

-- updated_at自動更新トリガー（gift_codes用）
CREATE OR REPLACE FUNCTION update_gift_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_gift_codes_updated_at
  BEFORE UPDATE ON gift_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_gift_codes_updated_at();
```

---

## 3. 画面設計

### 3.1 管理画面メニュー構成（変更後）

```
管理画面 (/management)
├── トップ (/management)
│   ├── クチコミ一覧（既存）
│   └── ギフトコード一覧（新規）★
│
├── 会社管理/一覧 (/management/companies)
├── ユーザー一覧 (/management/users)
├── 施設一覧 (/management/facilities)
│   └── 施設編集でギフトコード金額選択 ★
├── クチコミ一覧 (/management/reviews)
│
└── マスタ管理（管理者のみ）
    ├── サービス (/management/masters/services)
    ├── ジャンル (/management/masters/genres)
    ├── 都道府県・地域 (/management/masters/regions)
    └── ギフトコード額 (/management/masters/gift-code-amounts) ★新規
```

### 3.2 マスタ管理 - ギフトコード額

**パス:** `/management/masters/gift-code-amounts`

**機能:**
- 金額マスタの一覧表示
- 新規登録（金額入力）
- 編集（金額変更）
- 削除（紐づくgift_codes/facilitiesが存在しない場合のみ）

**UI:**
```
┌─────────────────────────────────────────────────────┐
│ ギフトコード額マスタ                    [+ 新規登録] │
├─────────────────────────────────────────────────────┤
│ ID │ 金額        │ 登録日     │ 操作              │
├────┼─────────────┼────────────┼───────────────────┤
│ 1  │ ¥500       │ 2025/01/01 │ [編集] [削除]     │
│ 2  │ ¥1,000     │ 2025/01/01 │ [編集] [削除]     │
│ 3  │ ¥3,000     │ 2025/01/01 │ [編集] [削除]     │
└────┴─────────────┴────────────┴───────────────────┘
```

### 3.3 トップページ - ギフトコード一覧

**パス:** `/management` （クチコミ一覧の直下）

**機能:**
- 金額タブによる切り替え表示
- ギフトコードの一覧表示
- 新規登録（単体）
- CSV一括登録
- 編集（コード、金額、使用済みフラグ）
- 削除

**UI:**
```
┌─────────────────────────────────────────────────────────────────┐
│ ギフトコード一覧                    [+ 新規登録] [CSV一括登録]  │
├─────────────────────────────────────────────────────────────────┤
│ [¥500] [¥1,000] [¥3,000]  ← 金額タブ                           │
├─────────────────────────────────────────────────────────────────┤
│ ID │ コード          │ 使用状態 │ 登録日     │ 操作            │
├────┼─────────────────┼──────────┼────────────┼─────────────────┤
│ 1  │ GIFT-ABC-12345  │ 未使用   │ 2025/01/01 │ [編集] [削除]   │
│ 2  │ GIFT-DEF-67890  │ 使用済み │ 2025/01/01 │ [編集] [削除]   │ ← 背景グレー
│ 3  │ GIFT-GHI-11111  │ 未使用   │ 2025/01/02 │ [編集] [削除]   │
└────┴─────────────────┴──────────┴────────────┴─────────────────┘
```

**表示スタイル:**
- 未使用コード: 通常の背景色（白）
- 使用済みコード: 背景色グレー（`bg-gray-100`）で視覚的に区別

**CSV一括登録ダイアログ:**
```
┌─────────────────────────────────────────────────────┐
│ CSV一括登録                                    [×] │
├─────────────────────────────────────────────────────┤
│                                                     │
│ CSVファイル形式:                                    │
│ gift_code,gift_code_amount                          │
│ GIFT-ABC-12345,500                                  │
│ GIFT-DEF-67890,1000                                 │
│                                                     │
│ ┌───────────────────────────────────────────────┐  │
│ │ ファイルをドラッグ＆ドロップ                  │  │
│ │ または [ファイルを選択]                       │  │
│ └───────────────────────────────────────────────┘  │
│                                                     │
│ [キャンセル]                        [登録]         │
└─────────────────────────────────────────────────────┘
```

**CSV登録結果:**
```
┌─────────────────────────────────────────────────────┐
│ 登録結果                                       [×] │
├─────────────────────────────────────────────────────┤
│ 成功: 8件                                           │
│ エラー: 2件                                         │
│                                                     │
│ エラー詳細:                                         │
│ - 行3: コード重複 (GIFT-ABC-12345)                  │
│ - 行5: 金額マスタ未登録 (2000)                      │
│                                                     │
│                                         [閉じる]   │
└─────────────────────────────────────────────────────┘
```

### 3.4 施設編集画面 - ギフトコード金額選択

**パス:** `/management/facilities/[id]/edit`

**追加項目:**
- ギフトコード金額（セレクトボックス）

**UI:**
```
┌─────────────────────────────────────────────────────┐
│ 施設編集                                            │
├─────────────────────────────────────────────────────┤
│ 施設名: [                                    ]      │
│ ...（既存項目）                                     │
│                                                     │
│ ギフトコード金額:                                   │
│ ┌──────────────────────────────────────────────┐   │
│ │ 選択してください                          ▼  │   │
│ │ ─────────────────────────────────────────── │   │
│ │ 選択なし                                     │   │
│ │ ¥500                                         │   │
│ │ ¥1,000                                       │   │
│ │ ¥3,000                                       │   │
│ └──────────────────────────────────────────────┘   │
│                                                     │
│ [キャンセル]                          [保存]       │
└─────────────────────────────────────────────────────┘
```

---

## 4. API設計

### 4.1 新規API

#### ギフトコード金額マスタ

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/gift-code-amounts` | 金額一覧取得 |
| POST | `/api/gift-code-amounts` | 金額登録 |
| PUT | `/api/gift-code-amounts/[id]` | 金額更新 |
| DELETE | `/api/gift-code-amounts/[id]` | 金額削除 |

#### ギフトコード

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/gift-codes` | コード一覧取得（?amount_id=でフィルタ可） |
| POST | `/api/gift-codes` | コード登録（単体） |
| POST | `/api/gift-codes/bulk` | コードCSV一括登録 |
| PUT | `/api/gift-codes/[id]` | コード更新 |
| DELETE | `/api/gift-codes/[id]` | コード削除 |

### 4.2 既存API変更

#### 施設API

| メソッド | パス | 変更内容 |
|---------|------|---------|
| PUT | `/api/facilities/[id]` | `gift_code_amount_id`の保存に対応 |

#### 管理者承認API

| メソッド | パス | 変更内容 |
|---------|------|---------|
| POST/GET | `/api/review-checks/[id]/admin-approve` | ギフトコードメール送信処理を追加 |

---

## 5. メール送信機能設計

### 5.1 処理フロー

```
管理者が承認リンクをクリック
        │
        ▼
/api/review-checks/[id]/admin-approve
        │
        ├─ 1. トークン検証
        │
        ├─ 2. review_check → facility → gift_code_amount_id 取得
        │
        ├─ 3. gift_code_amount_id が NULL の場合
        │      └─ ギフトコード処理スキップ（gift_code_status = 'none' のまま）
        │
        ├─ 4. 未使用ギフトコードを1件取得
        │      (gift_codes WHERE gift_code_amount_id = ? AND used = FALSE LIMIT 1)
        │
        ├─ 5. ギフトコードが存在しない場合（在庫切れ）
        │      ├─ review_checks.gift_code_status = 'out_of_stock' に更新
        │      ├─ 管理者へギフトコード不足通知メール送信
        │      │   └─ Edge Function: send-gift-code-shortage-email
        │      └─ ユーザーへのギフトコードメールは送信しない
        │
        ├─ 6. ギフトコードが存在する場合
        │      ├─ ギフトコードメール送信
        │      │   └─ Edge Function: send-gift-code-email
        │      ├─ gift_codes.used = TRUE に更新
        │      └─ review_checks.gift_code_status = 'sent' に更新
        │
        └─ 7. 完了レスポンス
```

### 5.2 新規Edge Function

**ファイル:** `/supabase/functions/send-gift-code-email/index.ts`

**機能:**
- ギフトコードをメール本文に含めて送信
- 送信先: review_checks.email
- Resend API または SMTP で送信

**リクエストパラメータ:**
```typescript
{
  reviewCheckId: number;
  email: string;
  reviewerName: string;
  facilityName: string;
  giftCode: string;
  giftAmount: number;
}
```

**メールテンプレート例:**
```
件名: クチコミ投稿ありがとうございます - ギフトコードのご案内

{reviewerName} 様

この度は{facilityName}のクチコミ投稿ありがとうございました。

お礼として、下記のギフトコードをお送りいたします。

━━━━━━━━━━━━━━━━━━━━━━━━━━━
ギフトコード: {giftCode}
金額: ¥{giftAmount}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

※本コードは1回限り有効です。
※有効期限にご注意ください。

今後ともよろしくお願いいたします。
```

### 5.3 ギフトコード不足通知メール

**ファイル:** `/supabase/functions/send-gift-code-shortage-email/index.ts`

**機能:**
- ギフトコード在庫切れ時に管理者へ通知メール送信
- 送信先: 管理者メールアドレス（app_settingsから取得 or 環境変数）

**リクエストパラメータ:**
```typescript
{
  reviewCheckId: number;
  facilityName: string;
  giftAmount: number;
  reviewerName: string;
  reviewerEmail: string;
}
```

**メールテンプレート例:**
```
件名: 【要対応】ギフトコード在庫切れ - {facilityName}

管理者様

ギフトコードの在庫が不足しているため、
以下のクチコミ投稿者へギフトコードを送信できませんでした。

━━━━━━━━━━━━━━━━━━━━━━━━━━━
施設名: {facilityName}
対象金額: ¥{giftAmount}
投稿者名: {reviewerName}
投稿者メール: {reviewerEmail}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

ギフトコードを追加登録後、管理画面から再送信してください。

管理画面URL: {管理画面URL}/management
```

---

## 6. ファイル構成

### 6.1 新規作成ファイル

```
supabase/migrations/
└── YYYYMMDDHHMMSS_create_gift_code_tables.sql

supabase/functions/
├── send-gift-code-email/
│   └── index.ts
└── send-gift-code-shortage-email/
    └── index.ts

app/api/
├── gift-code-amounts/
│   ├── route.ts              # GET, POST
│   └── [id]/
│       └── route.ts          # PUT, DELETE
└── gift-codes/
    ├── route.ts              # GET, POST
    ├── bulk/
    │   └── route.ts          # POST (CSV一括登録)
    └── [id]/
        └── route.ts          # PUT, DELETE

app/management/masters/
└── gift-code-amounts/
    ├── page.tsx              # 一覧ページ
    ├── new/
    │   └── page.tsx          # 新規登録ページ
    └── [id]/
        └── edit/
            └── page.tsx      # 編集ページ

components/management/
├── GiftCodeAmountForm.tsx    # 金額マスタフォーム
├── GiftCodeAmountsList.tsx   # 金額マスタ一覧
├── GiftCodesList.tsx         # ギフトコード一覧
├── GiftCodeForm.tsx          # ギフトコードフォーム
└── GiftCodeCsvUpload.tsx     # CSV一括登録
```

### 6.2 変更ファイル

```
app/management/page.tsx                   # ギフトコード一覧追加
app/management/facilities/[id]/edit/page.tsx  # 金額選択追加
components/management/AdminSidebar.tsx    # メニュー追加
components/management/FacilityForm.tsx    # 金額選択フィールド追加

app/api/review-checks/[id]/admin-approve/route.ts  # ギフトコード送信処理追加

lib/email.ts                              # sendGiftCodeEmail関数追加（必要に応じて）
```

---

## 7. 実装順序

### Phase 1: データベース
1. マイグレーションファイル作成・実行
2. RLSポリシー設定（必要に応じて）

### Phase 2: マスタ管理画面
1. 金額マスタAPI（CRUD）
2. 金額マスタ管理画面
3. AdminSidebarにメニュー追加

### Phase 3: ギフトコード管理画面
1. ギフトコードAPI（CRUD + CSV一括登録）
2. ギフトコード一覧コンポーネント
3. ギフトコードフォーム
4. CSV一括登録機能
5. トップページに一覧追加

### Phase 4: 施設設定
1. FacilityForm に金額選択追加
2. 施設API更新

### Phase 5: メール送信
1. send-gift-code-email Edge Function作成
2. admin-approve API更新
3. テスト

---

## 8. 注意事項

### 8.1 CSV一括登録

- 1行目はヘッダー行として扱う（`gift_code,gift_code_amount`）
- `gift_code_amount`列は数値のみを読み取る
- エラー行はスキップし、成功行のみ登録
- エラー内容は結果ダイアログで表示

**エラー条件:**
- `gift_code`が既存コードと重複
- `gift_code_amount`の値がマスタに存在しない

### 8.2 削除制約

- `gift_code_amounts`の削除時、紐づくレコードがある場合はエラーメッセージを表示
- 「このギフトコード額は使用中のため削除できません」

### 8.3 ギフトコード送信時

- 施設に`gift_code_amount_id`が設定されていない場合は送信スキップ（`gift_code_status = 'none'`）
- 該当金額の未使用コードが存在しない場合:
  - `gift_code_status = 'out_of_stock'` に設定
  - ユーザーへのギフトコードメールは送信しない
  - 管理者へギフトコード不足通知メールを送信
- トランザクションでコード取得〜使用済み更新を行い、重複送信を防止

### 8.4 在庫切れ後の再送信

- 管理画面のクチコミ一覧で「在庫無」ステータスのレコードを確認可能
- ギフトコード追加後、管理者が手動で再送信を実行できる機能を提供
- 再送信成功時は`gift_code_status = 'sent'`に更新
