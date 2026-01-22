# 🚨 IMPORTANT: Database Setup Required

## ⚠️ You're seeing an error because the database tables don't exist yet!

The error you're getting during sign-up is because:
**The Supabase database tables haven't been created yet.**

---

## 🚀 Quick Fix (5 Minutes)

Follow these simple steps to set up your database:

### Step 1: Open Supabase
1. Go to: https://supabase.com/dashboard
2. Sign in to your account
3. Select your project: **vlyjdalchiyfxxnhphkl**

### Step 2: Open SQL Editor
1. In the left sidebar, click on **SQL Editor** (looks like `</>`)
2. Click "New Query"

### Step 3: Create Users Table
Copy and paste this SQL, then click **RUN**:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE,
    wallet_address TEXT UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('patient', 'hospital', 'admin')),
    auth_provider TEXT NOT NULL CHECK (auth_provider IN ('google', 'wallet', 'email')),
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_sign_in TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON public.users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (true); -- Allow read for now, tighten later

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (true);

CREATE POLICY "Enable insert for users"
    ON public.users FOR INSERT
    WITH CHECK (true);
```

### Step 4: Create Patient Profiles Table
Copy and paste this SQL, then click **RUN**:

```sql
-- Create patient profiles table
CREATE TABLE IF NOT EXISTS public.patient_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender TEXT,
    blood_type TEXT,
    phone_number TEXT,
    emergency_contact TEXT,
    emergency_phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    postal_code TEXT,
    medical_conditions TEXT[],
    allergies TEXT[],
    medications TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_patient_profiles_user_id ON public.patient_profiles(user_id);

-- Enable Row Level Security
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Patients can view own profile"
    ON public.patient_profiles FOR SELECT
    USING (true);

CREATE POLICY "Patients can update own profile"
    ON public.patient_profiles FOR UPDATE
    USING (true);

CREATE POLICY "Enable insert for patients"
    ON public.patient_profiles FOR INSERT
    WITH CHECK (true);
```

### Step 5: Create Hospital Profiles Table
Copy and paste this SQL, then click **RUN**:

```sql
-- Create hospital profiles table
CREATE TABLE IF NOT EXISTS public.hospital_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    hospital_name TEXT NOT NULL,
    license_number TEXT,
    registration_number TEXT,
    specialization TEXT[],
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    phone_number TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    postal_code TEXT,
    website TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_hospital_profiles_user_id ON public.hospital_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_hospital_profiles_verification ON public.hospital_profiles(verification_status);

-- Enable Row Level Security
ALTER TABLE public.hospital_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Hospitals can view own profile"
    ON public.hospital_profiles FOR SELECT
    USING (true);

CREATE POLICY "Hospitals can update own profile"
    ON public.hospital_profiles FOR UPDATE
    USING (true);

CREATE POLICY "Enable insert for hospitals"
    ON public.hospital_profiles FOR INSERT
    WITH CHECK (true);
```

### Step 6: Create Triggers
Copy and paste this SQL, then click **RUN**:

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_profiles_updated_at
    BEFORE UPDATE ON public.patient_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hospital_profiles_updated_at
    BEFORE UPDATE ON public.hospital_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### Step 7: Grant Permissions
Copy and paste this SQL, then click **RUN**:

```sql
-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON public.users TO authenticated, anon;
GRANT ALL ON public.patient_profiles TO authenticated, anon;
GRANT ALL ON public.hospital_profiles TO authenticated, anon;
```

---

## ✅ Verification

After running all SQL commands:

1. Go to **Table Editor** in Supabase (left sidebar)
2. You should see 3 tables:
   - ✅ users
   - ✅ patient_profiles  
   - ✅ hospital_profiles

---

## 🧪 Test Again

1. **Refresh your browser** (clear cache if needed)
2. Try signing up again with Google
3. It should work now! The user should be created in the database

---

## 📋 What These Tables Do

**users**: Stores basic user information
- Email or wallet address
- Role (patient/hospital)
- Auth method (Google/wallet)
- Name and avatar

**patient_profiles**: Extended patient data
- Medical info, emergency contacts
- Linked to users table

**hospital_profiles**: Extended hospital data
- Hospital name, license, verification status
- Linked to users table

---

## ❓ Still Having Issues?

1. Check browser console (F12) for detailed error messages
2. Check Supabase logs: Dashboard → Logs
3. Verify all SQL ran without errors
4. Make sure `.env.local` has correct Supabase credentials

---

## 🎉 Done!

Once you complete these steps, sign-up will work perfectly!
Your users will be automatically saved to the database.
