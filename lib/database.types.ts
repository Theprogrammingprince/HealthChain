// Database types for Supabase tables
export type UserRole = 'patient' | 'hospital' | 'admin';
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

// Insert types (without auto-generated fields)
export type UserProfileInsert = Omit<UserProfile, 'created_at' | 'updated_at' | 'last_sign_in'>;
export type PatientProfileInsert = Omit<PatientProfile, 'id' | 'created_at' | 'updated_at'>;
export type HospitalProfileInsert = Omit<HospitalProfile, 'id' | 'created_at' | 'updated_at' | 'verification_status'>;

// Update types (all fields optional except id)
export type UserProfileUpdate = Partial<Omit<UserProfile, 'id' | 'created_at'>>;
export type PatientProfileUpdate = Partial<Omit<PatientProfile, 'id' | 'user_id' | 'created_at'>>;
export type HospitalProfileUpdate = Partial<Omit<HospitalProfile, 'id' | 'user_id' | 'created_at'>>;
