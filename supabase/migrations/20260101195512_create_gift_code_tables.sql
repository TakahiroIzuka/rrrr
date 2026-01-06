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

-- RLSポリシー設定
ALTER TABLE gift_code_amounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_codes ENABLE ROW LEVEL SECURITY;

-- gift_code_amounts: 認証済みユーザーは読み取り可能、管理者のみ書き込み可能
CREATE POLICY "gift_code_amounts_select_policy" ON gift_code_amounts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "gift_code_amounts_insert_policy" ON gift_code_amounts
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.type = 'admin'
    )
  );

CREATE POLICY "gift_code_amounts_update_policy" ON gift_code_amounts
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.type = 'admin'
    )
  );

CREATE POLICY "gift_code_amounts_delete_policy" ON gift_code_amounts
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.type = 'admin'
    )
  );

-- gift_codes: 認証済みユーザーは読み取り可能、管理者のみ書き込み可能
CREATE POLICY "gift_codes_select_policy" ON gift_codes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "gift_codes_insert_policy" ON gift_codes
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.type = 'admin'
    )
  );

CREATE POLICY "gift_codes_update_policy" ON gift_codes
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.type = 'admin'
    )
  );

CREATE POLICY "gift_codes_delete_policy" ON gift_codes
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.type = 'admin'
    )
  );
