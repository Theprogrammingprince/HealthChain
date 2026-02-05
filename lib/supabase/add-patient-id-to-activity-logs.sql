-- Add patient_id column to activity_logs table
-- This is needed to track which patient's data was accessed
-- Run this in your Supabase SQL Editor

-- Add patient_id column if it doesn't exist
ALTER TABLE activity_logs 
ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_activity_logs_patient_id ON activity_logs(patient_id);

-- Update RLS policies to allow querying by patient_id
DROP POLICY IF EXISTS "Users can view their own activity logs" ON activity_logs;

CREATE POLICY "Users can view their own activity logs"
    ON activity_logs FOR SELECT
    USING (user_id = auth.uid() OR patient_id = auth.uid());

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'activity_logs'
ORDER BY ordinal_position;
