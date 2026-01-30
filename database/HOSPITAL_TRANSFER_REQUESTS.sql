-- Hospital Transfer Requests Table
-- This table tracks when doctors request to transfer to a different hospital

-- Create the transfer_requests table
CREATE TABLE IF NOT EXISTS hospital_transfer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctor_profiles(id) ON DELETE CASCADE,
    from_hospital_id UUID REFERENCES hospital_profiles(id) ON DELETE SET NULL,
    to_hospital_id UUID NOT NULL REFERENCES hospital_profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    request_reason TEXT,
    rejection_reason TEXT,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by TEXT, -- Changed from UUID to TEXT to match users table
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_transfer_requests_doctor ON hospital_transfer_requests(doctor_id);
CREATE INDEX IF NOT EXISTS idx_transfer_requests_to_hospital ON hospital_transfer_requests(to_hospital_id);
CREATE INDEX IF NOT EXISTS idx_transfer_requests_status ON hospital_transfer_requests(status);

-- Enable RLS
ALTER TABLE hospital_transfer_requests ENABLE ROW LEVEL SECURITY;

-- Policies for hospital_transfer_requests
-- Doctors can view their own transfer requests
CREATE POLICY "Doctors can view own transfer requests"
    ON hospital_transfer_requests FOR SELECT
    USING (
        doctor_id IN (
            SELECT id FROM doctor_profiles WHERE user_id = auth.uid()
        )
    );

-- Doctors can create transfer requests
CREATE POLICY "Doctors can create transfer requests"
    ON hospital_transfer_requests FOR INSERT
    WITH CHECK (
        doctor_id IN (
            SELECT id FROM doctor_profiles WHERE user_id = auth.uid()
        )
    );

-- Doctors can cancel their own pending requests
CREATE POLICY "Doctors can cancel own pending requests"
    ON hospital_transfer_requests FOR UPDATE
    USING (
        doctor_id IN (
            SELECT id FROM doctor_profiles WHERE user_id = auth.uid()
        )
        AND status = 'pending'
    );

-- Hospital admins can view requests to their hospital
CREATE POLICY "Hospital admins can view requests to their hospital"
    ON hospital_transfer_requests FOR SELECT
    USING (
        to_hospital_id IN (
            SELECT id FROM hospital_profiles WHERE user_id = auth.uid()
        )
    );

-- Hospital admins can update requests to their hospital (approve/reject)
CREATE POLICY "Hospital admins can review transfer requests"
    ON hospital_transfer_requests FOR UPDATE
    USING (
        to_hospital_id IN (
            SELECT id FROM hospital_profiles WHERE user_id = auth.uid()
        )
    );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_transfer_request_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_transfer_request_timestamp
    BEFORE UPDATE ON hospital_transfer_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_transfer_request_updated_at();

-- Function to handle transfer approval
CREATE OR REPLACE FUNCTION approve_hospital_transfer(request_id UUID, approver_id TEXT)
RETURNS VOID AS $$
DECLARE
    v_doctor_id UUID;
    v_to_hospital_id UUID;
    v_hospital_name TEXT;
BEGIN
    -- Get the request details
    SELECT doctor_id, to_hospital_id INTO v_doctor_id, v_to_hospital_id
    FROM hospital_transfer_requests
    WHERE id = request_id AND status = 'pending';
    
    IF v_doctor_id IS NULL THEN
        RAISE EXCEPTION 'Transfer request not found or not pending';
    END IF;
    
    -- Get the hospital name
    SELECT hospital_name INTO v_hospital_name
    FROM hospital_profiles
    WHERE id = v_to_hospital_id;
    
    -- Update the request status
    UPDATE hospital_transfer_requests
    SET status = 'approved',
        reviewed_at = NOW(),
        reviewed_by = approver_id
    WHERE id = request_id;
    
    -- Update the doctor's hospital affiliation
    UPDATE doctor_profiles
    SET primary_hospital_id = v_to_hospital_id,
        hospital_name = v_hospital_name,
        verification_status = 'verified',
        verified_by = (CASE WHEN approver_id IS NOT NULL AND approver_id <> '' THEN approver_id::uuid ELSE NULL END),
        verification_date = NOW(),
        updated_at = NOW()
    WHERE id = v_doctor_id;
    
    -- Cancel any other pending requests from this doctor
    UPDATE hospital_transfer_requests
    SET status = 'cancelled'
    WHERE doctor_id = v_doctor_id
      AND id != request_id
      AND status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
