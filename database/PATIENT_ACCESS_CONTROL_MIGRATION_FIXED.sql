-- =====================================================
-- HEALTHCHAIN PATIENT ACCESS CONTROL SYSTEM (FIXED)
-- =====================================================
-- This migration creates a comprehensive patient access control system that handles:
-- 1. Emergency access for unconscious/incapacitated patients
-- 2. Quick access codes (QR/PIN) for in-person visits
-- 3. Persistent access permissions for ongoing care
-- 4. Full audit trail of all access events
-- 5. Granular control over record types and access duration
-- =====================================================
-- FIXED: Type casting issues in RLS policies
-- =====================================================

-- =====================================================
-- STEP 1: CREATE PATIENT ACCESS PERMISSIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.patient_access_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Core Relationships
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctor_profiles(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES public.hospital_profiles(id) ON DELETE CASCADE,
    
    -- Access Configuration
    access_type VARCHAR(20) NOT NULL DEFAULT 'read'
        CHECK (access_type IN ('read', 'read_write', 'emergency', 'full')),
    
    -- Granular Record Type Permissions (NULL = all record types)
    allowed_record_types TEXT[],
    
    -- Access Status
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'expired', 'revoked', 'suspended')),
    
    -- Time-Based Access Control
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by UUID REFERENCES auth.users(id),
    revoked_reason TEXT,
    
    -- Emergency Access
    is_emergency_access BOOLEAN DEFAULT false,
    emergency_verified_by UUID REFERENCES public.doctor_profiles(id),
    emergency_justification TEXT,
    emergency_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Grant Details
    granted_by UUID REFERENCES auth.users(id),
    grant_method VARCHAR(30) NOT NULL DEFAULT 'manual'
        CHECK (grant_method IN ('manual', 'qr_code', 'appointment', 'emergency', 'hospital_admission', 'first_visit')),
    
    -- Notification Preferences
    notify_on_access BOOLEAN DEFAULT true,
    
    -- Notes and Context
    access_purpose TEXT,
    internal_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT check_grantee 
        CHECK (
            (doctor_id IS NOT NULL AND hospital_id IS NULL) OR 
            (doctor_id IS NULL AND hospital_id IS NOT NULL)
        ),
    
    CONSTRAINT check_emergency_expiry
        CHECK (
            is_emergency_access = false OR 
            (is_emergency_access = true AND emergency_expires_at IS NOT NULL)
        )
);

CREATE INDEX IF NOT EXISTS idx_permissions_patient ON public.patient_access_permissions(patient_id);
CREATE INDEX IF NOT EXISTS idx_permissions_doctor ON public.patient_access_permissions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_permissions_hospital ON public.patient_access_permissions(hospital_id);
CREATE INDEX IF NOT EXISTS idx_permissions_status ON public.patient_access_permissions(status);
CREATE INDEX IF NOT EXISTS idx_permissions_expires ON public.patient_access_permissions(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_permissions_emergency ON public.patient_access_permissions(is_emergency_access) WHERE is_emergency_access = true;

-- =====================================================
-- STEP 2: CREATE PATIENT ACCESS CODES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.patient_access_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    access_code VARCHAR(20) NOT NULL UNIQUE,
    code_type VARCHAR(20) NOT NULL DEFAULT 'qr'
        CHECK (code_type IN ('qr', 'pin', 'url', 'nfc')),
    access_duration_minutes INTEGER NOT NULL DEFAULT 60,
    allowed_record_types TEXT[],
    max_uses INTEGER DEFAULT 1,
    current_uses INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'used', 'expired', 'revoked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    first_used_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    used_by_doctor_id UUID REFERENCES public.doctor_profiles(id),
    used_by_hospital_id UUID REFERENCES public.hospital_profiles(id),
    purpose TEXT,
    location_restriction TEXT,
    ip_address_used INET,
    user_agent_used TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT check_max_uses CHECK (max_uses IS NULL OR max_uses > 0),
    CONSTRAINT check_current_uses CHECK (current_uses >= 0)
);

CREATE INDEX IF NOT EXISTS idx_access_codes_patient ON public.patient_access_codes(patient_id);
CREATE INDEX IF NOT EXISTS idx_access_codes_code ON public.patient_access_codes(access_code);
CREATE INDEX IF NOT EXISTS idx_access_codes_status ON public.patient_access_codes(status);
CREATE INDEX IF NOT EXISTS idx_access_codes_expires ON public.patient_access_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_access_codes_used_by_doctor ON public.patient_access_codes(used_by_doctor_id);

