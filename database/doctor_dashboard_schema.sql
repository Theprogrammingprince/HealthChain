-- =====================================================
-- HEALTHCHAIN DOCTOR DASHBOARD SQL SCHEMA
-- =====================================================
-- This schema supports the doctor dashboard functionalities including:
-- - Doctor profiles and verification
-- - Medical record submissions
-- - Patient-doctor relationships
-- - Approval workflows (Hospital Admin & Patient)
-- - Audit trails
-- =====================================================

-- =====================================================
-- 1. DOCTOR PROFILES TABLE
-- =====================================================
-- Stores verified doctor information
CREATE TABLE IF NOT EXISTS doctor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    
    -- Professional Information
    medical_license_number VARCHAR(50) NOT NULL UNIQUE,
    specialty VARCHAR(100) NOT NULL,
    sub_specialty VARCHAR(100),
    years_of_experience INTEGER,
    
    -- Verification Status
    verification_status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended')),
    verification_date TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES auth.users(id),
    rejection_reason TEXT,
    
    -- Hospital Affiliation
    primary_hospital_id UUID REFERENCES hospital_profiles(id),
    hospital_department VARCHAR(100),
    
    -- Documents
    license_document_url TEXT,
    certification_urls TEXT[], -- Array of certification document URLs
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Index for faster lookups
CREATE INDEX idx_doctor_user_id ON doctor_profiles(user_id);
CREATE INDEX idx_doctor_verification_status ON doctor_profiles(verification_status);
CREATE INDEX idx_doctor_hospital ON doctor_profiles(primary_hospital_id);

-- =====================================================
-- 2. MEDICAL RECORD SUBMISSIONS TABLE
-- =====================================================
-- Stores all medical records submitted by doctors
CREATE TABLE IF NOT EXISTS medical_record_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_code VARCHAR(20) UNIQUE NOT NULL, -- e.g., "SUB-2024-001234"
    
    -- Relationships
    doctor_id UUID NOT NULL REFERENCES doctor_profiles(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES hospital_profiles(id),
    
    -- Record Details
    record_type VARCHAR(50) NOT NULL 
        CHECK (record_type IN ('Lab Result', 'Prescription', 'Imaging', 'Clinical Note', 'Diagnosis', 'Treatment Plan', 'Referral', 'Discharge Summary')),
    record_title VARCHAR(255) NOT NULL,
    record_description TEXT,
    
    -- Clinical Data (IPFS/Encrypted Storage)
    ipfs_hash VARCHAR(100), -- IPFS hash for decentralized storage
    encrypted_data_url TEXT, -- URL to encrypted medical data
    encryption_key_hash VARCHAR(255), -- Hash of encryption key (actual key stored separately)
    
    -- File Attachments
    attachment_urls TEXT[], -- Array of attachment URLs (images, PDFs, etc.)
    file_sizes INTEGER[], -- Corresponding file sizes in bytes
    file_types VARCHAR(50)[], -- MIME types
    
    -- Approval Workflow
    hospital_approval_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (hospital_approval_status IN ('pending', 'approved', 'rejected')),
    hospital_approved_by UUID REFERENCES auth.users(id),
    hospital_approval_date TIMESTAMP WITH TIME ZONE,
    hospital_rejection_reason TEXT,
    
    patient_approval_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (patient_approval_status IN ('pending', 'approved', 'rejected')),
    patient_approval_date TIMESTAMP WITH TIME ZONE,
    patient_rejection_reason TEXT,
    
    -- Overall Status (derived from both approvals)
    overall_status VARCHAR(30) NOT NULL DEFAULT 'draft'
        CHECK (overall_status IN ('draft', 'pending_hospital_review', 'pending_patient_approval', 'approved', 'rejected', 'archived')),
    
    -- Blockchain Integration
    blockchain_tx_hash VARCHAR(100), -- Transaction hash on blockchain
    blockchain_status VARCHAR(20) DEFAULT 'not_submitted'
        CHECK (blockchain_status IN ('not_submitted', 'pending', 'confirmed', 'failed')),
    
    -- Metadata
    is_draft BOOLEAN DEFAULT false,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    tags TEXT[], -- Searchable tags
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_submission_doctor ON medical_record_submissions(doctor_id);
CREATE INDEX idx_submission_patient ON medical_record_submissions(patient_id);
CREATE INDEX idx_submission_hospital ON medical_record_submissions(hospital_id);
CREATE INDEX idx_submission_status ON medical_record_submissions(overall_status);
CREATE INDEX idx_submission_type ON medical_record_submissions(record_type);
CREATE INDEX idx_submission_date ON medical_record_submissions(created_at DESC);

-- =====================================================
-- 3. DOCTOR-PATIENT RELATIONSHIPS TABLE
-- =====================================================
-- Tracks which doctors can submit records for which patients
CREATE TABLE IF NOT EXISTS doctor_patient_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctor_profiles(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Relationship Details
    relationship_type VARCHAR(30) NOT NULL DEFAULT 'treating_physician'
        CHECK (relationship_type IN ('treating_physician', 'consulting_physician', 'specialist', 'primary_care', 'emergency')),
    
    -- Permissions
    can_submit_records BOOLEAN DEFAULT true,
    can_view_history BOOLEAN DEFAULT true,
    can_request_emergency_access BOOLEAN DEFAULT false,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'inactive', 'revoked', 'expired')),
    
    -- Consent
    patient_consent_given BOOLEAN DEFAULT false,
    consent_date TIMESTAMP WITH TIME ZONE,
    consent_expiry_date TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    established_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_interaction_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: one active relationship per doctor-patient pair
    CONSTRAINT unique_active_relationship UNIQUE (doctor_id, patient_id, status)
);

