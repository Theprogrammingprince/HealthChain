# FIX: Admin Access to Hospital Profiles

The admin dashboard can't see hospital data because of Row Level Security (RLS) policies. Run this SQL in Supabase:

```sql
-- 1. Enable RLS on hospital_profiles (should already be done)
ALTER TABLE public.hospital_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if they're too restrictive
DROP POLICY IF EXISTS "Hospital profiles are viewable by owner" ON public.hospital_profiles;
DROP POLICY IF EXISTS "Authenticated users can view hospital profiles" ON public.hospital_profiles;
DROP POLICY IF EXISTS "Admins can view all hospital profiles" ON public.hospital_profiles;

-- 3. Allow authenticated users to view all hospital profiles
-- This enables both admin dashboard AND patient search to work
CREATE POLICY "Allow authenticated users to read hospital profiles" 
ON public.hospital_profiles 
FOR SELECT 
TO authenticated 
USING (true);

-- 4. Allow hospital owners to update their own profile
CREATE POLICY "Hospital owners can update their profile" 
ON public.hospital_profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- 5. Allow admins to update any hospital profile (for verification)
-- First, create a function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'Admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Allow admins to update any hospital
CREATE POLICY "Admins can update any hospital profile" 
ON public.hospital_profiles 
FOR UPDATE 
TO authenticated 
USING (public.is_admin());

-- 7. Verify policies are set
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'hospital_profiles';
```

## Also ensure users table is readable:

```sql
-- Allow reading users table for admin dashboard
DROP POLICY IF EXISTS "Allow search of public user profiles" ON public.users;
CREATE POLICY "Allow authenticated users to read users" 
ON public.users 
FOR SELECT 
TO authenticated 
USING (true);
```
