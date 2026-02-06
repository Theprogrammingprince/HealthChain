# HealthChain Emergency Access System Guide

## 🚨 Overview

The HealthChain Emergency Access System provides a secure, HIPAA-compliant mechanism for healthcare providers to access patient medical records during emergency situations when the patient is unable to provide consent.

---

## 🎯 Emergency Scenarios Covered

### 1. **Unconscious/Incapacitated Patients**
- Patient arrives at emergency room unconscious
- Patient is under anesthesia or sedation
- Patient has severe cognitive impairment

### 2. **Life-Threatening Situations**
- Cardiac arrest
- Severe trauma requiring immediate intervention
- Anaphylactic shock
- Stroke or seizure

### 3. **Communication Barriers**
- Language barriers preventing consent
- Patients with severe mental health crises
- Pediatric emergencies when guardian not present

---

## 🔐 Emergency Access Mechanisms

### **Mechanism 1: Break-Glass Emergency Access**

**How it works:**
1. **Doctor initiates emergency access request** in the system
2. **Justification is required** - Doctor must provide:
   - Emergency level (critical, urgent)
   - Clinical justification
   - Expected duration of access
3. **Access is automatically granted** for a limited time (default: 24 hours)
4. **Patient is notified** as soon as they're able to receive notifications
5. **Full audit trail** is created for compliance

**SQL Example:**
```sql
-- Doctor requests emergency access
INSERT INTO patient_access_permissions (
    patient_id,
    doctor_id,
    access_type,
    status,
    is_emergency_access,
    emergency_justification,
    emergency_expires_at,
    granted_by, -- System or emergency room admin
    grant_method
) VALUES (
    'patient-uuid',
    'doctor-uuid',
    'emergency',
    'active',
    true,
    'Patient unconscious after car accident. Need medication history.',
    NOW() + INTERVAL '24 hours',
    'system-uuid',
    'emergency'
);
```

### **Mechanism 2: Emergency Contact Authorization**

**How it works:**
1. Patient pre-registers **emergency contacts** (spouse, parent, guardian)
2. Emergency contacts can **grant access on behalf** of the patient
3. **Verification process** ensures contact identity
4. Access granted follows same permissions as patient-granted access

**SQL Example:**
```sql
-- Add emergency contact
INSERT INTO patient_emergency_contacts (
    patient_id,
    contact_name,
    relationship,
    phone_number,
    email,
    can_grant_access,
    priority,
    verified
) VALUES (
    'patient-uuid',
    'Jane Doe',
    'spouse',
    '+1234567890',
    'jane@email.com',
    true,
    1, -- Primary contact
    true
);

-- Emergency contact grants access
INSERT INTO patient_access_permissions (
    patient_id,
    doctor_id,
    access_type,
    granted_by, -- Emergency contact's user ID
    grant_method,
    access_purpose
) VALUES (
    'patient-uuid',
    'doctor-uuid',
    'full',
    'emergency-contact-user-id',
    'emergency',
    'Granted by spouse during emergency admission'
);
```

### **Mechanism 3: Hospital-Wide Emergency Access**

**How it works:**
1. **Hospital has standing emergency protocol**
2. When patient admitted to **emergency department**, hospital can activate emergency access
3. **All ER doctors** at that hospital get temporary access
4. Access **auto-expires** when patient is discharged or after 72 hours

**SQL Example:**
```sql
-- Grant hospital-wide emergency access
INSERT INTO patient_access_permissions (
    patient_id,
    hospital_id, -- Not doctor_id
    access_type,
    is_emergency_access,
    emergency_justification,
    emergency_expires_at,
    grant_method
) VALUES (
    'patient-uuid',
    'hospital-uuid',
    'emergency',
    true,
    'Patient admitted to ER unconscious',
    NOW() + INTERVAL '72 hours',
    'hospital_admission'
);
```

---

## 📊 Access Audit Trail

Every emergency access is **fully logged** for compliance:

