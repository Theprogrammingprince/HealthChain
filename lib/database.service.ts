import { supabase } from './supabaseClient';
import type {
    UserProfile,
    UserProfileInsert,
    UserProfileUpdate,
    PatientProfile,
    PatientProfileInsert,
    PatientProfileUpdate,
    HospitalProfile,
    HospitalProfileInsert,
    HospitalProfileUpdate,
    DoctorProfile,
    DoctorProfileInsert,
    DoctorProfileUpdate,
    UserRole,
    AuthProvider
} from './database.types';

// ==================== USER PROFILE OPERATIONS ====================

/**
 * Create a new user profile in the database
 */
export async function createUserProfile(data: UserProfileInsert, client = supabase) {
    const { data: profile, error } = await client
        .from('users')
        .insert([data])
        .select()
        .single();

    if (error) {
        // If user already exists, return the existing user instead of failing
        if (error.code === '23505') {
            const { data: existingUser } = await client
                .from('users')
                .select('*')
                .eq('id', data.id!)
                .single();

            if (existingUser) return existingUser as UserProfile;
        }
        console.error('Error creating user profile:', error);
        throw error;
    }

    return profile as UserProfile;
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No rows returned
                return null;
            }
            console.error('Error fetching user profile:', error);
            throw error;
        }

        return data as UserProfile;
    } catch (error) {
        console.error('Critical error fetching user profile:', error);
        return null; // Return null instead of throwing
    }
}

/**
 * Get user profile by wallet address
 */
export async function getUserByWalletAddress(walletAddress: string, client = supabase) {
    const { data, error } = await client
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        console.error('Error fetching user by wallet:', error);
        throw error;
    }

    return data as UserProfile;
}

/**
 * Get user profile by email
 */
export async function getUserByEmail(email: string, client = supabase) {
    const { data, error } = await client
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        console.error('Error fetching user by email:', error);
        throw error;
    }

    return data as UserProfile;
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, updates: UserProfileUpdate) {
    const { data, error } = await supabase
        .from('users')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }

    return data as UserProfile;
}

/**
 * Update last sign in timestamp
 */
export async function updateLastSignIn(userId: string) {
    const { error } = await supabase
        .from('users')
        .update({ last_sign_in: new Date().toISOString() })
        .eq('id', userId);

    if (error) {
        console.error('Error updating last sign in:', error);
        throw error;
    }
}

// ==================== PATIENT PROFILE OPERATIONS ====================

/**
 * Create a new patient profile
 */
export async function createPatientProfile(data: PatientProfileInsert, client = supabase) {
    const { data: profile, error } = await client
        .from('patient_profiles')
        .insert([data])
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            const { data: existing } = await client
                .from('patient_profiles')
                .select('*')
                .eq('user_id', data.user_id!)
                .single();
            if (existing) return existing as PatientProfile;
        }
        console.error('Error creating patient profile:', error);
        throw error;
    }

    return profile as PatientProfile;
}

/**
 * Get patient profile by user ID
 */
export async function getPatientProfile(userId: string) {
    const { data, error } = await supabase
        .from('patient_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        console.error('Error fetching patient profile:', error);
        throw error;
    }

    return data as PatientProfile;
}

/**
 * Update patient profile
 */
export async function updatePatientProfile(userId: string, updates: PatientProfileUpdate) {
    const { data, error } = await supabase
        .from('patient_profiles')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

    if (error) {
        console.error('Error updating patient profile:', error);
        throw error;
    }

    return data as PatientProfile;
}

// ==================== HOSPITAL PROFILE OPERATIONS ====================

/**
 * Create a new hospital profile
 */
export async function createHospitalProfile(data: HospitalProfileInsert, client = supabase) {
    const { data: profile, error } = await client
        .from('hospital_profiles')
        .insert([{
            ...data,
            verification_status: 'pending'
        }])
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            const { data: existing } = await client
                .from('hospital_profiles')
                .select('*')
                .eq('user_id', data.user_id!)
                .single();
            if (existing) return existing as HospitalProfile;
        }
        console.error('Error creating hospital profile:', error);
        throw error;
    }

    return profile as HospitalProfile;
}

/**
 * Get hospital profile by user ID
 */
