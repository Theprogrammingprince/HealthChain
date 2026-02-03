# Patient-Doctor Access Control System - Architecture Summary

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         HEALTHCHAIN ACCESS CONTROL                   │
└─────────────────────────────────────────────────────────────────────┘

                    ┌──────────────────────────┐
                    │      PATIENT LAYER       │
                    │  - Grant Access          │
                    │  - Revoke Access         │
                    │  - Generate Codes        │
                    │  - View Audit Logs       │
                    │  - Manage Contacts       │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │   ACCESS CONTROL ENGINE   │
                    │                          │
                    │  ┌────────────────────┐  │
                    │  │ Permissions Table  │  │
                    │  │ - persistent grants│  │
                    │  │ - time-limited     │  │
                    │  │ - emergency        │  │
                    │  └────────────────────┘  │
                    │                          │
                    │  ┌────────────────────┐  │
                    │  │  Access Codes      │  │
                    │  │ - QR codes         │  │
                    │  │ - PINs             │  │
                    │  │ - one-time use     │  │
                    │  └────────────────────┘  │
                    │                          │
                    │  ┌────────────────────┐  │
                    │  │   Audit Logger     │  │
                    │  │ - every access     │  │
                    │  │ - HIPAA compliant  │  │
                    │  └────────────────────┘  │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │      DOCTOR LAYER        │
                    │  - Request Access        │
                    │  - Use Access Codes      │
                    │  - Emergency Access      │
                    │  - View Records          │
                    └──────────────────────────┘
```

---

## 🔐 Access Methods Comparison

| Method | Use Case | Patient Action | Doctor Action | Duration | Auto-Expire |
|--------|----------|----------------|---------------|----------|-------------|
| **Persistent Grant** | Ongoing care, primary doctor | Grant access via UI | None needed | Customizable | Optional |
| **QR Code** | In-person visit | Generate code, show to doctor | Scan code | 1-6 hours | Yes |
| **PIN Code** | Phone consultation | Generate PIN, share via phone | Enter PIN | 1 hour | Yes |
| **Emergency Access** | Unconscious patient | None (incapacitated) | Request with justification | 24-72 hours | Yes |
| **Hospital Admission** | ER visit | None | Hospital activates protocol | Until discharge | Yes |
| **Emergency Contact** | Patient unable to consent | None | Contact authorizes | Varies | Optional |

---

## 📊 Database Schema Relationships

```
patient_access_permissions
├── patient_id → auth.users(id)
├── doctor_id → doctor_profiles(id)
├── hospital_id → hospital_profiles(id)
└── granted_by → auth.users(id)

patient_access_codes
├── patient_id → auth.users(id)
├── used_by_doctor_id → doctor_profiles(id)
└── used_by_hospital_id → hospital_profiles(id)

patient_record_access_log
├── patient_id → auth.users(id)
├── doctor_id → doctor_profiles(id)
├── record_id → medical_record_submissions(id)
├── permission_id → patient_access_permissions(id)
└── access_code_id → patient_access_codes(id)

patient_emergency_contacts
├── patient_id → auth.users(id)
└── verified_by → auth.users(id)
```

---

## 🔄 Access Flow Diagrams

### 1. Normal Access Grant Flow

```
PATIENT                          SYSTEM                         DOCTOR
   │                                │                               │
   │  1. Search for doctor          │                               │
   ├───────────────────────────────►│                               │
   │                                │                               │
   │  2. Select access type         │                               │
   │     (read, read_write, full)   │                               │
   ├───────────────────────────────►│                               │
   │                                │                               │
   │  3. Set expiration (optional)  │                               │
   ├───────────────────────────────►│                               │
   │                                │                               │
   │                                │  4. Create permission record  │
   │                                ├──────────────────────────────►│
   │                                │                               │
   │                                │  5. Send notification         │
   │                                ├──────────────────────────────►│
   │  6. Confirmation               │                               │
   │◄───────────────────────────────┤                               │
   │                                │  7. Doctor can access records │
   │                                │◄──────────────────────────────┤
   │                                │                               │
   │  8. Patient notified on access │                               │
   │◄───────────────────────────────┤                               │