-- =====================================================
-- STEP 3: CREATE PATIENT RECORD ACCESS LOG TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.patient_record_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctor_profiles(id) ON DELETE SET NULL,
    hospital_id UUID REFERENCES public.hospital_profiles(id) ON DELETE SET NULL,
    record_id UUID REFERENCES public.medical_record_submissions(id) ON DELETE SET NULL,
    record_type VARCHAR(50),
    action_performed VARCHAR(30) NOT NULL
        CHECK (action_performed IN ('view', 'download', 'export', 'print', 'share', 'edit')),
    access_method VARCHAR(30) NOT NULL
        CHECK (access_method IN ('persistent_grant', 'access_code', 'hospital_affiliation', 'emergency_access', 'self_created', 'appointment_based')),
    permission_id UUID REFERENCES public.patient_access_permissions(id) ON DELETE SET NULL,
    access_code_id UUID REFERENCES public.patient_access_codes(id) ON DELETE SET NULL,
    access_purpose TEXT,
    clinical_justification TEXT,
    is_emergency_access BOOLEAN DEFAULT false,
    emergency_level VARCHAR(20) CHECK (emergency_level IN ('critical', 'urgent', 'standard', NULL)),
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    session_id UUID,
    patient_notified BOOLEAN DEFAULT false,
    notification_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_log_patient ON public.patient_record_access_log(patient_id);
CREATE INDEX IF NOT EXISTS idx_access_log_doctor ON public.patient_record_access_log(doctor_id);
CREATE INDEX IF NOT EXISTS idx_access_log_record ON public.patient_record_access_log(record_id);
CREATE INDEX IF NOT EXISTS idx_access_log_accessed_at ON public.patient_record_access_log(accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_log_emergency ON public.patient_record_access_log(is_emergency_access) WHERE is_emergency_access = true;
CREATE INDEX IF NOT EXISTS idx_access_log_method ON public.patient_record_access_log(access_method);

-- =====================================================
-- STEP 4: CREATE EMERGENCY CONTACTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.patient_emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    contact_name VARCHAR(255) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    can_grant_access BOOLEAN DEFAULT true,
    can_revoke_access BOOLEAN DEFAULT true,
    can_view_records BOOLEAN DEFAULT false,
    priority INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_method VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT check_priority CHECK (priority > 0)
);