export async function getHospitalProfile(userId: string) {
    const { data, error } = await supabase
        .from('hospital_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        console.error('Error fetching hospital profile:', error);
        throw error;
    }

    return data as HospitalProfile;
}

/**
 * Get all hospitals (for dropdowns)
 */
export async function getAllHospitals() {
    const { data, error } = await supabase
        .from('hospital_profiles')
        .select('id, hospital_name')
        .order('hospital_name', { ascending: true });

    if (error) {
        console.error('Error fetching all hospitals:', error);
        throw error;
    }

    return data;
}

/**
 * Update hospital profile
 */
export async function updateHospitalProfile(userId: string, updates: HospitalProfileUpdate) {
    const { data, error } = await supabase
        .from('hospital_profiles')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

    if (error) {
        console.error('Error updating hospital profile:', error);
        throw error;
    }

    return data as HospitalProfile;
}

// ==================== DOCTOR PROFILE OPERATIONS ====================

/**
 * Create a new doctor profile
 */
export async function createDoctorProfile(data: DoctorProfileInsert, client = supabase) {
    const { data: profile, error } = await client
        .from('doctor_profiles')
        .insert([{
            ...data,
            verification_status: 'pending'
        }])
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            const { data: existing } = await client
                .from('doctor_profiles')
                .select('*')
                .eq('user_id', data.user_id!)
                .single();
            if (existing) return existing as DoctorProfile;
        }
        console.error('Error creating doctor profile:', error);
        throw error;
    }

    return profile as DoctorProfile;
}

/**
 * Get doctor profile by user ID
 */
export async function getDoctorProfile(userId: string) {
    const { data, error } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        console.error('Error fetching doctor profile:', error);
        throw error;
    }

    return data as DoctorProfile;
}

/**
 * Update doctor profile
 */
export async function updateDoctorProfile(userId: string, updates: DoctorProfileUpdate) {
    const { data, error } = await supabase
        .from('doctor_profiles')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

    if (error) {
        console.error('Error updating doctor profile:', error);
        throw error;
    }

    return data as DoctorProfile;
}

/**
 * Get doctor statistics
 */
export async function getDoctorStatistics(doctorId: string) {
    const { data, error } = await supabase
        .from('doctor_statistics')
        .select('*')
        .eq('doctor_id', doctorId)
        .single();

    if (error) {
        console.error('Error fetching doctor statistics:', error);
        return null;
    }

    return data;
}

/**
 * Get recent submissions for a doctor
 */
export async function getRecentDoctorSubmissions(doctorId: string, limit = 5) {
    const { data, error } = await supabase
        .from('recent_submissions_detailed')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching recent submissions:', error);
        return [];
    }

    return data;
}

// ==================== COMBINED OPERATIONS ====================

/**
 * Get complete user data (user + role-specific profile)
 */
export async function getCompleteUserProfile(userId: string) {
    const userProfile = await getUserProfile(userId);

    if (!userProfile) {
        return null;
    }

    let roleProfile = null;
    if (userProfile.role === 'patient') {
        roleProfile = await getPatientProfile(userId);
    } else if (userProfile.role === 'hospital') {
        roleProfile = await getHospitalProfile(userId);
    } else if (userProfile.role === 'doctor') {
        roleProfile = await getDoctorProfile(userId);
    }

    return {
        user: userProfile,
        profile: roleProfile
    };
}

/**
 * Create complete user profile (user + role-specific profile)
 */
export async function createCompleteUserProfile(
    userProfile: UserProfileInsert,
    roleProfile: PatientProfileInsert | HospitalProfileInsert | DoctorProfileInsert,
    client = supabase
) {
    try {
        // Create user profile first
        const user = await createUserProfile(userProfile, client);

        // Create role-specific profile
        let profile = null;
        if (user.role === 'patient') {
            profile = await createPatientProfile(roleProfile as PatientProfileInsert, client);
        } else if (user.role === 'hospital') {
            profile = await createHospitalProfile(roleProfile as HospitalProfileInsert, client);
        } else if (user.role === 'doctor') {
            profile = await createDoctorProfile(roleProfile as DoctorProfileInsert, client);
        }

        return {
            user,
            profile
        };
    } catch (error) {
        console.error('Error in createCompleteUserProfile:', error);
        throw error;
    }
}