```

### 2. QR Code Access Flow

```
PATIENT                          SYSTEM                         DOCTOR
   │                                │                               │
   │  1. Generate QR code           │                               │
   ├───────────────────────────────►│                               │
   │                                │                               │
   │  2. Code created (6-digit)     │                               │
   │◄───────────────────────────────┤                               │
   │                                │                               │
   │  3. Show QR to doctor          │                               │
   ├────────────────────────────────┼──────────────────────────────►│
   │                                │                               │
   │                                │  4. Doctor scans/enters code  │
   │                                │◄──────────────────────────────┤
   │                                │                               │
   │                                │  5. Validate code             │
   │                                ├───────┐                       │
   │                                │       │                       │
   │                                │◄──────┘                       │
   │                                │                               │
   │                                │  6. Create temp permission    │
   │                                ├──────────────────────────────►│
   │                                │                               │
   │  7. Access granted notification│                               │
   │◄───────────────────────────────┤                               │
   │                                │                               │
   │                                │  8. Access expires after 1h   │
   │                                ├──────────────────────────────►│
```

### 3. Emergency Access Flow

```
PATIENT (unconscious)            SYSTEM                         ER DOCTOR
   │                                │                               │
   │                                │  1. Search patient (ID/name)  │
   │                                │◄──────────────────────────────┤
   │                                │                               │
   │                                │  2. Request emergency access  │
   │                                │◄──────────────────────────────┤
   │                                │     - Justification           │
   │                                │     - Emergency level         │
   │                                │                               │
   │                                │  3. Auto-grant access         │
   │                                ├──────────────────────────────►│
   │                                │                               │
   │                                │  4. Log emergency access      │
   │                                ├───────┐                       │
   │                                │       │                       │
   │                                │◄──────┘                       │
   │                                │                               │
   │                                │  5. Doctor accesses records   │
   │                                │◄──────────────────────────────┤
   │                                │                               │
   │  (Patient wakes up)            │                               │
   │                                │                               │
   │  6. Emergency access notification                              │
   │◄───────────────────────────────┤                               │
   │                                │                               │
   │  7. Review access log          │                               │
   ├───────────────────────────────►│                               │
   │                                │                               │
   │  8. Revoke if concerned        │                               │
   ├───────────────────────────────►│  9. Access revoked            │
   │                                ├──────────────────────────────►│
```

---

## 🛡️ Security Layers

```
┌─────────────────────────────────────────────────┐
│              SECURITY LAYER 1                    │
│         Row Level Security (RLS)                 │
│  - Postgres-level access control                │
│  - Users can only see their own data            │
└─────────────────────────────────────────────────┘
                     │
┌─────────────────────────────────────────────────┐
│              SECURITY LAYER 2                    │
│        Permission Validation                     │
│  - Check valid permission exists                │
│  - Validate expiration dates                    │
│  - Check record type restrictions               │
└─────────────────────────────────────────────────┘
                     │
┌─────────────────────────────────────────────────┐
│              SECURITY LAYER 3                    │
│           Access Logging                         │
│  - Log every single access                      │
│  - IP address tracking                          │
│  - User agent logging                           │
└─────────────────────────────────────────────────┘
                     │
┌─────────────────────────────────────────────────┐
│              SECURITY LAYER 4                    │
│         Anomaly Detection                        │
│  - Flag unusual access patterns                 │
│  - Alert on multiple emergency accesses         │
│  - Monitor access frequency                     │
└─────────────────────────────────────────────────┘
                     │
┌─────────────────────────────────────────────────┐
│              SECURITY LAYER 5                    │
│       Patient Notifications                      │
│  - Real-time access notifications               │
│  - Weekly access summary                        │
│  - Option to review and revoke                  │
└─────────────────────────────────────────────────┘
```

---

## 📱 UI Components Architecture

```
app/
├── patient/
│   ├── dashboard/
│   │   └── page.tsx (main dashboard)
│   ├── access-management/
│   │   ├── page.tsx (manage all access)
│   │   ├── grant-access/
│   │   │   └── page.tsx (grant new access)
│   │   └── access-log/
│   │       └── page.tsx (view access history)
│   └── emergency-contacts/
│       └── page.tsx (manage contacts)
│
├── doctor/
│   ├── dashboard/
│   │   └── page.tsx (main dashboard)
│   ├── patients/
│   │   ├── page.tsx (list patients with access)
│   │   └── [patientId]/
│   │       └── page.tsx (view patient records)
│   └── emergency-access/
│       └── request/
│           └── page.tsx (request emergency access)
│
└── admin/
    └── compliance/
        ├── emergency-access/
        │   └── page.tsx (monitor emergency accesses)
        └── access-audit/
            └── page.tsx (full audit trail)

