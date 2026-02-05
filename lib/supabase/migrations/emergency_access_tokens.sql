-- Create emergency_access_tokens table
CREATE TABLE IF NOT EXISTS emergency_access_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token VARCHAR(12) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    used_at TIMESTAMP WITH TIME ZONE,
    used_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_emergency_tokens_token ON emergency_access_tokens(token);
CREATE INDEX IF NOT EXISTS idx_emergency_tokens_patient ON emergency_access_tokens(patient_id);
CREATE INDEX IF NOT EXISTS idx_emergency_tokens_active ON emergency_access_tokens(is_active);

-- Enable RLS
ALTER TABLE emergency_access_tokens ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Patients can create their own emergency tokens"
    ON emergency_access_tokens FOR INSERT
    WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can view their own emergency tokens"
    ON emergency_access_tokens FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view active emergency tokens"
    ON emergency_access_tokens FOR SELECT
    USING (
        is_active = true 
        AND EXISTS (
            SELECT 1 FROM doctor_profiles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Doctors can update emergency tokens when using them"
    ON emergency_access_tokens FOR UPDATE
    USING (
        is_active = true 
        AND EXISTS (
            SELECT 1 FROM doctor_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- Function to auto-expire tokens
CREATE OR REPLACE FUNCTION expire_emergency_tokens()
RETURNS void AS $$
BEGIN
    UPDATE emergency_access_tokens
    SET is_active = false
    WHERE is_active = true
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_emergency_token_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_emergency_token_timestamp
    BEFORE UPDATE ON emergency_access_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_emergency_token_timestamp();
