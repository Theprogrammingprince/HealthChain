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

export interface PatientAccessCode {
    id: string;
    patient_id: string;
    code: string;
    status: 'active' | 'used' | 'expired';
    expires_at: string;
    created_at: string;
}

export interface PatientAccessPermission {
    id: string;
    patient_id: string;
    accessor_id: string;
    accessor_type: 'hospital' | 'doctor';
    scope: 'full' | 'partial';
    status: 'active' | 'revoked' | 'expired';
    expires_at: string;
    created_at: string;
    updated_at: string;
}

// Insert types (without auto-generated fields)
export type UserProfileInsert = Omit<UserProfile, 'created_at' | 'updated_at' | 'last_sign_in'>;
export type PatientProfileInsert = Omit<PatientProfile, 'id' | 'created_at' | 'updated_at'>;
export type HospitalProfileInsert = Omit<HospitalProfile, 'id' | 'created_at' | 'updated_at' | 'verification_status'>;
export type DoctorProfileInsert = Omit<DoctorProfile, 'id' | 'created_at' | 'updated_at' | 'verification_status' | 'verification_date' | 'verified_by' | 'rejection_reason'>;

// Update types (all fields optional except id)
export type UserProfileUpdate = Partial<Omit<UserProfile, 'id' | 'created_at'>>;
export type PatientProfileUpdate = Partial<Omit<PatientProfile, 'id' | 'user_id' | 'created_at'>>;
export type HospitalProfileUpdate = Partial<Omit<HospitalProfile, 'id' | 'user_id' | 'created_at'>>;
export type DoctorProfileUpdate = Partial<Omit<DoctorProfile, 'id' | 'user_id' | 'created_at'>>;

export type PatientAccessCodeInsert = Omit<PatientAccessCode, 'id' | 'created_at'>;
export type PatientAccessCodeUpdate = Partial<Omit<PatientAccessCode, 'id' | 'patient_id' | 'created_at'>>;

export type PatientAccessPermissionInsert = Omit<PatientAccessPermission, 'id' | 'created_at' | 'updated_at'>;
export type PatientAccessPermissionUpdate = Partial<Omit<PatientAccessPermission, 'id' | 'patient_id' | 'accessor_id' | 'created_at'>>;
