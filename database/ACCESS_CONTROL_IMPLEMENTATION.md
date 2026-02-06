# Patient Access Control - Implementation Checklist

## 📋 Migration Steps

### Step 1: Run Database Migration ✅

```bash
# 1. Go to Supabase Dashboard
# 2. Navigate to SQL Editor
# 3. Open PATIENT_ACCESS_CONTROL_MIGRATION.sql
# 4. Execute the entire script
```

**Verify**:
- [ ] `patient_access_permissions` table created
- [ ] `patient_access_codes` table created
- [ ] `patient_record_access_log` table created
- [ ] `patient_emergency_contacts` table created
- [ ] All RLS policies active
- [ ] Helper functions created

---

### Step 2: Enable pg_cron Extension

```sql
-- In Supabase Dashboard → Database → Extensions
-- Search for "pg_cron" and enable it

-- Then uncomment and run these in SQL Editor:
SELECT cron.schedule(
    'auto-expire-permissions',
    '0 * * * *',
    $$ SELECT auto_expire_access_permissions(); $$
);

SELECT cron.schedule(
    'auto-expire-codes',
    '*/15 * * * *',
    $$ SELECT auto_expire_access_codes(); $$
);
```

**Verify**:
- [ ] pg_cron extension enabled
- [ ] Cron jobs scheduled
- [ ] Jobs running (check `cron.job_run_details`)

---

### Step 3: Update TypeScript Types

Add to `lib/database.types.ts`:

```typescript
export interface PatientAccessPermission {
    id: string;
    patient_id: string;
    doctor_id: string | null;
    hospital_id: string | null;
    access_type: 'read' | 'read_write' | 'emergency' | 'full';
    allowed_record_types: string[] | null;
    status: 'active' | 'expired' | 'revoked' | 'suspended';
    granted_at: string;
    expires_at: string | null;
    revoked_at: string | null;
    revoked_by: string | null;
    revoked_reason: string | null;
    is_emergency_access: boolean;
    emergency_verified_by: string | null;
    emergency_justification: string | null;
    emergency_expires_at: string | null;
    granted_by: string | null;
    grant_method: 'manual' | 'qr_code' | 'appointment' | 'emergency' | 'hospital_admission' | 'first_visit';
    notify_on_access: boolean;
    access_purpose: string | null;
    internal_notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface PatientAccessCode {
    id: string;
    patient_id: string;
    access_code: string;
    code_type: 'qr' | 'pin' | 'url' | 'nfc';
    access_duration_minutes: number;
    allowed_record_types: string[] | null;
    max_uses: number | null;
    current_uses: number;
    status: 'active' | 'used' | 'expired' | 'revoked';
    created_at: string;
    expires_at: string;
    first_used_at: string | null;
    last_used_at: string | null;
    used_by_doctor_id: string | null;
    used_by_hospital_id: string | null;
    purpose: string | null;
    location_restriction: string | null;
    ip_address_used: string | null;
    user_agent_used: string | null;
    updated_at: string;
}

export interface PatientRecordAccessLog {
    id: string;
    patient_id: string;
    doctor_id: string | null;
    hospital_id: string | null;
    record_id: string | null;
    record_type: string | null;
    action_performed: 'view' | 'download' | 'export' | 'print' | 'share' | 'edit';
    access_method: 'persistent_grant' | 'access_code' | 'hospital_affiliation' | 'emergency_access' | 'self_created' | 'appointment_based';
    permission_id: string | null;
    access_code_id: string | null;
    access_purpose: string | null;
    clinical_justification: string | null;
    is_emergency_access: boolean;
    emergency_level: 'critical' | 'urgent' | 'standard' | null;
    accessed_at: string;
    ip_address: string | null;
    user_agent: string | null;
    session_id: string | null;
    patient_notified: boolean;
    notification_sent_at: string | null;
    created_at: string;
}

export interface PatientEmergencyContact {
    id: string;
    patient_id: string;
    contact_name: string;
    relationship: string;
    phone_number: string;
    email: string | null;
    can_grant_access: boolean;
    can_revoke_access: boolean;
    can_view_records: boolean;
    priority: number;
    is_active: boolean;
    verified: boolean;
    verified_at: string | null;
    verification_method: string | null;
    created_at: string;
    updated_at: string;
}
```

---

### Step 4: Create Service Functions

Create `lib/access-control.service.ts`:

