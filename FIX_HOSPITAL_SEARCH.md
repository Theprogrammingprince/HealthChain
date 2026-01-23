# FIX: Enable Hospital Search for Patients

This script enables patients to search for hospitals and grant them access permissions.

Run this SQL in Supabase:

```sql
-- 1. Enable RLS on hospital_profiles (if not already)
ALTER TABLE public.hospital_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Allow authenticated users to search/view hospital profiles
-- This enables patients to find and verify hospitals before granting access
DROP POLICY IF EXISTS "Authenticated users can view hospital profiles" ON public.hospital_profiles;
CREATE POLICY "Authenticated users can view hospital profiles" 
ON public.hospital_profiles 
FOR SELECT 
TO authenticated 
USING (true);

-- 3. Add entity_type column to access_permissions (if not exists)
-- This helps distinguish between user and hospital permissions
ALTER TABLE public.access_permissions 
ADD COLUMN IF NOT EXISTS entity_type TEXT DEFAULT 'user';

-- 4. Add grantee_id column to access_permissions (if not exists)
-- This stores the ID of the user/hospital receiving the permission
ALTER TABLE public.access_permissions 
ADD COLUMN IF NOT EXISTS grantee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 5. Ensure users table is searchable
DROP POLICY IF EXISTS "Allow search of public user profiles" ON public.users;
CREATE POLICY "Allow search of public user profiles" 
ON public.users 
FOR SELECT 
TO authenticated 
USING (true);

-- 6. Grant proper permissions
GRANT SELECT ON public.hospital_profiles TO authenticated;
GRANT SELECT ON public.users TO authenticated;
```

## Permission Levels Explained

The system now supports 4 permission levels:

| Level | Description |
|-------|-------------|
| **View Summary Only** | Basic health info, allergies, blood type |
| **View All Records** | Full read access to all medical records |
| **Emergency Access** | SOS alerts + critical data access |
| **Full Access (Guardian)** | Complete control including adding records |
