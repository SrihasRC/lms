-- Supabase Setup Verification Script
-- Run this in Supabase SQL Editor to verify everything is set up correctly

-- 1. Check if profiles table exists
SELECT 'Profiles table exists' as status, COUNT(*) as profile_count FROM profiles;

-- 2. Check if all required tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'books', 'transactions', 'reservations', 'fines')
ORDER BY table_name;

-- 3. Check if the trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 4. Check if the sequence exists
SELECT sequence_name, last_value 
FROM information_schema.sequences 
WHERE sequence_name = 'member_id_seq';

-- 5. Check RLS policies on profiles table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'profiles';

-- 6. Check if any profiles exist
SELECT 
  id,
  email,
  full_name,
  role,
  member_id,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 5;

-- 7. Check if books were seeded
SELECT COUNT(*) as book_count FROM books;

-- 8. Sample book data
SELECT 
  isbn,
  title,
  author,
  genre,
  total_copies,
  available_copies
FROM books
LIMIT 5;

-- 9. Check for any auth users without profiles (should be empty)
SELECT 
  u.id,
  u.email,
  u.created_at,
  p.id as profile_id
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- If the last query returns any rows, those users need profiles created
-- You can create them with:
-- INSERT INTO profiles (id, email, full_name, role, member_id)
-- SELECT 
--   u.id, 
--   u.email, 
--   COALESCE(u.raw_user_meta_data->>'full_name', 'User'), 
--   COALESCE(u.raw_user_meta_data->>'role', 'member'),
--   'MEM' || LPAD(nextval('member_id_seq')::TEXT, 6, '0')
-- FROM auth.users u
-- LEFT JOIN profiles p ON u.id = p.id
-- WHERE p.id IS NULL;
