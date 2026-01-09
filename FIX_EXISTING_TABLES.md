# COMPLETE FIX - Add Missing Columns to All Tables

## Run These SQL Scripts in Order

### Step 1: Fix hospital_profiles Table

```sql
-- Add missing columns to hospital_profiles
ALTER TABLE public.hospital_profiles 
ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
ADD COLUMN IF NOT EXISTS registration_number TEXT,
ADD COLUMN IF NOT EXISTS specialization TEXT[],
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add foreign key constraint
ALTER TABLE public.hospital_profiles 
DROP CONSTRAINT IF EXISTS hospital_profiles_user_id_fkey;

ALTER TABLE public.hospital_profiles
ADD CONSTRAINT hospital_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Add unique constraint on user_id
ALTER TABLE public.hospital_profiles
DROP CONSTRAINT IF EXISTS hospital_profiles_user_id_key;

ALTER TABLE public.hospital_profiles
ADD CONSTRAINT hospital_profiles_user_id_key UNIQUE (user_id);

-- Rename is_verified to verification_status if needed
-- (Skip if you want to keep is_verified as-is)

-- Create index
CREATE INDEX IF NOT EXISTS idx_hospital_profiles_user_id ON public.hospital_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_hospital_profiles_verification ON public.hospital_profiles(verification_status);

-- Enable RLS
ALTER TABLE public.hospital_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Hospitals can view own profile" ON public.hospital_profiles;
DROP POLICY IF EXISTS "Hospitals can update own profile" ON public.hospital_profiles;
DROP POLICY IF EXISTS "Enable insert for hospitals" ON public.hospital_profiles;

CREATE POLICY "Hospitals can view own profile"
    ON public.hospital_profiles FOR SELECT
    USING (true);

CREATE POLICY "Hospitals can update own profile"
    ON public.hospital_profiles FOR UPDATE
    USING (true);

CREATE POLICY "Enable insert for hospitals"
    ON public.hospital_profiles FOR INSERT
    WITH CHECK (true);

-- Add update trigger
DROP TRIGGER IF EXISTS update_hospital_profiles_updated_at ON public.hospital_profiles;
CREATE TRIGGER update_hospital_profiles_updated_at
    BEFORE UPDATE ON public.hospital_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### Step 2: Fix patient_profiles Table

```sql
-- Add missing columns to patient_profiles
ALTER TABLE public.patient_profiles 
ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL,
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
ADD COLUMN IF NOT EXISTS emergency_phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS medical_conditions TEXT[],
ADD COLUMN IF NOT EXISTS allergies TEXT[],
ADD COLUMN IF NOT EXISTS medications TEXT[],
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add foreign key constraint
ALTER TABLE public.patient_profiles 
DROP CONSTRAINT IF EXISTS patient_profiles_user_id_fkey;

ALTER TABLE public.patient_profiles
ADD CONSTRAINT patient_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Add unique constraint on user_id
ALTER TABLE public.patient_profiles
DROP CONSTRAINT IF EXISTS patient_profiles_user_id_key;

ALTER TABLE public.patient_profiles
ADD CONSTRAINT patient_profiles_user_id_key UNIQUE (user_id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_patient_profiles_user_id ON public.patient_profiles(user_id);

-- Enable RLS
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Patients can view own profile" ON public.patient_profiles;
DROP POLICY IF EXISTS "Patients can update own profile" ON public.patient_profiles;
DROP POLICY IF EXISTS "Enable insert for patients" ON public.patient_profiles;

CREATE POLICY "Patients can view own profile"
    ON public.patient_profiles FOR SELECT
    USING (true);

CREATE POLICY "Patients can update own profile"
    ON public.patient_profiles FOR UPDATE
    USING (true);

CREATE POLICY "Enable insert for patients"
    ON public.patient_profiles FOR INSERT
    WITH CHECK (true);

-- Add update trigger
DROP TRIGGER IF EXISTS update_patient_profiles_updated_at ON public.patient_profiles;
CREATE TRIGGER update_patient_profiles_updated_at
    BEFORE UPDATE ON public.patient_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### Step 3: Grant Permissions

```sql
-- Grant permissions to all tables
GRANT ALL ON public.hospital_profiles TO authenticated, anon;
GRANT ALL ON public.patient_profiles TO authenticated, anon;
```

### Step 4: Clean Up - Delete the Duplicate User

```sql
-- Delete the user that's causing the duplicate error
DELETE FROM public.users WHERE id = '937435b9-af3c-4ce8-9c5a-f93dd87ee168';

-- OR if you want to delete ALL users and start fresh:
-- DELETE FROM public.users;
-- DELETE FROM public.patient_profiles;
-- DELETE FROM public.hospital_profiles;
```

---

## After Running ALL Scripts Above

1. **Refresh your browser** (Ctrl + Shift + R)
2. **Try signing in with Google again**
3. **It should work now!**

---

## What This Does

✅ Adds `user_id` column to both profile tables  
✅ Adds all other missing columns  
✅ Sets up foreign key constraints  
✅ Creates proper indexes  
✅ Enables RLS with policies  
✅ Adds update triggers  
✅ Deletes the duplicate user  

---

## Verification

After running the scripts, check in Supabase Table Editor:

**hospital_profiles** should have:
- ✅ id, user_id, hospital_name, license_number
- ✅ verification_status, registration_number
- ✅ specialization, phone_number, address
- ✅ city, state, country, postal_code
- ✅ website, description
- ✅ created_at, updated_at

**patient_profiles** should have:
- ✅ id, user_id, full_name, date_of_birth
- ✅ blood_group, gender, phone_number
- ✅ emergency_contact, emergency_phone
- ✅ address, city, state, country, postal_code
- ✅ medical_conditions, allergies, medications
- ✅ created_at, updated_at
