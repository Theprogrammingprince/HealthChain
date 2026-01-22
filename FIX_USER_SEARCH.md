# FIX: Enable User Search

Currently, the `public.users` table likely has Row Level Security (RLS) enabled that restricts users to only seeing their own profile. To allow searching for other users (to grant them permissions), we need to add a policy that allows authenticated users to read public profile information.

Run this SQL in Supabase:

```sql
-- 1. Enable RLS (Ensure it's on)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Allow Authenticated Users to Read All Public User Profiles
-- This enables searching for users by email to grant them permissions.
-- Note: This makes full_name, email, and avatar_url accessible to all logged-in users.
CREATE POLICY "Allow search of public user profiles" 
ON public.users 
FOR SELECT 
TO authenticated 
USING (true);

-- 3. Verify it works by running a test query (Optional)
-- SELECT email FROM public.users LIMIT 5;
```
