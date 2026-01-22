# HealthChain Database Schema

This document contains the SQL schema for the HealthChain application database in Supabase.

## Setup Instructions

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste each section below
4. Run them in order

---

## 1. Users Table

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    wallet_address TEXT UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('patient', 'hospital', 'admin')),
    auth_provider TEXT NOT NULL CHECK (auth_provider IN ('google', 'wallet', 'email')),
    consent_at TIMESTAMP WITH TIME ZONE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_sign_in TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON public.users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile"
    ON public.users
    FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own profile"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id);

-- Allow inserts during registration
CREATE POLICY "Enable insert for authenticated users"
    ON public.users
    FOR INSERT
    WITH CHECK (auth.uid() = id);
```

---

## 2. Patient Profiles Table

```sql
-- Create patient profiles table
CREATE TABLE IF NOT EXISTS public.patient_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
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

-- Create index for user_id
CREATE INDEX IF NOT EXISTS idx_patient_profiles_user_id ON public.patient_profiles(user_id);

-- Enable Row Level Security
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;

-- Patients can read their own data
CREATE POLICY "Patients can view own profile"
    ON public.patient_profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = patient_profiles.user_id 
            AND users.id = auth.uid()
        )
    );

-- Patients can update their own data
CREATE POLICY "Patients can update own profile"
    ON public.patient_profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = patient_profiles.user_id 
            AND users.id = auth.uid()
        )
    );

-- Allow inserts during registration
CREATE POLICY "Enable insert for patients"
    ON public.patient_profiles
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = patient_profiles.user_id 
            AND users.id = auth.uid()
        )
    );
```

---

## 3. Hospital Profiles Table

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

-- Create index for user_id and verification status
CREATE INDEX IF NOT EXISTS idx_hospital_profiles_user_id ON public.hospital_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_hospital_profiles_verification ON public.hospital_profiles(verification_status);

-- Enable Row Level Security
ALTER TABLE public.hospital_profiles ENABLE ROW LEVEL SECURITY;

-- Hospitals can read their own data
CREATE POLICY "Hospitals can view own profile"
    ON public.hospital_profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = hospital_profiles.user_id 
            AND users.id = auth.uid()
        )
    );

-- Hospitals can update their own data
CREATE POLICY "Hospitals can update own profile"
    ON public.hospital_profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = hospital_profiles.user_id 
            AND users.id = auth.uid()
        )
    );

-- Allow inserts during registration
CREATE POLICY "Enable insert for hospitals"
    ON public.hospital_profiles
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = hospital_profiles.user_id 
            AND users.id = auth.uid()
        )
    );
```

---

## 4. Functions and Triggers

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for patient_profiles table
CREATE TRIGGER update_patient_profiles_updated_at
    BEFORE UPDATE ON public.patient_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for hospital_profiles table
CREATE TRIGGER update_hospital_profiles_updated_at
    BEFORE UPDATE ON public.hospital_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## 5. Grant Permissions

```sql
-- Grant access to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.patient_profiles TO authenticated;
GRANT ALL ON public.hospital_profiles TO authenticated;
```

---

## Verification

After running all the SQL commands, verify the setup:

1. Check that all tables exist in the Table Editor
2. Verify RLS is enabled on all tables
3. Test the authentication flow
4. Confirm data is being saved properly

---

## Notes

- All tables use Row Level Security (RLS) for data protection
- Users can only access their own data
- Timestamps are automatically updated via triggers
- Foreign keys ensure data integrity
- Indexes are created for frequently queried columns
