# FIX: Audit Logs System (FINAL V2)

This script recreates the table and fixes the sample data insertion error by selecting a valid user ID.

```sql
-- 1. Drop existing table to ensure clean state
DROP TABLE IF EXISTS public.activity_logs CASCADE;

-- 2. Create the table
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_name TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    tx_hash TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 4. Policies
CREATE POLICY "Patients view own logs" ON public.activity_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System inserts logs" ON public.activity_logs
    FOR INSERT WITH CHECK (true); -- Allow system/authenticated users to insert

-- 5. Enable Realtime
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'activity_logs') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;
  END IF;
END
$$;

-- 6. Sample Log Entry (Fixed)
-- We select the first available user ID from auth.users to ensure it's not NULL
INSERT INTO public.activity_logs (user_id, actor_name, action, details)
SELECT id, 'System Admin', 'Viewed', 'Account Security Check'
FROM auth.users
LIMIT 1;
```
