-- Create Test Users with Profiles for Library Management System
-- Run this in Supabase SQL Editor
-- This bypasses registration and creates users directly

-- Note: These passwords are hashed using bcrypt
-- Default password for all test users: "password123"

-- First, let's create the users in auth.users table
-- We'll use Supabase's auth.users table structure

-- IMPORTANT: You need to run these one at a time and get the UUIDs
-- Or use the simpler approach below with fixed UUIDs

-- ============================================
-- METHOD 1: Create users with known UUIDs
-- ============================================

-- Create Admin User
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a1111111-1111-1111-1111-111111111111',
  'authenticated',
  'authenticated',
  'admin@library.com',
  '$2a$10$rBV2c9PW/8XnGkXUqRqfQeDxvZ7hDvHPKKxLQqU3Y9fZN3h5TqJOW', -- password: password123
  NOW(),
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NULL,
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Admin User","role":"admin"}',
  NULL,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL,
  false,
  NULL
);

-- Create Admin Profile
INSERT INTO public.profiles (id, email, full_name, role, member_id, phone, address)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'admin@library.com',
  'Admin User',
  'admin',
  'ADM000001',
  '+91 9876543210',
  '123 Admin Street'
);

-- Create Librarian User
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  is_sso_user
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'b2222222-2222-2222-2222-222222222222',
  'authenticated',
  'authenticated',
  'librarian@library.com',
  '$2a$10$rBV2c9PW/8XnGkXUqRqfQeDxvZ7hDvHPKKxLQqU3Y9fZN3h5TqJOW', -- password: password123
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Librarian User","role":"librarian"}',
  NOW(),
  NOW(),
  false
);

-- Create Librarian Profile
INSERT INTO public.profiles (id, email, full_name, role, member_id, phone, address)
VALUES (
  'b2222222-2222-2222-2222-222222222222',
  'librarian@library.com',
  'Librarian User',
  'librarian',
  'LIB000001',
  '+91 9876543211',
  '456 Librarian Lane'
);

-- Create Member User 1
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  is_sso_user
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'c3333333-3333-3333-3333-333333333333',
  'authenticated',
  'authenticated',
  'member@library.com',
  '$2a$10$rBV2c9PW/8XnGkXUqRqfQeDxvZ7hDvHPKKxLQqU3Y9fZN3h5TqJOW', -- password: password123
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"John Member","role":"member"}',
  NOW(),
  NOW(),
  false
);

-- Create Member Profile 1
INSERT INTO public.profiles (id, email, full_name, role, member_id, phone, address)
VALUES (
  'c3333333-3333-3333-3333-333333333333',
  'member@library.com',
  'John Member',
  'member',
  'MEM001000',
  '+91 9876543212',
  '789 Member Road'
);

-- Create Member User 2
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  is_sso_user
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'd4444444-4444-4444-4444-444444444444',
  'authenticated',
  'authenticated',
  'jane@library.com',
  '$2a$10$rBV2c9PW/8XnGkXUqRqfQeDxvZ7hDvHPKKxLQqU3Y9fZN3h5TqJOW', -- password: password123
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Jane Doe","role":"member"}',
  NOW(),
  NOW(),
  false
);

-- Create Member Profile 2
INSERT INTO public.profiles (id, email, full_name, role, member_id, phone, address)
VALUES (
  'd4444444-4444-4444-4444-444444444444',
  'jane@library.com',
  'Jane Doe',
  'member',
  'MEM001001',
  '+91 9876543213',
  '321 Reader Avenue'
);

-- ============================================
-- Verify the users were created
-- ============================================
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.full_name,
  p.role,
  p.member_id
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY p.role, u.email;

-- ============================================
-- Test Login Credentials
-- ============================================
/*
You can now login with these accounts:

1. ADMIN:
   Email: admin@library.com
   Password: password123
   
2. LIBRARIAN:
   Email: librarian@library.com
   Password: password123
   
3. MEMBER 1:
   Email: member@library.com
   Password: password123
   
4. MEMBER 2:
   Email: jane@library.com
   Password: password123

All passwords are: password123
*/

-- ============================================
-- Optional: Add some sample transactions for testing
-- ============================================

-- Issue a book to John Member (assuming books exist from seed data)
INSERT INTO transactions (book_id, user_id, issued_by, issue_date, due_date, status)
SELECT 
  b.id as book_id,
  'c3333333-3333-3333-3333-333333333333' as user_id,
  'b2222222-2222-2222-2222-222222222222' as issued_by,
  NOW() - INTERVAL '5 days' as issue_date,
  NOW() + INTERVAL '9 days' as due_date,
  'issued' as status
FROM books b
WHERE b.isbn = '9780134685991'
LIMIT 1;

-- Update book availability
UPDATE books 
SET available_copies = available_copies - 1 
WHERE isbn = '9780134685991' AND available_copies > 0;

-- ============================================
-- Clean Up (if you need to start over)
-- ============================================
/*
-- Uncomment and run these if you need to delete test users:

DELETE FROM public.profiles WHERE email IN (
  'admin@library.com',
  'librarian@library.com', 
  'member@library.com',
  'jane@library.com'
);

DELETE FROM auth.users WHERE email IN (
  'admin@library.com',
  'librarian@library.com',
  'member@library.com', 
  'jane@library.com'
);
*/
