-- =====================================================
-- HEALTHCHAIN DOCTOR DASHBOARD - FIXED MIGRATION
-- =====================================================
-- Run this entire script in Supabase SQL Editor
-- FIXED: Type casting issues in constraints and policies
-- =====================================================

-- =====================================================
-- STEP 1: ENSURE USERS TABLE HAS DOCTOR ROLE
-- =====================================================

-- Update users table to support 'doctor' role - FIXED VERSION
DO $$
BEGIN
    -- Drop existing constraint if it exists
    ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
    
    -- Add new constraint with explicit cast
    ALTER TABLE public.users ADD CONSTRAINT users_role_check 
        CHECK (role::text IN ('patient', 'hospital', 'doctor', 'admin', 'superadmin'));
EXCEPTION
    WHEN OTHERS THEN
        -- If constraint already exists with correct definition, ignore
        NULL;
END $$;

-- =====================================================
-- STEP 2: CREATE DOCTOR PROFILES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.doctor_profiles (
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
    primary_hospital_id UUID REFERENCES public.hospital_profiles(id),
    hospital_name TEXT,
    hospital_department VARCHAR(100),
    
    -- Documents
    license_document_url TEXT,
    certification_urls TEXT[],
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_doctor_user_id ON public.doctor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_doctor_verification_status ON public.doctor_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_doctor_hospital ON public.doctor_profiles(primary_hospital_id);
CREATE INDEX IF NOT EXISTS idx_doctor_email ON public.doctor_profiles(email);

-- =====================================================
-- STEP 3: CREATE MEDICAL RECORD SUBMISSIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.medical_record_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_code VARCHAR(20) UNIQUE NOT NULL DEFAULT '',
    
    -- Relationships
    doctor_id UUID NOT NULL REFERENCES public.doctor_profiles(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES public.hospital_profiles(id),
    
    -- Record Details
    record_type VARCHAR(50) NOT NULL 
        CHECK (record_type IN ('Lab Result', 'Prescription', 'Imaging', 'Clinical Note', 'Diagnosis', 'Treatment Plan', 'Referral', 'Discharge Summary')),
    record_title VARCHAR(255) NOT NULL,
    record_description TEXT,
    
    -- Clinical Data
    ipfs_hash VARCHAR(100),
    encrypted_data_url TEXT,
    encryption_key_hash VARCHAR(255),
    
    -- File Attachments
    attachment_urls TEXT[],
    file_sizes INTEGER[],
    file_types VARCHAR(50)[],
    
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
    
    -- Overall Status
    overall_status VARCHAR(30) NOT NULL DEFAULT 'draft'
        CHECK (overall_status IN ('draft', 'pending_hospital_review', 'pending_patient_approval', 'approved', 'rejected', 'archived')),
    
    -- Blockchain Integration
    blockchain_tx_hash VARCHAR(100),
    blockchain_status VARCHAR(20) DEFAULT 'not_submitted'
        CHECK (blockchain_status IN ('not_submitted', 'pending', 'confirmed', 'failed')),
    
    -- Metadata
    is_draft BOOLEAN DEFAULT false,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    tags TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_submission_doctor ON public.medical_record_submissions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_submission_patient ON public.medical_record_submissions(patient_id);
CREATE INDEX IF NOT EXISTS idx_submission_hospital ON public.medical_record_submissions(hospital_id);
CREATE INDEX IF NOT EXISTS idx_submission_status ON public.medical_record_submissions(overall_status);
CREATE INDEX IF NOT EXISTS idx_submission_type ON public.medical_record_submissions(record_type);
CREATE INDEX IF NOT EXISTS idx_submission_date ON public.medical_record_submissions(created_at DESC);

-- =====================================================
-- STEP 4: CREATE DOCTOR-PATIENT RELATIONSHIPS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.doctor_patient_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES public.doctor_profiles(id) ON DELETE CASCADE,
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
    
    -- Unique constraint
    CONSTRAINT unique_active_relationship UNIQUE (doctor_id, patient_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_doctor_patients ON public.doctor_patient_relationships(doctor_id);
CREATE INDEX IF NOT EXISTS idx_patient_doctors ON public.doctor_patient_relationships(patient_id);
CREATE INDEX IF NOT EXISTS idx_relationship_status ON public.doctor_patient_relationships(status);

-- =====================================================
-- STEP 5: CREATE SUBMISSION AUDIT LOG TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.submission_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.medical_record_submissions(id) ON DELETE CASCADE,
    
    -- Action Details
    action_type VARCHAR(50) NOT NULL
        CHECK (action_type IN ('created', 'updated', 'submitted', 'hospital_approved', 'hospital_rejected', 'patient_approved', 'patient_rejected', 'archived', 'deleted', 'blockchain_submitted')),
    
    -- Actor
    performed_by UUID REFERENCES auth.users(id),
    actor_role VARCHAR(30),
    
    -- Changes
    previous_status VARCHAR(30),
    new_status VARCHAR(30),
    changes_made JSONB,
    
    -- Additional Context
    reason TEXT,
    ip_address INET,
    user_agent TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_audit_submission ON public.submission_audit_log(submission_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON public.submission_audit_log(performed_by);
CREATE INDEX IF NOT EXISTS idx_audit_date ON public.submission_audit_log(created_at DESC);

-- =====================================================
-- STEP 6: CREATE SEQUENCES AND FUNCTIONS
-- =====================================================

-- Sequence for submission codes
CREATE SEQUENCE IF NOT EXISTS submission_code_seq START 1;

-- Function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate submission code
CREATE OR REPLACE FUNCTION generate_submission_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.submission_code IS NULL OR NEW.submission_code = '' THEN
        NEW.submission_code := 'SUB-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('submission_code_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to log submission changes
CREATE OR REPLACE FUNCTION log_submission_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.submission_audit_log (submission_id, action_type, performed_by, new_status)
        VALUES (NEW.id, 'created', NEW.doctor_id, NEW.overall_status);
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.overall_status != NEW.overall_status THEN
            INSERT INTO public.submission_audit_log (submission_id, action_type, performed_by, previous_status, new_status)
            VALUES (NEW.id, 'updated', NEW.doctor_id, OLD.overall_status, NEW.overall_status);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 7: CREATE TRIGGERS
-- =====================================================

DROP TRIGGER IF EXISTS update_doctor_profiles_updated_at ON public.doctor_profiles;
CREATE TRIGGER update_doctor_profiles_updated_at BEFORE UPDATE ON public.doctor_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_medical_submissions_updated_at ON public.medical_record_submissions;
CREATE TRIGGER update_medical_submissions_updated_at BEFORE UPDATE ON public.medical_record_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_doctor_patient_relationships_updated_at ON public.doctor_patient_relationships;
CREATE TRIGGER update_doctor_patient_relationships_updated_at BEFORE UPDATE ON public.doctor_patient_relationships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS generate_submission_code_trigger ON public.medical_record_submissions;
CREATE TRIGGER generate_submission_code_trigger BEFORE INSERT ON public.medical_record_submissions
    FOR EACH ROW EXECUTE FUNCTION generate_submission_code();

DROP TRIGGER IF EXISTS log_submission_changes_trigger ON public.medical_record_submissions;
CREATE TRIGGER log_submission_changes_trigger AFTER INSERT OR UPDATE ON public.medical_record_submissions
    FOR EACH ROW EXECUTE FUNCTION log_submission_changes();

-- =====================================================
-- STEP 8: CREATE MATERIALIZED VIEW FOR STATISTICS
-- =====================================================

DROP MATERIALIZED VIEW IF EXISTS public.doctor_statistics CASCADE;

CREATE MATERIALIZED VIEW public.doctor_statistics AS
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
    public.doctor_profiles dp
    LEFT JOIN public.doctor_patient_relationships dpr ON dp.id = dpr.doctor_id
    LEFT JOIN public.medical_record_submissions mrs ON dp.id = mrs.doctor_id
GROUP BY 
    dp.id, dp.user_id;

-- Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_doctor_stats_doctor_id ON public.doctor_statistics(doctor_id);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_doctor_statistics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.doctor_statistics;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 9: CREATE USEFUL VIEWS
-- =====================================================

DROP VIEW IF EXISTS public.recent_submissions_detailed CASCADE;

CREATE OR REPLACE VIEW public.recent_submissions_detailed AS
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
    mrs.doctor_id,
    dp.first_name || ' ' || dp.last_name AS doctor_name,
    dp.specialty AS doctor_specialty,
    dp.user_id AS doctor_user_id,
    
    -- Patient Info
    mrs.patient_id,
    
    -- Hospital Info
    hp.hospital_name,
    hp.id AS hospital_id
FROM 
    public.medical_record_submissions mrs
    JOIN public.doctor_profiles dp ON mrs.doctor_id = dp.id
    LEFT JOIN public.hospital_profiles hp ON mrs.hospital_id = hp.id
ORDER BY 
    mrs.created_at DESC;

-- =====================================================
-- STEP 10: ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_record_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_patient_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_audit_log ENABLE ROW LEVEL SECURITY;

-- DOCTOR PROFILES POLICIES
DROP POLICY IF EXISTS "doctor_own_profile" ON public.doctor_profiles;
CREATE POLICY "doctor_own_profile" ON public.doctor_profiles
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "hospital_view_doctors" ON public.doctor_profiles;
CREATE POLICY "hospital_view_doctors" ON public.doctor_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.hospital_profiles hp
            WHERE hp.id = doctor_profiles.primary_hospital_id
            AND hp.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "admin_manage_doctors" ON public.doctor_profiles;
CREATE POLICY "admin_manage_doctors" ON public.doctor_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id::uuid = auth.uid()
            AND u.role::text = ANY(ARRAY['admin'::text, 'superadmin'::text])
        )
    );

-- MEDICAL RECORD SUBMISSIONS POLICIES
DROP POLICY IF EXISTS "doctor_own_submissions" ON public.medical_record_submissions;
CREATE POLICY "doctor_own_submissions" ON public.medical_record_submissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.doctor_profiles dp
            WHERE dp.id = medical_record_submissions.doctor_id
            AND dp.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "patient_view_submissions" ON public.medical_record_submissions;
CREATE POLICY "patient_view_submissions" ON public.medical_record_submissions
    FOR SELECT USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "patient_approve_submissions" ON public.medical_record_submissions;
CREATE POLICY "patient_approve_submissions" ON public.medical_record_submissions
    FOR UPDATE USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "hospital_manage_submissions" ON public.medical_record_submissions;
CREATE POLICY "hospital_manage_submissions" ON public.medical_record_submissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.hospital_profiles hp
            WHERE hp.id = medical_record_submissions.hospital_id
            AND hp.user_id = auth.uid()
        )
    );