```sql
-- Automatically logged when doctor accesses records
INSERT INTO patient_record_access_log (
    patient_id,
    doctor_id,
    record_id,
    access_method,
    action_performed,
    is_emergency_access,
    emergency_level,
    clinical_justification,
    ip_address,
    user_agent
) VALUES (
    'patient-uuid',
    'doctor-uuid',
    'record-uuid',
    'emergency_access',
    'view',
    true,
    'critical',
    'Needed medication list before surgery',
    '192.168.1.1',
    'Mozilla/5.0...'
);
```

---

## 🔔 Patient Notification System

### When Patient Regains Consciousness

1. **Immediate notification** sent via:
   - In-app notification
   - Email (if available)
   - SMS (if phone number on file)

2. **Notification includes:**
   - Who accessed their records
   - When access occurred
   - What records were viewed
   - Reason for emergency access
   - Option to review full audit log

3. **Patient can:**
   - Review all emergency access
   - Revoke ongoing access
   - File a complaint if access was inappropriate
   - Download access audit for their records

---

## ⚖️ Compliance & Legal Protections

### HIPAA Compliance
- **Treatment Exception**: Emergency access falls under HIPAA's treatment exception (45 CFR § 164.506)
- **Minimum Necessary**: Only relevant records are accessed
- **Audit Requirements**: Full logging meets HIPAA audit requirements
- **Patient Rights**: Patients can access audit logs per HIPAA right of access

### Documentation Requirements
Every emergency access includes:
- ✅ Date and time of access
- ✅ Identity of accessing healthcare provider
- ✅ Specific records accessed
- ✅ Clinical justification
- ✅ Duration of access
- ✅ Emergency level classification

---

## 🛡️ Security & Abuse Prevention

### Multi-Layer Protection

1. **Justification Required**
   - Empty justification = access denied
   - Justifications reviewed by compliance team

2. **Time-Limited Access**
   - Maximum 72 hours for emergency access
   - Auto-expiration prevents lingering access

3. **Anomaly Detection**
   - Multiple emergency accesses flagged
   - Access patterns analyzed
   - Unusual access times/locations trigger alerts

4. **Administrative Oversight**
   - Hospital admins can view all emergency accesses
   - Compliance team receives weekly reports
   - System admins can revoke access immediately

### SQL Query for Anomaly Detection
```sql
-- Find doctors with suspicious emergency access patterns
SELECT 
    d.first_name || ' ' || d.last_name AS doctor_name,
    COUNT(*) AS emergency_access_count,
    COUNT(DISTINCT p.patient_id) AS unique_patients,
    MAX(pral.accessed_at) AS last_emergency_access
FROM patient_record_access_log pral
JOIN doctor_profiles d ON pral.doctor_id = d.id
WHERE pral.is_emergency_access = true
AND pral.accessed_at > NOW() - INTERVAL '30 days'
GROUP BY d.id, doctor_name
HAVING COUNT(*) > 10 -- More than 10 emergency accesses in 30 days
ORDER BY emergency_access_count DESC;
```

---

## 🔄 User Flows

### Flow 1: Emergency Room Doctor Access (Unconscious Patient)

```
1. Patient arrives unconscious at ER
   ↓
2. Doctor searches patient by:
   - National ID / Passport
   - Wearable medical alert
   - Facial recognition (if available)
   - Emergency contact information
   ↓
3. Doctor clicks "Request Emergency Access"
   ↓
4. System prompts:
   - Emergency Level: [Critical/Urgent]
   - Clinical Justification: [Text field]
   - Expected Duration: [1h/6h/24h/72h]
   ↓
5. Doctor submits request
   ↓
6. System automatically:
   - Grants access
   - Logs in audit trail
   - Sets auto-expiration timer
   - Creates pending notification for patient
   ↓
7. Doctor can now view patient records
   ↓
8. When patient wakes up:
   - Receives notification of emergency access
   - Can review what was accessed
   - Can revoke if concerned
```

### Flow 2: Emergency Contact Authorization

```
1. Patient registers emergency contacts in profile
   ↓
2. Patient becomes incapacitated
   ↓
3. Hospital contacts emergency contact via phone
   ↓
4. Emergency contact verifies identity:
   - Security questions
   - SMS verification code
   - Photo ID check (in-person)
   ↓
5. Emergency contact logs into portal or speaks to admin
   ↓
6. Contact grants access to specific doctor(s) or hospital
   ↓
7. System creates access permission record
   - Logged as "granted by emergency contact"
   - Full audit trail maintained
   ↓
8. Doctor can access records
   ↓
9. Patient is notified when able
```

