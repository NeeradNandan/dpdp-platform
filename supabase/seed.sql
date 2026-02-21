-- Seed data for E0 (local development)
-- Creates a demo user so you can sign in immediately after `supabase start`
--
-- Credentials:  admin@localhost / password123

INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change,
  email_change_token_new,
  email_change_token_current,
  phone,
  phone_change,
  phone_change_token,
  reauthentication_token,
  email_change_confirm_status,
  is_sso_user,
  is_anonymous
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'admin@localhost',
  crypt('password123', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"organization_name": "Local Dev Corp", "industry": "Technology", "org_size": "small"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  '',
  '',
  NULL,
  '',
  '',
  '',
  0,
  FALSE,
  FALSE
);

INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'admin@localhost',
  jsonb_build_object('sub', 'a0000000-0000-0000-0000-000000000001', 'email', 'admin@localhost'),
  'email',
  NOW(),
  NOW(),
  NOW()
);

-- The handle_new_user() trigger from provision_org fires on auth.users INSERT,
-- so the org, membership, and consent purposes are auto-created.
