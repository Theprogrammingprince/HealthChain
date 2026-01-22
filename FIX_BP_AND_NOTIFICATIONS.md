# FIX: Add Blood Pressure & Notification System (FINAL)

This script drops the potentially broken `notifications` table and recreates it cleanly with the correct types.

```sql
-- 1. Add Blood Pressure to patient_profiles (Safe to run multiple times)
ALTER TABLE public.patient_profiles 
ADD COLUMN IF NOT EXISTS blood_pressure TEXT;

-- 2. Drop the notifications table to ensure a fresh, correct start
-- This fixes "column specified more than once" or "incompatible type" errors from previous runs
DROP TABLE IF EXISTS public.notifications CASCADE;

-- 3. Create Notifications Table (Referencing auth.users for UUID safety)
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, 
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('permission_granted', 'emergency_alert', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    action_link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS for Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 5. Notification Policies
CREATE POLICY "Users can view own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
ON public.notifications FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Allow insertion of notifications" 
ON public.notifications FOR INSERT 
WITH CHECK (true);

-- 6. Enable Real-time for notifications
-- Check if publication exists first to avoid errors, or just try adding
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'notifications') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END
$$;

-- 7. Add Search Index for Users (for Permission Search)
CREATE INDEX IF NOT EXISTS idx_users_search ON public.users(email, full_name);
```