-- Indexes
CREATE INDEX idx_doctor_patients ON doctor_patient_relationships(doctor_id);
CREATE INDEX idx_patient_doctors ON doctor_patient_relationships(patient_id);
CREATE INDEX idx_relationship_status ON doctor_patient_relationships(status);

-- =====================================================
-- 4. SUBMISSION AUDIT LOG TABLE
-- =====================================================
-- Tracks all actions performed on submissions
CREATE TABLE IF NOT EXISTS submission_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES medical_record_submissions(id) ON DELETE CASCADE,
    
    -- Action Details
    action_type VARCHAR(50) NOT NULL
        CHECK (action_type IN ('created', 'updated', 'submitted', 'hospital_approved', 'hospital_rejected', 'patient_approved', 'patient_rejected', 'archived', 'deleted', 'blockchain_submitted')),
    
    -- Actor
    performed_by UUID REFERENCES auth.users(id),
    actor_role VARCHAR(30), -- 'doctor', 'hospital_admin', 'patient'
    
    -- Changes
    previous_status VARCHAR(30),
    new_status VARCHAR(30),
    changes_made JSONB, -- Detailed changes in JSON format
    
    -- Additional Context
    reason TEXT,
    ip_address INET,
    user_agent TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_submission ON submission_audit_log(submission_id);
CREATE INDEX idx_audit_actor ON submission_audit_log(performed_by);
CREATE INDEX idx_audit_date ON submission_audit_log(created_at DESC);

-- =====================================================
-- 5. DOCTOR STATISTICS TABLE (Materialized View)
-- =====================================================
-- Pre-computed statistics for doctor dashboard
CREATE MATERIALIZED VIEW doctor_statistics AS
SELECT 
    dp.id AS doctor_id,
    dp.user_id,
    
    -- Patient Counts
    COUNT(DISTINCT dpr.patient_id) AS total_patients,
    COUNT(DISTINCT CASE WHEN dpr.status = 'active' THEN dpr.patient_id END) AS active_patients,
    
    -- Submission Counts
    COUNT(DISTINCT mrs.id) AS total_submissions,
    COUNT(DISTINCT CASE WHEN mrs.is_draft = true THEN mrs.id END) AS draft_records,
    COUNT(DISTINCT CASE WHEN mrs.overall_status = 'pending_hospital_review' THEN mrs.id END) AS pending_hospital_review,
    COUNT(DISTINCT CASE WHEN mrs.overall_status = 'pending_patient_approval' THEN mrs.id END) AS pending_patient_approval,
    COUNT(DISTINCT CASE WHEN mrs.overall_status = 'approved' THEN mrs.id END) AS approved_records,
    COUNT(DISTINCT CASE WHEN mrs.overall_status = 'rejected' THEN mrs.id END) AS rejected_records,
    
    -- This Week Stats
    COUNT(DISTINCT CASE WHEN mrs.created_at >= NOW() - INTERVAL '7 days' THEN mrs.id END) AS submissions_this_week,
    
    -- Approval Rate
    CASE 
        WHEN COUNT(DISTINCT CASE WHEN mrs.overall_status IN ('approved', 'rejected') THEN mrs.id END) > 0
        THEN ROUND(
            (COUNT(DISTINCT CASE WHEN mrs.overall_status = 'approved' THEN mrs.id END)::NUMERIC / 
             COUNT(DISTINCT CASE WHEN mrs.overall_status IN ('approved', 'rejected') THEN mrs.id END)::NUMERIC) * 100, 
            2
        )
        ELSE 0
    END AS approval_rate_percentage,
    
    -- Last Activity
    MAX(mrs.updated_at) AS last_submission_date,
    
    -- Updated timestamp
    NOW() AS last_updated
FROM 
    doctor_profiles dp
    LEFT JOIN doctor_patient_relationships dpr ON dp.id = dpr.doctor_id
    LEFT JOIN medical_record_submissions mrs ON dp.id = mrs.doctor_id
GROUP BY 
    dp.id, dp.user_id;

