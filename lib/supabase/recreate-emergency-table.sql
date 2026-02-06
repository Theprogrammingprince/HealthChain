-- Recreate Emergency Access Tokens Table with Correct Schema
-- Run this in your Supabase SQL Editor

-- First, drop the existing table if it has wrong schema
DROP TABLE IF EXISTS emergency_access_tokens CASCADE;

-- Create emergency_access_tokens table with correct schema
CREATE TABLE emergency_access_tokens (
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

-- Create indexes for faster lookups
CREATE INDEX idx_emergency_tokens_token ON emergency_access_tokens(token);
CREATE INDEX idx_emergency_tokens_patient ON emergency_access_tokens(patient_id);
CREATE INDEX idx_emergency_tokens_active ON emergency_access_tokens(is_active);

-- Enable RLS
ALTER TABLE emergency_access_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- 1. Patients can create their own emergency tokens
CREATE POLICY "Patients can create their own emergency tokens"
    ON emergency_access_tokens FOR INSERT
    WITH CHECK (auth.uid() = patient_id);

-- 2. Patients can view their own emergency tokens
CREATE POLICY "Patients can view their own emergency tokens"
    ON emergency_access_tokens FOR SELECT
    USING (auth.uid() = patient_id);

-- 3. Patients can update their own tokens
CREATE POLICY "Patients can update their own emergency tokens"
    ON emergency_access_tokens FOR UPDATE
    USING (auth.uid() = patient_id);

-- 4. Doctors can view ANY active emergency token
CREATE POLICY "Doctors can view active emergency tokens"
    ON emergency_access_tokens FOR SELECT
    USING (
        is_active = true 
        AND EXISTS (
            SELECT 1 FROM doctor_profiles 
            WHERE doctor_profiles.user_id = auth.uid()
        )
    );

-- 5. Doctors can update tokens when using them
CREATE POLICY "Doctors can update emergency tokens when using them"
    ON emergency_access_tokens FOR UPDATE
    USING (
        is_active = true 
        AND EXISTS (
            SELECT 1 FROM doctor_profiles 
            WHERE doctor_profiles.user_id = auth.uid()
        )
    );

-- Create trigger functions
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

-- Verify table was created
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'emergency_access_tokens'
ORDER BY ordinal_position;
