-- 1. FIX CONSTRAINTS: Allow 'email' provider and 'admin' role
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_role_check,
DROP CONSTRAINT IF EXISTS users_auth_provider_check;

ALTER TABLE public.users
ADD CONSTRAINT users_role_check 
CHECK (role IN ('patient', 'hospital', 'admin')),
ADD CONSTRAINT users_auth_provider_check 
CHECK (auth_provider IN ('google', 'wallet', 'email'));

-- 2. CREATE SYNC TRIGGER: Automatically create public.users row when auth.users is created
-- This is often the missing piece that causes "Database error saving new user"
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, auth_provider, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient'),
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. APPLY TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. GRANT PERMISSIONS (Safety check)
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO anon;