CREATE INDEX IF NOT EXISTS idx_emergency_contacts_patient ON public.patient_emergency_contacts(patient_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_active ON public.patient_emergency_contacts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_priority ON public.patient_emergency_contacts(patient_id, priority);

-- =====================================================
-- STEP 5: CREATE HELPER FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION auto_expire_access_permissions()
RETURNS void AS $$
BEGIN
    UPDATE public.patient_access_permissions
    SET status = 'expired'
    WHERE status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at < NOW();
    
    UPDATE public.patient_access_permissions
    SET status = 'expired'
    WHERE status = 'active'
    AND is_emergency_access = true
    AND emergency_expires_at IS NOT NULL
    AND emergency_expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION auto_expire_access_codes()
RETURNS void AS $$
BEGIN
    UPDATE public.patient_access_codes
    SET status = 'expired'
    WHERE status = 'active'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_doctor_has_access(
    p_doctor_id UUID,
    p_patient_id UUID,
    p_record_type TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    has_access BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.patient_access_permissions pap
        WHERE pap.patient_id = p_patient_id
        AND pap.doctor_id = p_doctor_id
        AND pap.status = 'active'
        AND (pap.expires_at IS NULL OR pap.expires_at > NOW())
        AND (
            p_record_type IS NULL 
            OR pap.allowed_record_types IS NULL 
            OR p_record_type = ANY(pap.allowed_record_types)
        )
    ) INTO has_access;
    
    RETURN has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION generate_access_code(code_length INTEGER DEFAULT 6)
RETURNS TEXT AS $$
DECLARE
    chars TEXT := '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..code_length LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_record_access(
    p_patient_id UUID,
    p_doctor_id UUID,
    p_record_id UUID DEFAULT NULL,
    p_access_method VARCHAR DEFAULT 'persistent_grant',
    p_action VARCHAR DEFAULT 'view'
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.patient_record_access_log (
        patient_id,
        doctor_id,
        record_id,
        access_method,
        action_performed,
        accessed_at
    ) VALUES (
        p_patient_id,
        p_doctor_id,
        p_record_id,
        p_access_method,
        p_action,
        NOW()
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 6: CREATE TRIGGERS
-- =====================================================

DROP TRIGGER IF EXISTS update_patient_access_permissions_updated_at ON public.patient_access_permissions;
CREATE TRIGGER update_patient_access_permissions_updated_at 
    BEFORE UPDATE ON public.patient_access_permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_patient_access_codes_updated_at ON public.patient_access_codes;
CREATE TRIGGER update_patient_access_codes_updated_at 
    BEFORE UPDATE ON public.patient_access_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_patient_emergency_contacts_updated_at ON public.patient_emergency_contacts;
CREATE TRIGGER update_patient_emergency_contacts_updated_at 
    BEFORE UPDATE ON public.patient_emergency_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION check_permission_expiry()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.expires_at IS NOT NULL AND NEW.expires_at <= NOW() THEN
        NEW.status := 'expired';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_permission_expiry_trigger ON public.patient_access_permissions;
CREATE TRIGGER check_permission_expiry_trigger
    BEFORE INSERT OR UPDATE ON public.patient_access_permissions
    FOR EACH ROW EXECUTE FUNCTION check_permission_expiry();

-- =====================================================
-- STEP 7: CREATE ROW LEVEL SECURITY POLICIES (FIXED)
-- =====================================================

ALTER TABLE public.patient_access_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_record_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_emergency_contacts ENABLE ROW LEVEL SECURITY;

-- ===== PATIENT ACCESS PERMISSIONS POLICIES =====

DROP POLICY IF EXISTS "patients_manage_own_permissions" ON public.patient_access_permissions;
CREATE POLICY "patients_manage_own_permissions" ON public.patient_access_permissions
    FOR ALL USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "doctors_view_granted_permissions" ON public.patient_access_permissions;
CREATE POLICY "doctors_view_granted_permissions" ON public.patient_access_permissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.doctor_profiles dp
            WHERE dp.id = patient_access_permissions.doctor_id
            AND dp.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "hospitals_view_permissions" ON public.patient_access_permissions;
CREATE POLICY "hospitals_view_permissions" ON public.patient_access_permissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.hospital_profiles hp
            WHERE hp.id = patient_access_permissions.hospital_id
            AND hp.user_id = auth.uid()
        )
    );

-- FIXED: Explicit type casting for admin policy
DROP POLICY IF EXISTS "admins_view_all_permissions" ON public.patient_access_permissions;
CREATE POLICY "admins_view_all_permissions" ON public.patient_access_permissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id::uuid = auth.uid()
            AND u.role IN ('admin', 'superadmin')
        )
    );

-- ===== PATIENT ACCESS CODES POLICIES =====

DROP POLICY IF EXISTS "patients_manage_own_codes" ON public.patient_access_codes;
CREATE POLICY "patients_manage_own_codes" ON public.patient_access_codes
    FOR ALL USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "doctors_view_used_codes" ON public.patient_access_codes;
CREATE POLICY "doctors_view_used_codes" ON public.patient_access_codes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.doctor_profiles dp
            WHERE dp.id = patient_access_codes.used_by_doctor_id
            AND dp.user_id = auth.uid()
        )
    );

-- ===== PATIENT RECORD ACCESS LOG POLICIES =====

DROP POLICY IF EXISTS "patients_view_access_log" ON public.patient_record_access_log;
CREATE POLICY "patients_view_access_log" ON public.patient_record_access_log
    FOR SELECT USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "doctors_view_own_access_log" ON public.patient_record_access_log;
CREATE POLICY "doctors_view_own_access_log" ON public.patient_record_access_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.doctor_profiles dp
            WHERE dp.id = patient_record_access_log.doctor_id
            AND dp.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "system_insert_access_log" ON public.patient_record_access_log;
CREATE POLICY "system_insert_access_log" ON public.patient_record_access_log
    FOR INSERT WITH CHECK (true);

-- FIXED: Explicit type casting for admin policy
DROP POLICY IF EXISTS "admins_view_all_access_logs" ON public.patient_record_access_log;
CREATE POLICY "admins_view_all_access_logs" ON public.patient_record_access_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id::uuid = auth.uid()
            AND u.role IN ('admin', 'superadmin')
        )
    );

