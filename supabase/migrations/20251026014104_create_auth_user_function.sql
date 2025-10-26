-- Create a function to create Supabase Auth users
-- This is used for seeding data in development
CREATE OR REPLACE FUNCTION create_auth_user(
  user_email TEXT,
  user_password TEXT
) RETURNS UUID AS $$
DECLARE
  user_id UUID;
  encrypted_pw TEXT;
BEGIN
  -- Generate a new UUID for the user
  user_id := gen_random_uuid();

  -- Hash the password using crypt
  encrypted_pw := crypt(user_password, gen_salt('bf'));

  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    user_id,
    'authenticated',
    'authenticated',
    user_email,
    encrypted_pw,
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  );

  -- Insert into auth.identities
  INSERT INTO auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    user_id::text,
    user_id,
    format('{"sub":"%s","email":"%s"}', user_id::text, user_email)::jsonb,
    'email',
    NOW(),
    NOW(),
    NOW()
  );

  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
