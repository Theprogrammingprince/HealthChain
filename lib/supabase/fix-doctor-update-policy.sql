-- Fix RLS Policy to Allow Doctors to Update Emergency Tokens
-- The 403 error means doctors can't mark tokens as used
-- Run this in your Supabase SQL Editor

-- Drop the existing restrictive UPDATE policy
DROP POLICY IF EXISTS "Doctors can update emergency tokens when using them" ON emergency_access_tokens;
DROP POLICY IF EXISTS "Patients can update their own emergency tokens" ON emergency_access_tokens;

-- Recreate patient update policy
CREATE POLICY "Patients can update their own emergency tokens"
    ON emergency_access_tokens FOR UPDATE
    USING (auth.uid() = patient_id)
    WITH CHECK (auth.uid() = patient_id);

-- Create a more permissive doctor update policy
-- Allow doctors to update ANY active token (not just when they match conditions)
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

-- Verify the policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'emergency_access_tokens'
ORDER BY policyname;
