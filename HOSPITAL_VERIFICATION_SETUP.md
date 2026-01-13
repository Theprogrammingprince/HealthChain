# Hospital Verification - Supabase Storage Setup

## Storage Bucket Configuration

### 1. Create Storage Bucket

Go to your Supabase project dashboard → Storage → Create a new bucket:

**Bucket Name:** `hospital-certificates`

**Settings:**
- **Public bucket:** ✅ Yes (so we can retrieve public URLs)
- **File size limit:** 5MB
- **Allowed MIME types:** 
  - `application/pdf`
  - `image/jpeg`
  - `image/jpg`
  - `image/png`

### 2. Storage Policies (RLS)

Run these SQL commands in the Supabase SQL Editor to set up Row Level Security policies:

```sql
-- Allow authenticated hospitals to upload their own certificates
CREATE POLICY "Hospitals can upload own certificates"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'hospital-certificates' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated hospitals to update their own certificates
CREATE POLICY "Hospitals can update own certificates"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'hospital-certificates' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access (for admin verification)
CREATE POLICY "Public can view certificates"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hospital-certificates');

-- Allow hospitals to delete their own certificates
CREATE POLICY "Hospitals can delete own certificates"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'hospital-certificates' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### 3. Update Hospital Profiles Table

Add the `license_path` column to store certificate URLs:

```sql
-- Add license_path column if it doesn't exist
ALTER TABLE public.hospital_profiles 
ADD COLUMN IF NOT EXISTS license_path TEXT;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_hospital_profiles_license_path 
ON public.hospital_profiles(license_path);
```

### 4. Verification Flow

1. **Hospital uploads certificate** → Stored at `hospital-certificates/{user_id}/certificate.{ext}`
2. **Public URL generated** → Saved to `hospital_profiles.license_path`
3. **Verification status** → Set to `pending`
4. **Admin reviews** → Can access certificate via public URL
5. **Admin approves/rejects** → Updates `verification_status` to `verified` or `rejected`

### 5. File Structure

```
hospital-certificates/
├── {user_id_1}/
│   └── certificate.pdf
├── {user_id_2}/
│   └── certificate.jpg
└── {user_id_3}/
    └── certificate.png
```

### 6. Security Notes

- Files are organized by `user_id` to prevent conflicts
- RLS policies ensure hospitals can only modify their own files
- Public read access allows admins to verify certificates
- File size limited to 5MB to prevent abuse
- Only specific MIME types allowed (PDF, JPG, PNG)

### 7. Testing the Setup

1. Navigate to `/clinical/verify` as a logged-in hospital user
2. Fill out the verification form
3. Upload a test certificate (PDF/JPG/PNG, < 5MB)
4. Submit the form
5. Check Supabase Storage → `hospital-certificates` bucket
6. Verify the file was uploaded to `{user_id}/certificate.{ext}`
7. Check `hospital_profiles` table for the new row with `license_path` populated

---

### 8. Database Updates (Required)

Run the following SQL to add the necessary columns for the verification flow:

```sql
-- Add verification columns
ALTER TABLE public.hospital_profiles 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_hospital_profiles_verification 
ON public.hospital_profiles(user_id, is_verified);

-- Ensure public.users has a role column
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role TEXT;
```

### 9. Admin Setup

To enable the Superadmin dashboard:

1.  Pick a user email to be the admin
2.  Run this SQL:

```sql
UPDATE public.users 
SET role = 'superadmin' 
WHERE email = 'your-admin@example.com';
```

3.  Ensure RLS policies allow superadmins to view/update `hospital_profiles` (see migration file).

