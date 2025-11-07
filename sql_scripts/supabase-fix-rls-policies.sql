-- Check and Fix RLS Policies for Profiles Table
-- Run this in Supabase SQL Editor

-- Step 1: Check current RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'profiles';

-- Step 2: Check existing policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- Step 3: Drop all existing policies on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Enable read access for users to own profile" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "Enable read access for admins" ON profiles;
DROP POLICY IF EXISTS "Enable read access for librarians" ON profiles;

-- Step 4: Disable RLS temporarily to test
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Or if you want to keep RLS enabled, use this simple policy instead:
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Simple policy: Allow all authenticated users to read all profiles
CREATE POLICY "Allow authenticated users to read profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Allow users to update their own profile only
CREATE POLICY "Allow users to update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow INSERT for authenticated users (for trigger)
CREATE POLICY "Allow authenticated insert"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (true);

-- Step 5: Verify policies were created
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Step 6: Test query (should return your profile)
SELECT id, email, role, member_id
FROM profiles
WHERE id = auth.uid();

-- Done!