components/
├── access-control/
│   ├── GrantAccessDialog.tsx
│   ├── RevokeAccessDialog.tsx
│   ├── GenerateAccessCodeDialog.tsx
│   ├── UseAccessCodeDialog.tsx
│   ├── RequestEmergencyAccessDialog.tsx
│   ├── AccessPermissionsList.tsx
│   ├── AccessLogViewer.tsx
│   └── EmergencyContactsManager.tsx
│
└── ui/
    ├── QRCodeDisplay.tsx (show QR code)
    ├── QRCodeScanner.tsx (scan QR code)
    └── AccessTimeline.tsx (visual access history)
```

---

## 🔢 Database Table Summary

| Table | Records | Purpose | Key Features |
|-------|---------|---------|--------------|
| **patient_access_permissions** | ~100K/year | Persistent access grants | Time-limited, record-type filtering, emergency access |
| **patient_access_codes** | ~500K/year | Temporary QR/PIN codes | One-time use, auto-expire, scan tracking |
| **patient_record_access_log** | ~5M/year | Full audit trail | HIPAA compliance, anomaly detection |
| **patient_emergency_contacts** | ~50K total | Emergency contact info | Priority levels, verification status |

---

## 📈 Performance Considerations

### Indexes Created
- `idx_permissions_patient` - Fast patient permission lookup
- `idx_permissions_doctor` - Fast doctor permission lookup
- `idx_permissions_expires` - Quick expiration checks
- `idx_access_log_accessed_at` - Efficient log queries
- `idx_access_codes_code` - Fast code validation

### Auto-Expiration Strategy
- **Cron Job** runs every hour to expire old permissions
- **Trigger** checks expiration on every read
- **Application layer** also validates before showing access

### Scalability
- RLS policies optimized with EXISTS clauses
- Materialized views for complex queries
- Partitioning consideration for access_log (by date)

---

## 🎯 Access Control Decision Tree

```
Doctor attempts to access patient record
            │
            ▼
    ┌───────────────┐
    │ Is this the   │
    │ doctor's own  │───YES──► ALLOW
    │ record?       │
    └───────┬───────┘
            │ NO
            ▼
    ┌───────────────┐
    │ Does active   │
    │ permission    │───YES──► Check record type
    │ exist?        │                │
    └───────┬───────┘                │
            │ NO                     ▼
            │              ┌──────────────────┐
            │              │ Is record type   │
            │              │ allowed?         │───YES──► LOG + ALLOW
            │              └─────────┬────────┘
            │                        │ NO
            │                        ▼
            │                      DENY
            ▼
    ┌───────────────┐
    │ Has valid     │
    │ access code?  │───YES──► Create temp permission
    └───────┬───────┘                │
            │ NO                     ▼
            │                 LOG + ALLOW
            ▼
    ┌───────────────┐
    │ Is this       │
    │ emergency     │───YES──► Show emergency form
    │ access?       │                │
    └───────┬───────┘                │
            │ NO                     ▼
            │              ┌──────────────────┐
            │              │ Justification    │
            │              │ provided?        │───YES──► Auto-grant + LOG
            │              └─────────┬────────┘
            │                        │ NO
            │                        ▼
            ▼                      DENY
          DENY
```

---

## 🚀 Implementation Priority

### Phase 1: Core Access Control (Week 1)
- [x] Database migration
- [ ] Service functions
- [ ] Grant/revoke access UI
- [ ] Basic access logging

### Phase 2: Access Codes (Week 2)
- [ ] QR code generation
- [ ] QR code scanning
- [ ] PIN code system
- [ ] Code redemption flow

### Phase 3: Emergency Access (Week 3)
- [ ] Emergency request dialog
- [ ] Auto-grant mechanism
- [ ] Emergency contact management
- [ ] Patient notification system

### Phase 4: Compliance & Monitoring (Week 4)
- [ ] Access log viewer
- [ ] Admin compliance dashboard
- [ ] Anomaly detection
- [ ] Reporting system

---

## 📝 Key Takeaways

1. **Multiple Access Methods**: Patients have 6 different ways to grant access
2. **Emergency-First Design**: System handles unconscious patients gracefully
3. **Full Audit Trail**: Every access is logged for HIPAA compliance
4. **Time-Limited by Default**: Most access auto-expires for security
5. **Patient Control**: Patients can revoke access anytime
6. **Notification System**: Patients are always notified of access
7. **RLS Security**: Postgres-level security prevents data leaks

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-03  
**Status**: Ready for Implementation ✅