-- Index for materialized view
CREATE UNIQUE INDEX idx_doctor_stats_doctor_id ON doctor_statistics(doctor_id);

-- Refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_doctor_statistics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY doctor_statistics;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Trigger to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_doctor_profiles_updated_at BEFORE UPDATE ON doctor_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_submissions_updated_at BEFORE UPDATE ON medical_record_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctor_patient_relationships_updated_at BEFORE UPDATE ON doctor_patient_relationships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-generate submission code
CREATE OR REPLACE FUNCTION generate_submission_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.submission_code IS NULL THEN
        NEW.submission_code := 'SUB-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('submission_code_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for submission codes
CREATE SEQUENCE IF NOT EXISTS submission_code_seq START 1;

CREATE TRIGGER generate_submission_code_trigger BEFORE INSERT ON medical_record_submissions
    FOR EACH ROW EXECUTE FUNCTION generate_submission_code();

-- Trigger to create audit log entries
CREATE OR REPLACE FUNCTION log_submission_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO submission_audit_log (submission_id, action_type, performed_by, new_status)
        VALUES (NEW.id, 'created', NEW.doctor_id, NEW.overall_status);
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.overall_status != NEW.overall_status THEN
            INSERT INTO submission_audit_log (submission_id, action_type, performed_by, previous_status, new_status)
            VALUES (NEW.id, 'updated', NEW.doctor_id, OLD.overall_status, NEW.overall_status);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_submission_changes_trigger AFTER INSERT OR UPDATE ON medical_record_submissions
    FOR EACH ROW EXECUTE FUNCTION log_submission_changes();

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on tables
ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_record_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_patient_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_audit_log ENABLE ROW LEVEL SECURITY;

-- Doctor can view/edit their own profile
CREATE POLICY doctor_own_profile ON doctor_profiles
    FOR ALL USING (auth.uid() = user_id);

-- Hospital admins can view all doctor profiles in their hospital
CREATE POLICY hospital_view_doctors ON doctor_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM hospital_profiles hp
            WHERE hp.id = doctor_profiles.primary_hospital_id
            AND hp.user_id = auth.uid()
        )
    );

-- Doctors can view/edit their own submissions
CREATE POLICY doctor_own_submissions ON medical_record_submissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM doctor_profiles dp
            WHERE dp.id = medical_record_submissions.doctor_id
            AND dp.user_id = auth.uid()
        )
    );

-- Patients can view submissions related to them
CREATE POLICY patient_view_submissions ON medical_record_submissions
    FOR SELECT USING (patient_id = auth.uid());

-- Hospital admins can view/approve submissions from their hospital
CREATE POLICY hospital_manage_submissions ON medical_record_submissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM hospital_profiles hp
            WHERE hp.id = medical_record_submissions.hospital_id
            AND hp.user_id = auth.uid()
        )
    );

-- =====================================================
-- 8. USEFUL VIEWS FOR DASHBOARD QUERIES
-- =====================================================

-- View: Recent Submissions with Full Details
CREATE OR REPLACE VIEW recent_submissions_detailed AS
SELECT 
    mrs.id,
    mrs.submission_code,
    mrs.record_type,
    mrs.record_title,
    mrs.overall_status,
    mrs.hospital_approval_status,
    mrs.patient_approval_status,
    mrs.created_at,
    mrs.updated_at,
    
    -- Doctor Info
    dp.first_name || ' ' || dp.last_name AS doctor_name,
    dp.specialty AS doctor_specialty,
    
    -- Patient Info (anonymized for privacy)
    'Patient #' || SUBSTRING(mrs.patient_id::TEXT, 1, 8) AS patient_identifier,
    
    -- Hospital Info
    hp.hospital_name
FROM 
    medical_record_submissions mrs
    JOIN doctor_profiles dp ON mrs.doctor_id = dp.id
    LEFT JOIN hospital_profiles hp ON mrs.hospital_id = hp.id
ORDER BY 
    mrs.created_at DESC;

-- =====================================================
-- 9. SAMPLE DATA (FOR TESTING)
-- =====================================================

-- Note: This is commented out by default. Uncomment to insert sample data.

/*
-- Sample Doctor Profile
INSERT INTO doctor_profiles (user_id, first_name, last_name, email, medical_license_number, specialty, verification_status)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Sarah', 'Jenkins', 'sarah.jenkins@hospital.com', 'MD-2024-12345', 'Cardiology', 'verified');

-- Sample Submissions
INSERT INTO medical_record_submissions (doctor_id, patient_id, record_type, record_title, overall_status)
VALUES 
    ((SELECT id FROM doctor_profiles WHERE email = 'sarah.jenkins@hospital.com'), 
     '00000000-0000-0000-0000-000000000002', 
     'Lab Result', 
     'Blood Test - Complete Metabolic Panel', 
     'pending_hospital_review');
*/

-- =====================================================
-- END OF SCHEMA
-- =====================================================
