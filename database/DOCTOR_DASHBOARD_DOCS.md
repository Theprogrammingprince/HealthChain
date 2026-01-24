# Doctor Dashboard - SQL Schema & Functionalities Documentation

## Overview
This document describes the SQL schema and functionalities for the HealthChain Doctor Dashboard (`/doctor/dashboard`).

## Database Tables

### 1. **doctor_profiles**
Stores verified doctor information and credentials.

**Key Fields:**
- `medical_license_number` - Unique license identifier
- `specialty` / `sub_specialty` - Medical specialization
- `verification_status` - pending, verified, rejected, suspended
- `primary_hospital_id` - Hospital affiliation

**Functionalities:**
- ✅ Doctor registration and profile management
- ✅ License verification workflow
- ✅ Hospital affiliation tracking
- ✅ Document storage (licenses, certifications)

---

### 2. **medical_record_submissions**
Core table for all medical records submitted by doctors.

**Key Fields:**
- `submission_code` - Auto-generated unique code (e.g., SUB-2024-001234)
- `record_type` - Lab Result, Prescription, Imaging, Clinical Note, etc.
- `hospital_approval_status` - Hospital admin approval workflow
- `patient_approval_status` - Patient consent workflow
- `overall_status` - Derived status from both approvals
- `ipfs_hash` - Decentralized storage reference
- `blockchain_tx_hash` - Blockchain transaction reference

**Functionalities:**
- ✅ Multi-step approval workflow (Hospital → Patient)
- ✅ Draft mode for incomplete submissions
- ✅ File attachment support (images, PDFs, etc.)
- ✅ IPFS/blockchain integration
- ✅ Priority levels (low, normal, high, urgent)
- ✅ Tagging and categorization

---

### 3. **doctor_patient_relationships**
Manages which doctors can submit records for which patients.

**Key Fields:**
- `relationship_type` - treating_physician, consulting_physician, specialist, etc.
- `can_submit_records` - Permission flag
- `patient_consent_given` - Explicit patient consent
- `consent_expiry_date` - Time-limited access

**Functionalities:**
- ✅ Patient consent management
- ✅ Permission-based access control
- ✅ Relationship tracking (primary care, specialist, etc.)
- ✅ Time-limited access grants
- ✅ Emergency access requests

---

### 4. **submission_audit_log**
Complete audit trail of all actions on submissions.

**Key Fields:**
- `action_type` - created, updated, approved, rejected, etc.
- `performed_by` - User who performed the action
- `changes_made` - JSON object with detailed changes
- `ip_address` / `user_agent` - Security tracking

**Functionalities:**
- ✅ Complete audit trail for compliance
- ✅ Change tracking with before/after states
- ✅ Security monitoring (IP, user agent)
- ✅ HIPAA compliance support

---

### 5. **doctor_statistics** (Materialized View)
Pre-computed statistics for fast dashboard loading.

**Metrics:**
- Total patients (active and inactive)
- Submission counts by status
- Draft records count
- Pending reviews count
- Approval rate percentage
- Weekly submission trends

**Functionalities:**
- ✅ Real-time dashboard statistics
- ✅ Performance optimization via materialized view
- ✅ Automatic refresh mechanism

---

## Dashboard Functionalities

### 📊 **Statistics Overview**
```sql
-- Get doctor statistics
SELECT * FROM doctor_statistics WHERE user_id = [current_user_id];
```
**Displays:**
- Total Patients: 1,204
- Draft Records: 12
- Pending Review: 5
- This Week: +24
- Approval Rate: 98%

---

### 📝 **Record Submission Form**
```sql
-- Create new submission
INSERT INTO medical_record_submissions (
    doctor_id, patient_id, record_type, record_title, 
    record_description, attachment_urls, is_draft
) VALUES (...);
```
**Features:**
- Patient search and selection
- Record type selection (8 types)
- File upload (multiple attachments)
- Draft saving
- Encryption before storage

---

### 📋 **Recent Submissions List**
```sql
-- Get recent submissions for doctor
SELECT * FROM recent_submissions_detailed
WHERE doctor_name = [current_doctor]
ORDER BY created_at DESC
LIMIT 10;
```
**Shows:**
- Submission ID and code
- Patient identifier (anonymized)
- Record type
- Status badge (color-coded)
- Date submitted
- Quick actions (view, edit, delete)

---

### ✅ **Approval Workflow**

#### Hospital Admin Approval
```sql
-- Hospital approves submission
UPDATE medical_record_submissions
SET 
    hospital_approval_status = 'approved',
    hospital_approved_by = [admin_user_id],
    hospital_approval_date = NOW(),
    overall_status = 'pending_patient_approval'
WHERE id = [submission_id];
```

#### Patient Approval
```sql
-- Patient approves submission
UPDATE medical_record_submissions
SET 
    patient_approval_status = 'approved',
    patient_approval_date = NOW(),
    overall_status = 'approved'
WHERE id = [submission_id];
```

