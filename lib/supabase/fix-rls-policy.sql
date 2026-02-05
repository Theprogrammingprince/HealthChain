-- Fix RLS Policy for Doctors to Access Emergency Tokens
-- Run this in your Supabase SQL Editor

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Doctors can view active emergency tokens" ON emergency_access_tokens;

-- Create a more permissive policy that allows any authenticated user with a doctor role
CREATE POLICY "Doctors can view active emergency tokens"
    ON emergency_access_tokens FOR SELECT
    USING (
        is_active = true 
        AND (
            -- Allow if user has a doctor profile
            EXISTS (
                SELECT 1 FROM doctor_profiles 
                WHERE user_id = auth.uid()
            )
            OR
            -- Allow if user has doctor role in users table
            EXISTS (
                SELECT 1 FROM users 
                WHERE id = auth.uid() 
                AND role = 'doctor'
            )
        )
    );

-- Also update the UPDATE policy
DROP POLICY IF EXISTS "Doctors can update emergency tokens when using them" ON emergency_access_tokens;

CREATE POLICY "Doctors can update emergency tokens when using them"
    ON emergency_access_tokens FOR UPDATE
    USING (
        is_active = true 
        AND (
            EXISTS (
                SELECT 1 FROM doctor_profiles 
                WHERE user_id = auth.uid()
            )
            OR
            EXISTS (
                SELECT 1 FROM users 
                WHERE id = auth.uid() 
                AND role = 'doctor'
            )
        )
    );