### Flow 3: Hospital Admission Emergency Protocol

```
1. Patient admitted to ER
   ↓
2. Admitting nurse/doctor activates emergency protocol:
   - Checks "Emergency Admission" on intake form
   - Selects hospital from dropdown
   ↓
3. System creates hospital-wide access permission:
   - All doctors at that hospital can access
   - Limited to ER department (configurable)
   - Auto-expires on discharge or 72 hours
   ↓
4. Any ER doctor at that hospital can view records
   ↓
5. Each view is logged individually in audit trail
   ↓
6. On patient discharge:
   - Admin marks patient as discharged
   - System auto-revokes hospital-wide access
   - Patient receives summary notification
```

---

## 📱 Implementation Examples

### Frontend: Doctor Requesting Emergency Access

```typescript
// DoctorDashboard.tsx
const requestEmergencyAccess = async (patientId: string) => {
  const { data, error } = await supabase
    .from('patient_access_permissions')
    .insert({
      patient_id: patientId,
      doctor_id: currentDoctorId,
      access_type: 'emergency',
      is_emergency_access: true,
      emergency_justification: justification,
      emergency_level: 'critical',
      emergency_expires_at: new Date(Date.now() + 24*60*60*1000), // 24 hours
      grant_method: 'emergency'
    });
  
  if (!error) {
    toast.success('Emergency access granted. Access expires in 24 hours.');
  }
};
```

### Backend: Checking Access Permissions

```typescript
// lib/database.service.ts
export async function canDoctorAccessPatientRecords(
  doctorId: string, 
  patientId: string
): Promise<boolean> {
  const { data } = await supabase
    .rpc('check_doctor_has_access', {
      p_doctor_id: doctorId,
      p_patient_id: patientId
    });
  
  return data === true;
}
```

### Backend: Logging Access

```typescript
// Middleware/Hook that runs before showing patient records
export async function logRecordAccess(
  patientId: string,
  doctorId: string,
  recordId: string | null,
  accessMethod: string,
  isEmergency: boolean = false
) {
  await supabase.from('patient_record_access_log').insert({
    patient_id: patientId,
    doctor_id: doctorId,
    record_id: recordId,
    access_method: accessMethod,
    action_performed: 'view',
    is_emergency_access: isEmergency,
    ip_address: getUserIP(),
    user_agent: navigator.userAgent
  });
}
```

---

## ✅ Testing Emergency Access

### Test Scenarios

1. **Scenario 1: Emergency Room Access**
   - Create test patient
   - Create test ER doctor
   - Request emergency access with justification
   - Verify access is granted
   - Verify auto-expiration works

2. **Scenario 2: Emergency Contact Authorization**
   - Add emergency contact to test patient
   - Verify emergency contact can log in
   - Have emergency contact grant access to doctor
   - Verify access is logged correctly

3. **Scenario 3: Hospital-Wide Access**
   - Create hospital admission record
   - Grant hospital-wide emergency access
   - Verify multiple doctors can access
   - Verify revocation on discharge

---

## 🚀 Next Steps

1. **Enable pg_cron Extension** in Supabase
   - Dashboard → Database → Extensions → Enable `pg_cron`
   
2. **Set Up Monitoring**
   - Dashboard for emergency access review
   - Alerts for suspicious patterns
   - Weekly compliance reports

3. **Patient Education**
   - In-app explanation of emergency access
   - FAQ section
   - Video tutorial on managing emergency contacts

4. **Staff Training**
   - ER doctors on proper use of emergency access
   - Compliance team on reviewing audit logs
   - Support team on handling patient concerns

---

## 📞 Support & Questions

For questions about emergency access implementation:
- Review audit logs: `/admin/compliance/emergency-access`
- Patient concerns: `/support/emergency-access-inquiry`
- Developer docs: `/docs/api/emergency-access`

---

**Last Updated**: 2026-02-03  
**Version**: 1.0  
**Maintained by**: HealthChain Development Team
