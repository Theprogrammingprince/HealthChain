// Database types for Supabase tables
export type UserRole = 'patient' | 'hospital' | 'doctor' | 'admin';
export type AuthProvider = 'google' | 'wallet' | 'email';

export interface UserProfile {
    id: string; // UUID from Supabase auth.users
    email?: string | null;
    wallet_address?: string | null;
    role: UserRole;
    auth_provider: AuthProvider;
    full_name?: string | null;
    avatar_url?: string | null;
    created_at: string;
    updated_at: string;
    last_sign_in: string;
}

export interface PatientProfile {
    id: string; // UUID - references users.id
    user_id: string; // FK to users
    date_of_birth?: string | null;
    gender?: string | null;
    blood_type?: string | null;
    phone_number?: string | null;
    emergency_contact?: string | null;
    emergency_phone?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    postal_code?: string | null;
    medical_conditions?: string[] | null;
    allergies?: string[] | null;
    medications?: string[] | null;
    created_at: string;
    updated_at: string;
}

export interface HospitalProfile {
    id: string; // UUID - references users.id
    user_id: string; // FK to users
    hospital_name: string;
    license_number?: string | null;
    registration_number?: string | null;
    specialization?: string[] | null;
    verification_status: 'pending' | 'verified' | 'rejected';
    revocation_reason?: string | null;
    phone_number?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    postal_code?: string | null;
    website?: string | null;
    description?: string | null;
    created_at: string;
    updated_at: string;
}

export interface DoctorProfile {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string | null;
    medical_license_number: string;
    specialty: string;
    sub_specialty?: string | null;
    years_of_experience?: number | null;
    verification_status: 'pending' | 'verified' | 'rejected' | 'suspended';
    verification_date?: string | null;
    verified_by?: string | null;
    rejection_reason?: string | null;
    primary_hospital_id?: string | null;
    hospital_name?: string | null;
    hospital_department?: string | null;
    license_document_url?: string | null;
    certification_urls?: string[] | null;
    created_at: string;
    updated_at: string;
}

// ==================== PATIENT ACCESS CONTROL TYPES ====================

export interface PatientAccessPermission {
    id: string;
    patient_id: string;
    doctor_id: string | null;
    hospital_id: string | null;
    access_type: 'read' | 'read_write' | 'emergency' | 'full';
    allowed_record_types: string[] | null;
    status: 'active' | 'expired' | 'revoked' | 'suspended';
    granted_at: string;
    expires_at: string | null;
    revoked_at: string | null;
    revoked_by: string | null;
    revoked_reason: string | null;
    is_emergency_access: boolean;
    emergency_verified_by: string | null;
    emergency_justification: string | null;
    emergency_expires_at: string | null;
    granted_by: string | null;
    grant_method: 'manual' | 'qr_code' | 'appointment' | 'emergency' | 'hospital_admission' | 'first_visit';
    notify_on_access: boolean;
    access_purpose: string | null;
    internal_notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface PatientAccessCode {
    id: string;
    patient_id: string;
    access_code: string;
    code_type: 'qr' | 'pin' | 'url' | 'nfc';
    access_duration_minutes: number;
    allowed_record_types: string[] | null;
    max_uses: number | null;
    current_uses: number;
    status: 'active' | 'used' | 'expired' | 'revoked';
    created_at: string;
    expires_at: string;
    first_used_at: string | null;
    last_used_at: string | null;
    used_by_doctor_id: string | null;
    used_by_hospital_id: string | null;
    purpose: string | null;
    location_restriction: string | null;
    ip_address_used: string | null;
    user_agent_used: string | null;
    updated_at: string;
}

export interface PatientRecordAccessLog {
    id: string;
    patient_id: string;
    doctor_id: string | null;
    hospital_id: string | null;
    record_id: string | null;
    record_type: string | null;
    action_performed: 'view' | 'download' | 'export' | 'print' | 'share' | 'edit';
    access_method: 'persistent_grant' | 'access_code' | 'hospital_affiliation' | 'emergency_access' | 'self_created' | 'appointment_based';
    permission_id: string | null;
    access_code_id: string | null;
    access_purpose: string | null;
    clinical_justification: string | null;
    is_emergency_access: boolean;
    emergency_level: 'critical' | 'urgent' | 'standard' | null;
    accessed_at: string;
    ip_address: string | null;
    user_agent: string | null;
    session_id: string | null;
    patient_notified: boolean;
    notification_sent_at: string | null;
    created_at: string;
}

export interface PatientEmergencyContact {
    id: string;
    patient_id: string;
    contact_name: string;
    relationship: string;
    phone_number: string;
    email: string | null;
    can_grant_access: boolean;
    can_revoke_access: boolean;
    can_view_records: boolean;
    priority: number;
    is_active: boolean;
    verified: boolean;
    verified_at: string | null;
    verification_method: string | null;
    created_at: string;
    updated_at: string;
}

// View types (for materialized views and complex queries)
export interface ActivePatientPermission extends PatientAccessPermission {
    doctor_name: string | null;
    doctor_specialty: string | null;
    doctor_email: string | null;
    hospital_name: string | null;
    hospital_city: string | null;
}

export interface RecentRecordAccess extends PatientRecordAccessLog {
    doctor_name: string | null;
    doctor_specialty: string | null;
    record_type: string | null;
    record_title: string | null;
}

// ==================== INSERT TYPES ====================

// Insert types (without auto-generated fields)
export type UserProfileInsert = Omit<UserProfile, 'created_at' | 'updated_at' | 'last_sign_in'>;
export type PatientProfileInsert = Omit<PatientProfile, 'id' | 'created_at' | 'updated_at'>;
export type HospitalProfileInsert = Omit<HospitalProfile, 'id' | 'created_at' | 'updated_at' | 'verification_status'>;
export type DoctorProfileInsert = Omit<DoctorProfile, 'id' | 'created_at' | 'updated_at' | 'verification_status' | 'verification_date' | 'verified_by' | 'rejection_reason'>;

export type PatientAccessPermissionInsert = Omit<PatientAccessPermission, 'id' | 'created_at' | 'updated_at'>;
export type PatientAccessCodeInsert = Omit<PatientAccessCode, 'id' | 'created_at' | 'updated_at' | 'first_used_at' | 'last_used_at' | 'used_by_doctor_id' | 'used_by_hospital_id' | 'ip_address_used' | 'user_agent_used'>;
export type PatientRecordAccessLogInsert = Omit<PatientRecordAccessLog, 'id' | 'created_at'>;
export type PatientEmergencyContactInsert = Omit<PatientEmergencyContact, 'id' | 'created_at' | 'updated_at'>;

// ==================== UPDATE TYPES ====================

// Update types (all fields optional except id)
export type UserProfileUpdate = Partial<Omit<UserProfile, 'id' | 'created_at'>>;
export type PatientProfileUpdate = Partial<Omit<PatientProfile, 'id' | 'user_id' | 'created_at'>>;
export type HospitalProfileUpdate = Partial<Omit<HospitalProfile, 'id' | 'user_id' | 'created_at'>>;
export type DoctorProfileUpdate = Partial<Omit<DoctorProfile, 'id' | 'user_id' | 'created_at'>>;

export type PatientAccessPermissionUpdate = Partial<Omit<PatientAccessPermission, 'id' | 'patient_id' | 'created_at'>>;
export type PatientAccessCodeUpdate = Partial<Omit<PatientAccessCode, 'id' | 'patient_id' | 'created_at'>>;
export type PatientEmergencyContactUpdate = Partial<Omit<PatientEmergencyContact, 'id' | 'patient_id' | 'created_at'>>;