**Status Flow:**
1. `draft` → Doctor creates record
2. `pending_hospital_review` → Doctor submits
3. `pending_patient_approval` → Hospital approves
4. `approved` → Patient approves
5. Record added to blockchain

---

### 🔍 **Patient Search & Relationship Management**
```sql
-- Get doctor's patients
SELECT 
    p.id,
    p.email,
    dpr.relationship_type,
    dpr.status,
    dpr.patient_consent_given
FROM doctor_patient_relationships dpr
JOIN auth.users p ON dpr.patient_id = p.id
WHERE dpr.doctor_id = [doctor_id]
AND dpr.status = 'active';
```

---

### 🔐 **Security Features**

#### Row Level Security (RLS)
- Doctors can only see their own submissions
- Patients can only see their own records
- Hospital admins can see submissions from their hospital

#### Audit Logging
Every action is logged:
```sql
-- Automatic trigger logs all changes
CREATE TRIGGER log_submission_changes_trigger 
AFTER INSERT OR UPDATE ON medical_record_submissions
FOR EACH ROW EXECUTE FUNCTION log_submission_changes();
```

---

## API Endpoints (Suggested)

### Doctor Endpoints
```
GET    /api/doctor/profile              - Get doctor profile
PUT    /api/doctor/profile              - Update profile
GET    /api/doctor/statistics           - Get dashboard stats
GET    /api/doctor/patients             - List patients
GET    /api/doctor/submissions          - List submissions
POST   /api/doctor/submissions          - Create submission
PUT    /api/doctor/submissions/:id      - Update submission
DELETE /api/doctor/submissions/:id      - Delete submission
GET    /api/doctor/submissions/:id/audit - Get audit trail
```

### Submission Workflow Endpoints
```
POST   /api/submissions/:id/submit      - Submit for review
POST   /api/submissions/:id/approve     - Approve (hospital/patient)
POST   /api/submissions/:id/reject      - Reject with reason
POST   /api/submissions/:id/archive     - Archive submission
```

---

## Integration Points

### 🔗 **Blockchain Integration**
- Approved records are submitted to blockchain
- Transaction hash stored in `blockchain_tx_hash`
- Status tracked in `blockchain_status`

### 📦 **IPFS Storage**
- Encrypted medical data stored on IPFS
- Hash stored in `ipfs_hash`
- Decentralized and immutable

### 🏥 **Hospital System Integration**
- Links to `hospital_profiles` table
- Hospital admin approval workflow
- Department tracking

### 👤 **Patient Portal Integration**
- Patient consent management
- Patient approval workflow
- Access control via relationships

---

## Performance Optimizations

### Indexes
```sql
-- Fast lookups
CREATE INDEX idx_submission_doctor ON medical_record_submissions(doctor_id);
CREATE INDEX idx_submission_status ON medical_record_submissions(overall_status);
CREATE INDEX idx_submission_date ON medical_record_submissions(created_at DESC);
```

### Materialized View
```sql
-- Refresh statistics (run periodically)
SELECT refresh_doctor_statistics();
```

---

## Compliance & Privacy

### HIPAA Compliance
- ✅ Complete audit trails
- ✅ Access control via RLS
- ✅ Encryption at rest
- ✅ Patient consent tracking
- ✅ Time-limited access

### Data Privacy
- ✅ Patient identifiers anonymized in views
- ✅ Encrypted storage for sensitive data
- ✅ Row-level security policies
- ✅ Audit logging with IP tracking

---

## Migration & Setup

### 1. Run the schema
```bash
psql -U postgres -d healthchain -f database/doctor_dashboard_schema.sql
```

### 2. Set up periodic refresh (optional)
```sql
-- Refresh statistics every hour
SELECT cron.schedule('refresh-doctor-stats', '0 * * * *', 'SELECT refresh_doctor_statistics();');
```

### 3. Grant permissions
```sql
-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON doctor_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON medical_record_submissions TO authenticated;
```

---

## Example Queries

### Get Doctor Dashboard Data
```sql
-- Complete dashboard data for a doctor
WITH doctor_info AS (
    SELECT id, user_id, first_name, last_name, specialty
    FROM doctor_profiles
    WHERE user_id = auth.uid()
)
SELECT 
    -- Doctor Info
    di.*,
    
    -- Statistics
    ds.total_patients,
    ds.draft_records,
    ds.pending_hospital_review,
    ds.approval_rate_percentage,
    ds.submissions_this_week,
    
    -- Recent Submissions
    (
        SELECT json_agg(row_to_json(rsd))
        FROM (
            SELECT * FROM recent_submissions_detailed
            WHERE doctor_name = di.first_name || ' ' || di.last_name
            ORDER BY created_at DESC
            LIMIT 4
        ) rsd
    ) AS recent_submissions
FROM doctor_info di
LEFT JOIN doctor_statistics ds ON di.id = ds.doctor_id;
```

---

## Future Enhancements

- [ ] Real-time notifications (Supabase Realtime)
- [ ] Advanced analytics and reporting
- [ ] AI-powered record suggestions
- [ ] Telemedicine integration
- [ ] Multi-language support
- [ ] Mobile app API optimization
