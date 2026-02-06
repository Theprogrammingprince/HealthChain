-- Secure RLS Policy for Emergency Access Tokens
-- This allows doctors to access emergency tokens while maintaining security
-- Run this in your Supabase SQL Editor

-- First, re-enable RLS if it was disabled
ALTER TABLE emergency_access_tokens ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Patients can create their own emergency tokens" ON emergency_access_tokens;
DROP POLICY IF EXISTS "Patients can view their own emergency tokens" ON emergency_access_tokens;
DROP POLICY IF EXISTS "Doctors can view active emergency tokens" ON emergency_access_tokens;
DROP POLICY IF EXISTS "Doctors can update emergency tokens when using them" ON emergency_access_tokens;

-- 1. Patients can create their own emergency tokens
CREATE POLICY "Patients can create their own emergency tokens"
    ON emergency_access_tokens FOR INSERT
    WITH CHECK (auth.uid() = patient_id);

-- 2. Patients can view their own emergency tokens
CREATE POLICY "Patients can view their own emergency tokens"
    ON emergency_access_tokens FOR SELECT
    USING (auth.uid() = patient_id);

-- 3. Patients can update their own tokens (for regeneration)
CREATE POLICY "Patients can update their own emergency tokens"
    ON emergency_access_tokens FOR UPDATE
    USING (auth.uid() = patient_id);

-- 4. Doctors can view ANY active emergency token (this is the key change)
-- Emergency tokens are meant to be accessible by any doctor in an emergency
CREATE POLICY "Doctors can view active emergency tokens"
    ON emergency_access_tokens FOR SELECT
    USING (
        is_active = true 
        AND EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role::text = 'doctor'
        )
    );

-- 5. Doctors can update tokens when using them (to mark as used)
CREATE POLICY "Doctors can update emergency tokens when using them"
    ON emergency_access_tokens FOR UPDATE
    USING (
        is_active = true 
        AND EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role::text = 'doctor'
        )
    );

-- Also ensure activity_logs table allows doctors to insert logs
-- Check if RLS is enabled on activity_logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Users can create activity logs" ON activity_logs;

-- Allow users to view their own activity logs
CREATE POLICY "Users can view their own activity logs"
    ON activity_logs FOR SELECT
    USING (user_id = auth.uid() OR patient_id = auth.uid());

-- Allow any authenticated user to create activity logs (for audit trail)
CREATE POLICY "Users can create activity logs"
    ON activity_logs FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('emergency_access_tokens', 'activity_logs')
ORDER BY tablename, policyname;