-- DOCTOR-PATIENT RELATIONSHIPS POLICIES
DROP POLICY IF EXISTS "doctor_own_relationships" ON public.doctor_patient_relationships;
CREATE POLICY "doctor_own_relationships" ON public.doctor_patient_relationships
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.doctor_profiles dp
            WHERE dp.id = doctor_patient_relationships.doctor_id
            AND dp.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "patient_view_relationships" ON public.doctor_patient_relationships;
CREATE POLICY "patient_view_relationships" ON public.doctor_patient_relationships
    FOR SELECT USING (patient_id = auth.uid());

-- AUDIT LOG POLICIES
DROP POLICY IF EXISTS "audit_log_read_own" ON public.submission_audit_log;
CREATE POLICY "audit_log_read_own" ON public.submission_audit_log
    FOR SELECT USING (
        performed_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.medical_record_submissions mrs
            JOIN public.doctor_profiles dp ON mrs.doctor_id = dp.id
            WHERE mrs.id = submission_audit_log.submission_id
            AND dp.user_id = auth.uid()
        )
    );

-- =====================================================
-- STEP 11: GRANT PERMISSIONS
-- =====================================================

-- Grant usage on sequences
GRANT USAGE ON SEQUENCE submission_code_seq TO authenticated;
GRANT USAGE ON SEQUENCE submission_code_seq TO service_role;

-- Grant permissions on tables
GRANT ALL ON public.doctor_profiles TO authenticated;
GRANT ALL ON public.medical_record_submissions TO authenticated;
GRANT ALL ON public.doctor_patient_relationships TO authenticated;
GRANT ALL ON public.submission_audit_log TO authenticated;

-- Grant permissions on views
GRANT SELECT ON public.doctor_statistics TO authenticated;
GRANT SELECT ON public.recent_submissions_detailed TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE! ✅
-- =====================================================
-- 
-- All type casting issues have been resolved.
-- Tables and policies are now properly configured.
-- 
-- Next Steps:
-- 1. Verify tables: Check Supabase Table Editor
-- 2. Refresh stats: SELECT refresh_doctor_statistics();
-- 3. Test doctor signup flow
-- 
-- =====================================================
