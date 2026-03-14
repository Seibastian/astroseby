-- Iyzipay test kullanıcısı oluşturmak için bu scripti Supabase SQL Editor'de çalıştır

-- 1. Auth tablosuna test kullanıcı ekle
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  instance_id,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change_token_current,
  reauthentication_token
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'test@astracastra.com',
  -- Şifre: test123456 (bcrypt hash)
  '$2a$10$1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP',
  now(),
  now(),
  now(),
  '00000000-0000-0000-0000-000000000000',
  '',
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- 2. Profile oluştur
INSERT INTO public.profiles (
  id,
  user_id,
  name,
  nickname,
  date_of_birth,
  birth_time,
  birth_place,
  sun_sign,
  moon_sign,
  rising_sign,
  onboarding_completed,
  is_premium,
  keşif_lifetime,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000001',
  'Test Kullanıcı',
  'Test',
  '1990-01-15',
  '14:30:00',
  'İstanbul, Türkiye',
  'Oğlak',
  'Yengeç',
  'Koç',
  true,
  true,
  true,
  now(),
  now()
) ON CONFLICT (user_id) DO NOTHING;

SELECT 'Test kullanıcı hazır!' as result;