```typescript
import { supabase } from './supabaseClient';
import type {
    PatientAccessPermission,
    PatientAccessCode,
    PatientRecordAccessLog,
    PatientEmergencyContact
} from './database.types';

// ==================== PERMISSION MANAGEMENT ====================

export async function grantDoctorAccess(
    patientId: string,
    doctorId: string,
    accessType: 'read' | 'read_write' | 'full',
    options?: {
        recordTypes?: string[];
        expiresAt?: Date;
        purpose?: string;
    }
) {
    const { data, error } = await supabase
        .from('patient_access_permissions')
        .insert({
            patient_id: patientId,
            doctor_id: doctorId,
            access_type: accessType,
            allowed_record_types: options?.recordTypes || null,
            expires_at: options?.expiresAt?.toISOString() || null,
            access_purpose: options?.purpose || null,
            grant_method: 'manual'
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function revokeDoctorAccess(
    permissionId: string,
    reason?: string
) {
    const { data, error } = await supabase
        .from('patient_access_permissions')
        .update({
            status: 'revoked',
            revoked_at: new Date().toISOString(),
            revoked_by: (await supabase.auth.getUser()).data.user?.id,
            revoked_reason: reason || null
        })
        .eq('id', permissionId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getPatientAccessPermissions(patientId: string) {
    const { data, error } = await supabase
        .from('active_patient_permissions')
        .select('*')
        .eq('patient_id', patientId);

    if (error) throw error;
    return data;
}

export async function checkDoctorAccess(
    doctorId: string,
    patientId: string,
    recordType?: string
) {
    const { data, error } = await supabase.rpc('check_doctor_has_access', {
        p_doctor_id: doctorId,
        p_patient_id: patientId,
        p_record_type: recordType || null
    });

    if (error) throw error;
    return data as boolean;
}

// ==================== ACCESS CODE MANAGEMENT ====================

export async function generateAccessCode(
    patientId: string,
    options: {
        codeType?: 'qr' | 'pin';
        durationMinutes?: number;
        recordTypes?: string[];
        purpose?: string;
        expiresAt?: Date;
    }
) {
    // Generate random code
    const { data: codeData } = await supabase.rpc('generate_access_code', { code_length: 6 });
    
    const { data, error } = await supabase
        .from('patient_access_codes')
        .insert({
            patient_id: patientId,
            access_code: codeData,
            code_type: options.codeType || 'qr',
            access_duration_minutes: options.durationMinutes || 60,
            allowed_record_types: options.recordTypes || null,
            purpose: options.purpose || null,
            expires_at: options.expiresAt?.toISOString() || new Date(Date.now() + 24*60*60*1000).toISOString()
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function useAccessCode(
    accessCode: string,
    doctorId: string
) {
    // First, verify code exists and is valid
    const { data: code, error: fetchError } = await supabase
        .from('patient_access_codes')
        .select('*')
        .eq('access_code', accessCode)
        .eq('status', 'active')
        .single();

    if (fetchError || !code) {
        throw new Error('Invalid or expired access code');
    }

    // Update code usage
    const { error: updateError } = await supabase
        .from('patient_access_codes')
        .update({
            current_uses: code.current_uses + 1,
            status: code.max_uses && code.current_uses + 1 >= code.max_uses ? 'used' : 'active',
            first_used_at: code.first_used_at || new Date().toISOString(),
            last_used_at: new Date().toISOString(),
            used_by_doctor_id: doctorId
        })
        .eq('id', code.id);

    if (updateError) throw updateError;

    // Create temporary access permission
    await grantDoctorAccess(
        code.patient_id,
        doctorId,
        'read',
        {
            recordTypes: code.allowed_record_types || undefined,
            expiresAt: new Date(Date.now() + code.access_duration_minutes * 60 * 1000),
            purpose: `Access via code: ${code.purpose || 'Not specified'}`
        }
    );

    return code;
}

// ==================== EMERGENCY ACCESS ====================

export async function requestEmergencyAccess(
    patientId: string,
    doctorId: string,
    justification: string,
    emergencyLevel: 'critical' | 'urgent' = 'critical',
    durationHours: number = 24
) {
    const { data, error } = await supabase
        .from('patient_access_permissions')
        .insert({
            patient_id: patientId,
            doctor_id: doctorId,
            access_type: 'emergency',
            is_emergency_access: true,
            emergency_justification: justification,
            emergency_expires_at: new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString(),
            grant_method: 'emergency',
            status: 'active'
        })
        .select()
        .single();

    if (error) throw error;

    // Log the emergency access
    await logAccessEvent(patientId, doctorId, null, 'emergency_access', 'view', {
        isEmergency: true,
        emergencyLevel,
        justification
    });

    return data;
}

// ==================== ACCESS LOGGING ====================

export async function logAccessEvent(
    patientId: string,
    doctorId: string,
    recordId: string | null,
    accessMethod: string,
    action: 'view' | 'download' | 'export' | 'print' = 'view',
    options?: {
        isEmergency?: boolean;
        emergencyLevel?: 'critical' | 'urgent' | 'standard';
        justification?: string;
    }
) {
    const { error } = await supabase.from('patient_record_access_log').insert({
        patient_id: patientId,
        doctor_id: doctorId,
        record_id: recordId,
        access_method: accessMethod,
        action_performed: action,
        is_emergency_access: options?.isEmergency || false,
        emergency_level: options?.emergencyLevel || null,
        clinical_justification: options?.justification || null,
        ip_address: await getUserIP(),
        user_agent: navigator.userAgent
    });

    if (error) throw error;
}

export async function getPatientAccessLog(patientId: string, limit = 50) {
    const { data, error } = await supabase
        .from('recent_record_access')
        .select('*')
        .eq('patient_id', patientId)
        .limit(limit);

    if (error) throw error;
    return data;
}

// ==================== EMERGENCY CONTACTS ====================

export async function addEmergencyContact(
    patientId: string,
    contactData: {
        name: string;
        relationship: string;
        phone: string;
        email?: string;
        canGrantAccess?: boolean;
        priority?: number;
    }
) {
    const { data, error } = await supabase
        .from('patient_emergency_contacts')
        .insert({
            patient_id: patientId,
            contact_name: contactData.name,
            relationship: contactData.relationship,
            phone_number: contactData.phone,
            email: contactData.email || null,
            can_grant_access: contactData.canGrantAccess ?? true,
            priority: contactData.priority || 1
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getEmergencyContacts(patientId: string) {
    const { data, error } = await supabase
        .from('patient_emergency_contacts')
        .select('*')
        .eq('patient_id', patientId)
        .eq('is_active', true)
        .order('priority', { ascending: true });

    if (error) throw error;
    return data;
}

// ==================== HELPERS ====================

async function getUserIP(): Promise<string | null> {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch {
        return null;
    }
}
```

