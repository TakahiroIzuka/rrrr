-- Add CHECK constraint to ensure code is not empty string
ALTER TABLE users ADD CONSTRAINT users_code_not_empty CHECK (code <> '' AND length(trim(code)) > 0);
