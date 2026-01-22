# FIX: Add Blood Pressure & Glucose Columns

This script ensures both `blood_pressure` and `glucose` columns exist in the `patient_profiles` table.

```sql
-- 1. Add Blood Pressure and Glucose to patient_profiles
ALTER TABLE public.patient_profiles 
ADD COLUMN IF NOT EXISTS blood_pressure TEXT;

ALTER TABLE public.patient_profiles 
ADD COLUMN IF NOT EXISTS glucose TEXT;

-- 2. Ensure Notifications Table exists (Recap)
CREATE TABLE IF NOT EXISTS public.notifications (
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

-- 3. Enable RLS for Notifications (if not already)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
```
