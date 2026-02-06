# Emergency Access Tokens - Database Setup

## ⚠️ IMPORTANT: Run This Migration First

The emergency access feature requires a new database table. You need to run this migration in your Supabase dashboard.

## Steps:

1. **Go to your Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your HealthChain project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Paste the Migration**
   - Open the file: `lib/supabase/run-migration.sql`
   - Copy ALL the SQL code
   - Paste it into the SQL Editor

4. **Run the Migration**
   - Click "Run" or press Ctrl+Enter
   - Wait for the success message

5. **Verify the Table**
   - Go to "Table Editor" in the left sidebar
   - You should see a new table called `emergency_access_tokens`

## What This Creates:

- ✅ `emergency_access_tokens` table with proper structure
- ✅ Indexes for fast lookups
- ✅ Row Level Security (RLS) policies
- ✅ Automatic token expiration function
- ✅ Timestamp update triggers

## After Running the Migration:

The emergency access feature will work:
- Patients can generate emergency codes
- Doctors can verify and access patient data
- All access is logged and audited

---

**Note**: If you get any errors about existing objects, that's okay - it means parts of the migration already exist. The migration uses `IF NOT EXISTS` to be safe.
