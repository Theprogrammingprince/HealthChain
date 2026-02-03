-- =====================================================
-- HEALTHCHAIN CONSENT-BASED ACCESS SQL SCHEMA
-- =====================================================

-- 1. Table for one-time access codes (QR/6-digit)
CREATE TABLE IF NOT EXISTS public.patient_access_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    code VARCHAR(6) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_codes_patient ON public.patient_access_codes(patient_id);
CREATE INDEX IF NOT EXISTS idx_access_codes_code ON public.patient_access_codes(code);

-- 2. Table for time-limited permissions
CREATE TABLE IF NOT EXISTS public.patient_access_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    accessor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    accessor_type VARCHAR(20) CHECK (accessor_type IN ('hospital', 'doctor')),
    scope VARCHAR(20) DEFAULT 'full' CHECK (scope IN ('full', 'partial')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_permissions_patient ON public.patient_access_permissions(patient_id);
CREATE INDEX IF NOT EXISTS idx_access_permissions_accessor ON public.patient_access_permissions(accessor_id);
CREATE INDEX IF NOT EXISTS idx_access_permissions_status ON public.patient_access_permissions(status);

-- 3. Row Level Security (RLS)
ALTER TABLE public.patient_access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_access_permissions ENABLE ROW LEVEL SECURITY;

-- Patients can manage their own codes
CREATE POLICY "Patients can manage own codes" ON public.patient_access_codes
    FOR ALL USING (auth.uid() = patient_id);

-- Patients can manage their own permissions
CREATE POLICY "Patients can manage own permissions" ON public.patient_access_permissions
    FOR ALL USING (auth.uid() = patient_id);

-- Accessors can view permissions granted to them
CREATE POLICY "Accessors can view own permissions" ON public.patient_access_permissions
    FOR SELECT USING (auth.uid() = accessor_id);

-- 4. Triggers for updated_at
CREATE TRIGGER update_patient_access_permissions_updated_at
    BEFORE UPDATE ON public.patient_access_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Helper Function to cleanup expired codes/permissions (to be called via cron or manually)
CREATE OR REPLACE FUNCTION cleanup_expired_access()
RETURNS void AS $$
BEGIN
    UPDATE public.patient_access_codes
    SET status = 'expired'
    WHERE status = 'active' AND expires_at < NOW();

    UPDATE public.patient_access_permissions
    SET status = 'expired'
    WHERE status = 'active' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
