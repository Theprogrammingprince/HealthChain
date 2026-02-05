-- Add granted_to_user_id column to access_permissions table
-- This allows granting access to any user (not just doctors with profiles)
-- Run this in your Supabase SQL Editor

-- Add the column if it doesn't exist
ALTER TABLE access_permissions 
ADD COLUMN IF NOT EXISTS granted_to_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_access_permissions_granted_to_user 
ON access_permissions(granted_to_user_id);

-- Update the constraint to allow either doctor_id, hospital_id, or granted_to_user_id
ALTER TABLE access_permissions 
DROP CONSTRAINT IF EXISTS check_grantee;

ALTER TABLE access_permissions 
ADD CONSTRAINT check_grantee 
CHECK (
    (doctor_id IS NOT NULL AND hospital_id IS NULL AND granted_to_user_id IS NULL) OR 
    (doctor_id IS NULL AND hospital_id IS NOT NULL AND granted_to_user_id IS NULL) OR
    (doctor_id IS NULL AND hospital_id IS NULL AND granted_to_user_id IS NOT NULL)
);

-- Add RLS policy to allow users to view permissions granted to them
DROP POLICY IF EXISTS "Users can view permissions granted to them" ON access_permissions;
CREATE POLICY "Users can view permissions granted to them" 
ON access_permissions FOR SELECT
USING (granted_to_user_id = auth.uid());

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'access_permissions'
AND column_name = 'granted_to_user_id';
