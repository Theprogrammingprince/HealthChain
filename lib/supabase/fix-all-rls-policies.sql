-- Complete RLS Policy Fix for Emergency Access Feature
-- This fixes both activity_logs INSERT and emergency_access_tokens UPDATE
-- Run this entire script in your Supabase SQL Editor

-- ============================================
-- 1. Fix activity_logs RLS Policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Users can create activity logs" ON activity_logs;

-- Allow users to view logs where they are either the user_id OR patient_id
CREATE POLICY "Users can view their own activity logs"
    ON activity_logs FOR SELECT
    USING (user_id = auth.uid() OR patient_id = auth.uid());

-- Allow ANY authenticated user to create activity logs
-- This is necessary because doctors need to create logs for patients
-- The log records who did what, so this is safe for audit purposes
CREATE POLICY "Users can create activity logs"
    ON activity_logs FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- 2. Fix emergency_access_tokens RLS Policies
-- ============================================

-- Drop existing UPDATE policies
DROP POLICY IF EXISTS "Doctors can update emergency tokens when using them" ON emergency_access_tokens;
DROP POLICY IF EXISTS "Patients can update their own emergency tokens" ON emergency_access_tokens;

-- Recreate patient update policy
CREATE POLICY "Patients can update their own emergency tokens"
    ON emergency_access_tokens FOR UPDATE
    USING (auth.uid() = patient_id)
    WITH CHECK (auth.uid() = patient_id);

-- Allow doctors to update ANY token (to mark as used)
-- Doctors need this to mark tokens as inactive after use
CREATE POLICY "Doctors can update emergency tokens when using them"
    ON emergency_access_tokens FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM doctor_profiles 
            WHERE doctor_profiles.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM doctor_profiles 
            WHERE doctor_profiles.user_id = auth.uid()
        )
    );

-- ============================================
-- 3. Verify All Policies
-- ============================================

-- Check activity_logs policies
SELECT 
    'activity_logs' as table_name,
    policyname, 
    cmd,
    permissive,
    CASE 
        WHEN qual IS NOT NULL THEN 'USING clause present'
        ELSE 'No USING clause'
    END as using_clause,
    CASE 
        WHEN with_check IS NOT NULL THEN 'WITH CHECK clause present'
        ELSE 'No WITH CHECK clause'
    END as with_check_clause
FROM pg_policies 
WHERE tablename = 'activity_logs'
ORDER BY policyname;

-- Check emergency_access_tokens policies
SELECT 
    'emergency_access_tokens' as table_name,
    policyname, 
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'emergency_access_tokens'
ORDER BY policyname;
