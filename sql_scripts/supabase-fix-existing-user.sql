-- Fix existing user and check trigger setup
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: Check trigger setup
-- ============================================
SELECT 'Checking trigger...' as step;
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- ============================================
-- STEP 2: See all users (to get your UUID)
-- ============================================
SELECT 'Your users...' as step;
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC;

-- ============================================
-- STEP 3: Create profiles for ALL existing users
-- ============================================
SELECT 'Creating profiles...' as step;

-- Create sequence if missing
CREATE SEQUENCE IF NOT EXISTS member_id_seq START WITH 1000;

-- Create profiles for all users that don't have one
INSERT INTO public.profiles (id, email, full_name, role, member_id, phone, address)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', 'User'),
  'member',  -- Default to member, we'll update admin next
  'MEM' || LPAD(nextval('member_id_seq')::TEXT, 6, '0'),
  u.raw_user_meta_data->>'phone',
  u.raw_user_meta_data->>'address'
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- ============================================
-- STEP 4: Update your admin@lms.com to admin role
-- ============================================
UPDATE public.profiles 
SET role = 'admin',
    member_id = 'ADM000001',
    full_name = 'Admin User'
WHERE email = 'admin@lms.com';

-- ============================================
-- STEP 5: Verify profiles were created
-- ============================================
SELECT 'Verification...' as step;
SELECT 
  u.id,
  u.email,
  p.full_name,
  p.role,
  p.member_id,
  p.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- ============================================
-- STEP 6: Setup trigger for future users
-- ============================================
SELECT 'Setting up trigger...' as step;

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  new_member_id TEXT;
  user_role TEXT;
BEGIN
  -- Get role from metadata, default to 'member'
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'member');
  
  -- Generate member_id based on role
  new_member_id := CASE 
    WHEN user_role = 'admin' THEN 'ADM' || LPAD(nextval('member_id_seq')::TEXT, 6, '0')
    WHEN user_role = 'librarian' THEN 'LIB' || LPAD(nextval('member_id_seq')::TEXT, 6, '0')
    ELSE 'MEM' || LPAD(nextval('member_id_seq')::TEXT, 6, '0')
  END;

  -- Insert into profiles
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    member_id,
    phone,
    address
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    user_role,
    new_member_id,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'address'
  );

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FINAL: Verify everything
-- ============================================
SELECT 'FINAL VERIFICATION' as step;

SELECT 'Trigger status:' as info;
SELECT trigger_name, event_object_table, action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

SELECT 'All users with profiles:' as info;
SELECT 
  u.email,
  p.full_name,
  p.role,
  p.member_id
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY p.role NULLS LAST, u.email;

-- Done! You should now be able to login with admin@lms.com
