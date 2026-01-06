-- claim_gift_code関数のexpires_at型をDATEに修正
DROP FUNCTION IF EXISTS claim_gift_code(INT);

CREATE OR REPLACE FUNCTION claim_gift_code(p_gift_code_amount_id INT)
RETURNS TABLE (
  id BIGINT,
  gift_code_amount_id INT,
  code TEXT,
  used BOOLEAN,
  expires_at DATE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  amount INT
) AS $$
DECLARE
  v_code_id BIGINT;
BEGIN
  -- 未使用かつ有効期限内のコードを1件取得してロック
  -- SKIP LOCKED: 他のトランザクションがロック中の行はスキップ
  SELECT gc.id INTO v_code_id
  FROM gift_codes gc
  WHERE gc.gift_code_amount_id = p_gift_code_amount_id
    AND gc.used = false
    AND (gc.expires_at IS NULL OR gc.expires_at > CURRENT_DATE)
  ORDER BY gc.id
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  -- 該当コードがなければ空を返す
  IF v_code_id IS NULL THEN
    RETURN;
  END IF;

  -- 使用済みに更新して結果を返す
  RETURN QUERY
  UPDATE gift_codes gc
  SET used = true, updated_at = NOW()
  WHERE gc.id = v_code_id
  RETURNING
    gc.id,
    gc.gift_code_amount_id,
    gc.code,
    gc.used,
    gc.expires_at,
    gc.created_at,
    gc.updated_at,
    (SELECT gca.amount FROM gift_code_amounts gca WHERE gca.id = gc.gift_code_amount_id);
END;
$$ LANGUAGE plpgsql;