-- ===== EMERGENCY CONTACTS POLICIES =====

DROP POLICY IF EXISTS "patients_manage_emergency_contacts" ON public.patient_emergency_contacts;
CREATE POLICY "patients_manage_emergency_contacts" ON public.patient_emergency_contacts
    FOR ALL USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "doctors_view_emergency_contacts" ON public.patient_emergency_contacts;
CREATE POLICY "doctors_view_emergency_contacts" ON public.patient_emergency_contacts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.patient_access_permissions pap
            JOIN public.doctor_profiles dp ON pap.doctor_id = dp.id
            WHERE pap.patient_id = patient_emergency_contacts.patient_id
            AND dp.user_id = auth.uid()
            AND pap.status = 'active'
            AND (pap.expires_at IS NULL OR pap.expires_at > NOW())
        )
    );

-- =====================================================
-- STEP 8: CREATE VIEWS FOR COMMON QUERIES
-- =====================================================

DROP VIEW IF EXISTS public.active_patient_permissions CASCADE;
CREATE OR REPLACE VIEW public.active_patient_permissions AS
SELECT 
    pap.id,
    pap.patient_id,
    pap.doctor_id,
    pap.hospital_id,
    pap.access_type,
    pap.allowed_record_types,
    pap.status,
    pap.granted_at,
    pap.expires_at,
    pap.is_emergency_access,
    pap.access_purpose,
    dp.first_name || ' ' || dp.last_name AS doctor_name,
    dp.specialty AS doctor_specialty,
    dp.email AS doctor_email,
    hp.hospital_name,
    hp.city AS hospital_city
FROM 
    public.patient_access_permissions pap
    LEFT JOIN public.doctor_profiles dp ON pap.doctor_id = dp.id
    LEFT JOIN public.hospital_profiles hp ON pap.hospital_id = hp.id
WHERE 
    pap.status = 'active'
    AND (pap.expires_at IS NULL OR pap.expires_at > NOW());

DROP VIEW IF EXISTS public.recent_record_access CASCADE;
CREATE OR REPLACE VIEW public.recent_record_access AS
SELECT 
    pral.id,
    pral.patient_id,
    pral.doctor_id,
    pral.record_id,
    pral.action_performed,
    pral.access_method,
    pral.is_emergency_access,
    pral.accessed_at,
    dp.first_name || ' ' || dp.last_name AS doctor_name,
    dp.specialty AS doctor_specialty,
    mrs.record_type,
    mrs.record_title
FROM 
    public.patient_record_access_log pral
    LEFT JOIN public.doctor_profiles dp ON pral.doctor_id = dp.id
    LEFT JOIN public.medical_record_submissions mrs ON pral.record_id = mrs.id
ORDER BY 
    pral.accessed_at DESC;

-- =====================================================
-- STEP 9: GRANT PERMISSIONS
-- =====================================================

GRANT ALL ON public.patient_access_permissions TO authenticated;
GRANT ALL ON public.patient_access_codes TO authenticated;
GRANT ALL ON public.patient_record_access_log TO authenticated;
GRANT ALL ON public.patient_emergency_contacts TO authenticated;

GRANT SELECT ON public.active_patient_permissions TO authenticated;
GRANT SELECT ON public.recent_record_access TO authenticated;

GRANT EXECUTE ON FUNCTION auto_expire_access_permissions() TO authenticated;
GRANT EXECUTE ON FUNCTION auto_expire_access_codes() TO authenticated;
GRANT EXECUTE ON FUNCTION check_doctor_has_access(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_access_code(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION log_record_access(UUID, UUID, UUID, VARCHAR, VARCHAR) TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE! ✅
-- =====================================================
-- 
-- FIXED ISSUES:
-- ✅ Type casting for UUID comparisons
-- ✅ Removed ::text casting from role comparisons
-- 
-- This migration has created:
-- ✅ patient_access_permissions - Persistent access grants
-- ✅ patient_access_codes - One-time QR/PIN codes
-- ✅ patient_record_access_log - Full audit trail
-- ✅ patient_emergency_contacts - Emergency contact management
-- ✅ Helper functions for access control
-- ✅ RLS policies for data security
-- ✅ Views for common queries
-- 
-- Next Steps:
-- 1. Enable pg_cron extension (optional, for auto-expiration)
-- 2. Test access control flows
-- 3. Integrate with frontend
-- 
-- =====================================================
