-- Migration: Add verification columns and policies for hospital verification

-- 1. Add new columns to hospital_profiles
ALTER TABLE public.hospital_profiles 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';

-- 2. Create index for performance
CREATE INDEX IF NOT EXISTS idx_hospital_profiles_verification 
ON public.hospital_profiles(user_id, is_verified);

CREATE INDEX IF NOT EXISTS idx_hospital_profiles_status 
ON public.hospital_profiles(verification_status);

-- 3. Ensure RLS Policies exist (if not already created)

-- Policy: Superadmins can view all profiles
CREATE POLICY "Superadmins can view all hospital profiles"
ON public.hospital_profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'superadmin'
  )
);

-- Policy: Superadmins can update profiles (for approval/rejection)
CREATE POLICY "Superadmins can update all hospital profiles"
ON public.hospital_profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'superadmin'
  )
);

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role TEXT;

-- 5. Fix Role Constraints (if flexible roles are needed)
-- Drop existing constraint if it restricts 'superadmin'
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_role_check;

-- Add updated constraint allowing superadmin
ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('patient', 'hospital', 'admin', 'superadmin'));

CREATE INDEX IF NOT EXISTS idx_users_role 
ON public.users(role);

-- 6. Grant Superadmin Access
-- This ensures the specified users have the correct role
UPDATE public.users
SET role = 'superadmin'
WHERE email IN ('eragbele.paul@gmail.com', 'umokeuchenna2020@gmail.com');
