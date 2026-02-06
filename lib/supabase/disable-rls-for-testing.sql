-- Temporarily Disable RLS for Testing
-- ⚠️ WARNING: This removes security. Only use for testing!
-- Run this in your Supabase SQL Editor

-- Disable RLS on activity_logs table
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;

-- Disable RLS on emergency_access_tokens table (to fix the 403 on UPDATE too)
ALTER TABLE emergency_access_tokens DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename IN ('activity_logs', 'emergency_access_tokens');

-- Expected result: rowsecurity = false for both tables
