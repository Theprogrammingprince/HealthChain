# Hospital Verification Flow - Integration Guide

## Quick Start

This guide shows how to integrate the hospital verification flow into your existing HealthChain app.

## 1. Add Role Selection Modal to Your Auth Flow

In your main layout or auth callback page, add the `RoleSelectionModal`:

```tsx
// app/layout.tsx or app/auth/callback/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { RoleSelectionModal } from "@/components/features/RoleSelectionModal";

export default function YourComponent() {
  const { supabaseSession, userRole, fetchUserProfile } = useAppStore();
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    if (supabaseSession?.user && !userRole) {
      // User is authenticated but has no role
      setShowRoleModal(true);
    }
  }, [supabaseSession, userRole]);

  return (
    <>
      {/* Your existing content */}
      
      <RoleSelectionModal 
        open={showRoleModal} 
        onClose={() => setShowRoleModal(false)}
      />
    </>
  );
}
```

## 2. Protect Routes with RequireAuth

Wrap your dashboard pages with the updated `RequireAuth` component:

```tsx
// app/dashboard/page.tsx (Patient Dashboard)
import { RequireAuth } from "@/components/features/RequireAuth";

export default function PatientDashboard() {
  return (
    <RequireAuth requiredRole="Patient">
      {/* Your patient dashboard content */}
    </RequireAuth>
  );
}
```

```tsx
// app/clinical/page.tsx (Hospital Dashboard)
import { RequireAuth } from "@/components/features/RequireAuth";

export default function ClinicalDashboard() {
  return (
    <RequireAuth requiredRole="Hospital">
      {/* Your clinical dashboard content */}
    </RequireAuth>
  );
}
```

## 3. Database Setup

### Create hospital_profiles Table

```sql
CREATE TABLE IF NOT EXISTS public.hospital_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hospital_name TEXT NOT NULL,
  registration_number TEXT NOT NULL,
  license_number TEXT NOT NULL,
  license_path TEXT,
  verification_status TEXT DEFAULT 'pending',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster queries
CREATE INDEX idx_hospital_profiles_user_id ON public.hospital_profiles(user_id);
CREATE INDEX idx_hospital_profiles_verification ON public.hospital_profiles(user_id, is_verified);

-- Enable RLS
ALTER TABLE public.hospital_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own hospital profile"
  ON public.hospital_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hospital profile"
  ON public.hospital_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hospital profile"
  ON public.hospital_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Superadmins can view all hospital profiles"
  ON public.hospital_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'superadmin'
    )
  );

CREATE POLICY "Superadmins can update all hospital profiles"
  ON public.hospital_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'superadmin'
    )
  );
```

### Create Storage Bucket

Follow the instructions in [HOSPITAL_VERIFICATION_SETUP.md](file:///c:/Users/Paul%20Prince/HealthChain/HOSPITAL_VERIFICATION_SETUP.md) to:
1. Create `hospital-certificates` bucket
2. Set up RLS policies for storage
3. Configure MIME types and file size limits

## 4. Update Users Table

Ensure your `users` table has a `role` column:

```sql
-- Add role column if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role TEXT;

-- Create index
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
```

## 5. Create Superadmin User

To access the admin verification page, you need at least one superadmin:

```sql
-- Update an existing user to superadmin
UPDATE public.users 
SET role = 'superadmin' 
WHERE email = 'your-admin@example.com';
```

## 6. Navigation Links

Add navigation links to your admin dashboard:

```tsx
// app/admin/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div>
      {/* Other admin content */}
      
      <Link href="/admin/verify">
        <Button className="bg-[#00BFFF] hover:bg-[#00BFFF]/90">
          <Shield className="w-4 h-4 mr-2" />
          Hospital Verification
        </Button>
      </Link>
    </div>
  );
}
```

## 7. Environment Variables

Ensure your `.env.local` has the correct Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Testing Checklist

- [ ] New user signup shows role selection modal
- [ ] Selecting "Patient" redirects to `/dashboard`
- [ ] Selecting "Hospital" redirects to `/clinical/verify`
- [ ] Unverified hospital cannot access `/clinical`
- [ ] Verification form uploads certificate to Supabase Storage
- [ ] Superadmin can view pending requests at `/admin/verify`
- [ ] Approving hospital sets `is_verified = true`
- [ ] Verified hospital can access `/clinical` dashboard
- [ ] Rejected hospital sees rejection banner
- [ ] Rejected hospital can resubmit application

## Troubleshooting

### "Access denied" when uploading certificate
- Check RLS policies on `storage.objects`
- Ensure bucket is public
- Verify user is authenticated

### Role modal doesn't appear
- Check if `userRole` is already set in Zustand store
- Verify `supabaseSession` exists
- Check browser console for errors

### Verification status not updating
- Check RLS policies on `hospital_profiles` table
- Verify superadmin role is set correctly
- Check Supabase logs for errors

## Files Reference

| File | Purpose |
|------|---------|
| [RoleSelectionModal.tsx](file:///c:/Users/Paul%20Prince/HealthChain/components/features/RoleSelectionModal.tsx) | Role selection UI |
| [RequireAuth.tsx](file:///c:/Users/Paul%20Prince/HealthChain/components/features/RequireAuth.tsx) | Route protection with verification check |
| [/clinical/verify/page.tsx](file:///c:/Users/Paul%20Prince/HealthChain/app/clinical/verify/page.tsx) | Hospital verification form |
| [/admin/verify/page.tsx](file:///c:/Users/Paul%20Prince/HealthChain/app/admin/verify/page.tsx) | Superadmin approval interface |

## Support

For detailed implementation walkthrough, see [walkthrough.md](file:///C:/Users/Paul%20Prince/.gemini/antigravity/brain/65db8613-0b3f-403b-b2a5-ce9f52749c94/walkthrough.md)
