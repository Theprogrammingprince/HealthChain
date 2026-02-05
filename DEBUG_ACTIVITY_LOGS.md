# Activity Logs Debug Guide

## 🔍 Comprehensive Debugging Steps

I've added extensive debug logging to trace the entire activity log flow. Follow these steps:

### Step 1: Test Emergency Access Flow

1. **As Patient:**
   - Go to `/patient/dashboard/emergency`
   - Click "Generate Emergency Code"
   - Copy the 6-digit code

2. **As Doctor:**
   - Go to `/doctor/dashboard` → Emergency Access tab
   - Click "Enter OTP Code"
   - Paste the patient's code
   - Click "Verify & Access"

3. **Open Browser Console (F12)**
   - Look for these log messages in order:

### Expected Console Output:

#### When Doctor Verifies OTP:
```
Searching for token: ABC123
Token query result: { tokenData: {...}, tokenError: null }
Logging emergency access for patient: [patient-uuid] by Dr. [Name]
📝 Creating activity log: {
  userId: "[patient-uuid]",
  patientId: "[patient-uuid]",
  actor: "Dr. [Name] (Doctor)",
  action: "Emergency Access",
  details: "Emergency access used by Doctor"
}
📝 Inserting log data: { ... }
✅ Activity log created successfully: { id: "...", ... }
Log result: { id: "...", ... }
```

#### When Patient Refreshes Dashboard:
```
🔍 Activity logs query result: {
  data: [ { id: "...", action: "Emergency Access", ... } ],
  error: null,
  count: 1,
  userId: "[patient-uuid]"
}
📊 Mapped activity logs for state: [
  {
    id: "...",
    date: "...",
    actor: "Dr. [Name] (Doctor)",
    action: "Emergency Access",
    details: "Emergency access used by Doctor",
    txHash: "0x..."
  }
]
```

### Step 2: Check Database Directly

Run this SQL in Supabase SQL Editor:

```sql
-- Check if logs are being created
SELECT 
    id,
    user_id,
    patient_id,
    actor_name,
    action,
    details,
    created_at
FROM activity_logs
WHERE action = 'Emergency Access'
ORDER BY created_at DESC
LIMIT 5;
```

### Step 3: Verify RLS Policies

Run this SQL to check RLS policies:

```sql
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'activity_logs';
```

Expected policies:
- ✅ "Users can view their own activity logs" - SELECT
- ✅ "Users can create activity logs" - INSERT

### Common Issues & Solutions:

#### Issue 1: No logs in console when creating
**Problem:** `createActivityLog` not being called
**Solution:** Check if `logEmergencyAccess` is being called in EmergencyAccessTab

#### Issue 2: Error creating log
**Problem:** RLS blocking INSERT
**Solution:** Run the RLS policy fix:
```sql
DROP POLICY IF EXISTS "Users can create activity logs" ON activity_logs;
CREATE POLICY "Users can create activity logs"
    ON activity_logs FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
```

#### Issue 3: Logs created but not retrieved
**Problem:** RLS blocking SELECT or wrong query
**Solution:** Check the query uses OR condition:
```typescript
.or(`user_id.eq.${userId},patient_id.eq.${userId}`)
```

#### Issue 4: Logs retrieved but not displayed
**Problem:** Mapping issue or state not updating
**Solution:** Check the mapped logs in console and verify state update

### Step 4: Manual Test

After emergency access, manually check patient history:
1. Log in as the patient
2. Go to `/patient/dashboard/history`
3. Open console (F12)
4. Look for the debug logs showing query results
5. Check if `activityLogs` array has data

### What to Report:

If logs still don't show, provide:
1. **All console logs** from the debug messages (📝, 🔍, 📊, ✅, ❌)
2. **SQL query results** from checking the database directly
3. **Any error messages** in red in the console
4. **Screenshot** of the patient history page

This will help identify exactly where the flow is breaking.
