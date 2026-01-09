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
    UserRole,
    AuthProvider
} from './database.types';

// ==================== USER PROFILE OPERATIONS ====================

/**
 * Create a new user profile in the database
 */
export async function createUserProfile(data: UserProfileInsert) {
    const { data: profile, error } = await supabase
        .from('users')
        .insert([data])
        .select()
        .single();

    if (error) {
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
export async function getUserByWalletAddress(walletAddress: string) {
    const { data, error } = await supabase
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
export async function getUserByEmail(email: string) {
    const { data, error } = await supabase
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
export async function createPatientProfile(data: PatientProfileInsert) {
    const { data: profile, error } = await supabase
        .from('patient_profiles')
        .insert([data])
        .select()
        .single();

    if (error) {
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
export async function createHospitalProfile(data: HospitalProfileInsert) {
    const { data: profile, error } = await supabase
        .from('hospital_profiles')
        .insert([{
            ...data,
            verification_status: 'pending'
        }])
        .select()
        .single();

    if (error) {
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
    roleProfile: PatientProfileInsert | HospitalProfileInsert
) {
    // Create user profile first
    const user = await createUserProfile(userProfile);

    // Create role-specific profile
    let profile = null;
    if (user.role === 'patient') {
        profile = await createPatientProfile(roleProfile as PatientProfileInsert);
    } else if (user.role === 'hospital') {
        profile = await createHospitalProfile(roleProfile as HospitalProfileInsert);
    }

    return {
        user,
        profile
    };
}
