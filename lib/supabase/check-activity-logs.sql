-- Check if activity logs are being created for emergency access
-- Run this in your Supabase SQL Editor

-- 1. Check all activity logs
SELECT 
    id,
    user_id,
    patient_id,
    actor_name,
    action,
    details,
    created_at
FROM activity_logs
ORDER BY created_at DESC
LIMIT 20;

-- 2. Check specifically for Emergency Access logs
SELECT 
    id,
    user_id,
    patient_id,
    actor_name,
    action,
    details,
    created_at
FROM activity_logs
WHERE action = 'Emergency Access'
ORDER BY created_at DESC;

-- 3. Check RLS policies on activity_logs
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
WHERE tablename = 'activity_logs';
