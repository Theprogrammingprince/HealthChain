-- Add grantee_id column to access_permissions table
-- This is the simpler approach - just add the missing column
-- Run this in your Supabase SQL Editor

-- Add the column if it doesn't exist
ALTER TABLE access_permissions 
ADD COLUMN IF NOT EXISTS grantee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_access_permissions_grantee 
ON access_permissions(grantee_id);

-- Add RLS policy to allow users to view permissions granted to them
DROP POLICY IF EXISTS "Users can view permissions granted to them" ON access_permissions;
CREATE POLICY "Users can view permissions granted to them" 
ON access_permissions FOR SELECT
USING (grantee_id = auth.uid());

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'access_permissions'
ORDER BY ordinal_position;
