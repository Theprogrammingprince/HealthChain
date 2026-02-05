-- Re-enable RLS After Testing
-- Run this AFTER you've confirmed the feature works
-- This restores security to your tables

-- Re-enable RLS on both tables
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_access_tokens ENABLE ROW LEVEL SECURITY;

-- Recreate the policies (same as fix-all-rls-policies.sql)

-- Activity logs policies
DROP POLICY IF EXISTS "Users can view their own activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Users can create activity logs" ON activity_logs;

CREATE POLICY "Users can view their own activity logs"
    ON activity_logs FOR SELECT
    USING (user_id = auth.uid() OR patient_id = auth.uid());

CREATE POLICY "Users can create activity logs"
    ON activity_logs FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Emergency tokens policies
DROP POLICY IF EXISTS "Patients can create their own emergency tokens" ON emergency_access_tokens;
DROP POLICY IF EXISTS "Patients can view their own emergency tokens" ON emergency_access_tokens;
DROP POLICY IF EXISTS "Patients can update their own emergency tokens" ON emergency_access_tokens;
DROP POLICY IF EXISTS "Doctors can view active emergency tokens" ON emergency_access_tokens;
DROP POLICY IF EXISTS "Doctors can update emergency tokens when using them" ON emergency_access_tokens;

CREATE POLICY "Patients can create their own emergency tokens"
    ON emergency_access_tokens FOR INSERT
    WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can view their own emergency tokens"
    ON emergency_access_tokens FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Patients can update their own emergency tokens"
    ON emergency_access_tokens FOR UPDATE
    USING (auth.uid() = patient_id)
    WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Doctors can view active emergency tokens"
    ON emergency_access_tokens FOR SELECT
    USING (
        is_active = true 
        AND EXISTS (
            SELECT 1 FROM doctor_profiles 
            WHERE doctor_profiles.user_id = auth.uid()
        )
    );

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

-- Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename IN ('activity_logs', 'emergency_access_tokens');

-- Expected result: rowsecurity = true for both tables