---

### Step 5: Create UI Components

**Priority Components to Build**:

1. **Patient Dashboard**:
   - [ ] `ManageAccessDialog.tsx` - Grant/revoke access to doctors
   - [ ] `AccessLogViewer.tsx` - View who accessed records
   - [ ] `GenerateAccessCodeDialog.tsx` - Generate QR/PIN codes
   - [ ] `EmergencyContactsManager.tsx` - Manage emergency contacts
   - [ ] `AccessPermissionsList.tsx` - List active permissions

2. **Doctor Dashboard**:
   - [ ] `PatientSearchBar.tsx` - Search patients (already exists, verify)
   - [ ] `RequestEmergencyAccessDialog.tsx` - Request emergency access
   - [ ] `UseAccessCodeDialog.tsx` - Enter patient's access code
   - [ ] `MyAccessPermissions.tsx` - View granted permissions

3. **Admin Dashboard**:
   - [ ] `EmergencyAccessMonitor.tsx` - Monitor emergency accesses
   - [ ] `AccessComplianceReport.tsx` - Compliance reports
   - [ ] `AnomalyDetection.tsx` - Flag suspicious access patterns

---

### Step 6: Update Existing Pages

**Patient Dashboard** (`app/patient/dashboard/page.tsx`):
```typescript
// Add these sections:
// 1. Quick Access Code Generator (prominent card)
// 2. Active Access Permissions (list of doctors with access)
// 3. Recent Access Activity (who viewed records recently)
// 4. Emergency Contacts (manage emergency contacts)
```

**Doctor Dashboard** (`app/doctor/dashboard/page.tsx`):
```typescript
// Add these features:
// 1. Patient search with access code redemption
// 2. "Request Emergency Access" button (prominent for ER doctors)
// 3. "My Patients" list (patients who granted access)
```

---

### Step 7: Testing Checklist

- [ ] **Grant Access Flow**: Patient grants access to doctor
- [ ] **Revoke Access Flow**: Patient revokes access
- [ ] **Access Code Generation**: Patient generates QR code
- [ ] **Access Code Usage**: Doctor uses access code
- [ ] **Emergency Access**: Doctor requests emergency access
- [ ] **Access Logging**: All accesses are logged
- [ ] **Auto-Expiration**: Permissions expire correctly
- [ ] **Emergency Contacts**: Add/manage emergency contacts
- [ ] **RLS Policies**: Verify data isolation between users

---

### Step 8: Notifications & Alerts

Integrate with existing notification system:

```typescript
// When access is granted
await createNotification({
    user_id: doctorId,
    type: 'access_granted',
    title: 'Patient Access Granted',
    message: `${patientName} has granted you access to their medical records`,
    link: `/doctor/patients/${patientId}`
});

// When patient's records are accessed (if notify_on_access = true)
await createNotification({
    user_id: patientId,
    type: 'record_accessed',
    title: 'Record Accessed',
    message: `Dr. ${doctorName} viewed your ${recordType}`,
    link: `/patient/access-log`
});
```

---

## 🎯 Quick Start Commands

```bash
# 1. Preview migration (local)
cd database
cat PATIENT_ACCESS_CONTROL_MIGRATION.sql

# 2. After running in Supabase, update types
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase.types.ts

# 3. Install any missing dependencies
npm install qrcode # For QR code generation
npm install @zxing/library # For QR code scanning

# 4. Start development
npm run dev
```

---

## 📚 Documentation Links

- [Emergency Access Guide](./EMERGENCY_ACCESS_GUIDE.md)
- [Migration SQL](./PATIENT_ACCESS_CONTROL_MIGRATION.sql)
- [HIPAA Compliance](../SECURITY.md)

---

## ✅ Definition of Done

- [x] Database tables created
- [x] RLS policies in place
- [x] TypeScript types defined
- [ ] Service functions implemented
- [ ] UI components built
- [ ] Patient flow complete
- [ ] Doctor flow complete
- [ ] Emergency flow tested
- [ ] Access logging verified
- [ ] Notifications working
- [ ] Documentation complete

---

**Status**: Migration files created ✅  
**Next**: Run migration in Supabase, then build UI components
