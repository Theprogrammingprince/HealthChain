-- Check if doctor_profiles table exists and its structure
-- Run this in Supabase SQL Editor

-- 1. Check if table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'doctor_profiles'
);

-- 2. If it exists, check its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'doctor_profiles'
ORDER BY ordinal_position;

-- 3. Check if this specific user has a doctor profile
SELECT * FROM doctor_profiles 
WHERE user_id = '6bb2e001-7d1b-4343-8d78-b778145281f2';

-- 4. Check RLS policies on doctor_profiles
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'doctor_profiles';
