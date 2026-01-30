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
 * Get recent submissions for a doctor (with rejection reasons)
 */
export async function getRecentDoctorSubmissions(doctorId: string, limit = 5) {
    const { data, error } = await supabase
        .from('medical_record_submissions')
        .select(`
            id,
            submission_code,
            record_type,
            record_title,
            record_description,
            overall_status,
            hospital_approval_status,
            hospital_rejection_reason,
            patient_approval_status,
            patient_rejection_reason,
            created_at,
            updated_at,
            patient_id
        `)
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching recent submissions:', error);
        return [];
    }

    // Enrich with patient names
    const enrichedData = await Promise.all(
        (data || []).map(async (sub) => {
            let patientName = 'Unknown Patient';
            if (sub.patient_id) {
                const { data: patientData } = await supabase
                    .from('users')
                    .select('full_name')
                    .eq('id', sub.patient_id)
                    .single();
                if (patientData?.full_name) {
                    patientName = patientData.full_name;
                }
            }
            return {
                ...sub,
                patient_name: patientName,
                // Determine rejection reason (from either hospital or patient)
                rejection_reason: sub.hospital_rejection_reason || sub.patient_rejection_reason || null,
                rejected_by: sub.hospital_rejection_reason ? 'hospital' :
                    sub.patient_rejection_reason ? 'patient' : null
            };
        })
    );

    return enrichedData;
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

// ==================== PATIENT MEDICAL RECORDS OPERATIONS ====================

/**
 * Medical Record Submission type
 */
export interface MedicalRecordSubmission {
    id: string;
    submission_code: string;
    doctor_id: string;
    patient_id: string;
    hospital_id: string | null;
    record_type: string;
    record_title: string;
    record_description: string | null;
    ipfs_hash: string | null;
    hospital_approval_status: 'pending' | 'approved' | 'rejected';
    hospital_rejection_reason: string | null;
    patient_approval_status: 'pending' | 'approved' | 'rejected';
    patient_rejection_reason: string | null;
    overall_status: 'draft' | 'pending_hospital_review' | 'pending_patient_approval' | 'approved' | 'rejected' | 'archived';
    created_at: string;
    updated_at: string;
    // Joined fields
    doctor_name?: string;
    doctor_specialty?: string;
    hospital_name?: string;
}

/**
 * Get all approved medical records for a patient
 */
export async function getPatientApprovedRecords(patientId: string) {
    const { data, error } = await supabase
        .from('medical_record_submissions')
        .select(`
            id,
            submission_code,
            record_type,
            record_title,
            record_description,
            ipfs_hash,
            overall_status,
            created_at,
            updated_at,
            doctor_id,
            hospital_id
        `)
        .eq('patient_id', patientId)
        .eq('overall_status', 'approved')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching approved records:', error);
        return [];
    }

    // Fetch doctor and hospital names for each record
    const enrichedRecords = await Promise.all(
        (data || []).map(async (record) => {
            let doctorName = 'Unknown Doctor';
            let hospitalName = 'Unknown Facility';

            // Get doctor info
            if (record.doctor_id) {
                const { data: doctorData } = await supabase
                    .from('doctor_profiles')
                    .select('first_name, last_name, specialty')
                    .eq('id', record.doctor_id)
                    .single();
                if (doctorData) {
                    doctorName = `Dr. ${doctorData.first_name} ${doctorData.last_name}`;
                }
            }

            // Get hospital info
            if (record.hospital_id) {
                const { data: hospitalData } = await supabase
                    .from('hospital_profiles')
                    .select('hospital_name')
                    .eq('id', record.hospital_id)
                    .single();
                if (hospitalData) {
                    hospitalName = hospitalData.hospital_name;
                }
            }

            return {
                ...record,
                doctor_name: doctorName,
                hospital_name: hospitalName
            };
        })
    );

    return enrichedRecords;
}

/**
 * Get pending approval records for a patient (records that need patient approval)
 */
export async function getPatientPendingApprovals(patientId: string) {
    const { data, error } = await supabase
        .from('medical_record_submissions')
        .select(`
            id,
            submission_code,
            record_type,
            record_title,
            record_description,
            overall_status,
            patient_approval_status,
            created_at,
            updated_at,
            doctor_id,
            hospital_id
        `)
        .eq('patient_id', patientId)
        .eq('overall_status', 'pending_patient_approval')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching pending approvals:', error);
        return [];
    }

    // Fetch doctor and hospital names for each record
    const enrichedRecords = await Promise.all(
        (data || []).map(async (record) => {
            let doctorName = 'Unknown Doctor';
            let hospitalName = 'Unknown Facility';

            // Get doctor info
            if (record.doctor_id) {
                const { data: doctorData } = await supabase
                    .from('doctor_profiles')
                    .select('first_name, last_name, specialty')
                    .eq('id', record.doctor_id)
                    .single();
                if (doctorData) {
                    doctorName = `Dr. ${doctorData.first_name} ${doctorData.last_name}`;
                }
            }

            // Get hospital info
            if (record.hospital_id) {
                const { data: hospitalData } = await supabase
                    .from('hospital_profiles')
                    .select('hospital_name')
                    .eq('id', record.hospital_id)
                    .single();
                if (hospitalData) {
                    hospitalName = hospitalData.hospital_name;
                }
            }

            return {
                ...record,
                doctor_name: doctorName,
                hospital_name: hospitalName
            };
        })
    );

    return enrichedRecords;
}

/**
 * Patient approves a medical record submission
 */
export async function approveRecordAsPatient(recordId: string, patientId: string) {
    const { data, error } = await supabase
        .from('medical_record_submissions')
        .update({
            patient_approval_status: 'approved',
            patient_approval_date: new Date().toISOString(),
            overall_status: 'approved',
            updated_at: new Date().toISOString()
        })
        .eq('id', recordId)
        .eq('patient_id', patientId)
        .eq('overall_status', 'pending_patient_approval')
        .select()
        .single();

    if (error) {
        console.error('Error approving record:', error);
        throw error;
    }

    return data;
}

/**
 * Patient rejects a medical record submission
 */
export async function rejectRecordAsPatient(recordId: string, patientId: string, reason?: string) {
    const { data, error } = await supabase
        .from('medical_record_submissions')
        .update({
            patient_approval_status: 'rejected',
            patient_rejection_reason: reason || 'Rejected by patient',
            overall_status: 'rejected',
            updated_at: new Date().toISOString()
        })
        .eq('id', recordId)
        .eq('patient_id', patientId)
        .eq('overall_status', 'pending_patient_approval')
        .select()
        .single();

    if (error) {
        console.error('Error rejecting record:', error);
        throw error;
    }

    return data;
}

/**
 * Get all medical records for a patient (all statuses)
 */
export async function getAllPatientRecords(patientId: string) {
    const { data, error } = await supabase
        .from('medical_record_submissions')
        .select(`
            id,
            submission_code,
            record_type,
            record_title,
            record_description,
            ipfs_hash,
            overall_status,
            hospital_approval_status,
            patient_approval_status,
            hospital_rejection_reason,
            patient_rejection_reason,
            created_at,
            updated_at,
            doctor_id,
            hospital_id
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching all patient records:', error);
        return [];
    }

    // Fetch doctor and hospital names for each record
    const enrichedRecords = await Promise.all(
        (data || []).map(async (record) => {
            let doctorName = 'Unknown Doctor';
            let hospitalName = 'Unknown Facility';

            // Get doctor info
            if (record.doctor_id) {
                const { data: doctorData } = await supabase
                    .from('doctor_profiles')
                    .select('first_name, last_name, specialty')
                    .eq('id', record.doctor_id)
                    .single();
                if (doctorData) {
                    doctorName = `Dr. ${doctorData.first_name} ${doctorData.last_name}`;
                }
            }

            // Get hospital info
            if (record.hospital_id) {
                const { data: hospitalData } = await supabase
                    .from('hospital_profiles')
                    .select('hospital_name')
                    .eq('id', record.hospital_id)
                    .single();
                if (hospitalData) {
                    hospitalName = hospitalData.hospital_name;
                }
            }

            return {
                ...record,
                doctor_name: doctorName,
                hospital_name: hospitalName
            };
        })
    );

    return enrichedRecords;
}

// ==================== HOSPITAL RECORD APPROVAL OPERATIONS ====================

/**
 * Get pending hospital review records for a hospital
 */
export async function getHospitalPendingReviews(hospitalId: string) {
    const { data, error } = await supabase
        .from('medical_record_submissions')
        .select(`
            id,
            submission_code,
            record_type,
            record_title,
            record_description,
            overall_status,
            hospital_approval_status,
            created_at,
            updated_at,
            doctor_id,
            patient_id
        `)
        .eq('hospital_id', hospitalId)
        .eq('overall_status', 'pending_hospital_review')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching hospital pending reviews:', error);
        return [];
    }

    // Fetch doctor and patient info for each record
    const enrichedRecords = await Promise.all(
        (data || []).map(async (record) => {
            let doctorName = 'Unknown Doctor';
            let patientName = 'Unknown Patient';

            // Get doctor info
            if (record.doctor_id) {
                const { data: doctorData } = await supabase
                    .from('doctor_profiles')
                    .select('first_name, last_name, specialty, hospital_name')
                    .eq('id', record.doctor_id)
                    .single();
                if (doctorData) {
                    doctorName = `Dr. ${doctorData.first_name} ${doctorData.last_name}`;
                }
            }

            // Get patient info (just first part of ID for privacy)
            if (record.patient_id) {
                const { data: patientData } = await supabase
                    .from('users')
                    .select('full_name')
                    .eq('id', record.patient_id)
                    .single();
                if (patientData?.full_name) {
                    patientName = patientData.full_name;
                } else {
                    patientName = `Patient #${record.patient_id.substring(0, 8)}`;
                }
            }

            return {
                ...record,
                doctor_name: doctorName,
                patient_name: patientName
            };
        })
    );

    return enrichedRecords;
}

/**
 * Hospital approves a medical record submission (moves to pending_patient_approval)
 */
export async function approveRecordAsHospital(recordId: string, hospitalId: string, reviewerId: string) {
    const { data, error } = await supabase
        .from('medical_record_submissions')
        .update({
            hospital_approval_status: 'approved',
            hospital_approved_by: reviewerId,
            hospital_approval_date: new Date().toISOString(),
            overall_status: 'pending_patient_approval',
            updated_at: new Date().toISOString()
        })
        .eq('id', recordId)
        .eq('hospital_id', hospitalId)
        .eq('overall_status', 'pending_hospital_review')
        .select()
        .single();

    if (error) {
        console.error('Error approving record as hospital:', error);
        throw error;
    }

    return data;
}

/**
 * Hospital rejects a medical record submission
 */
export async function rejectRecordAsHospital(recordId: string, hospitalId: string, reviewerId: string, reason?: string) {
    const { data, error } = await supabase
        .from('medical_record_submissions')
        .update({
            hospital_approval_status: 'rejected',
            hospital_approved_by: reviewerId,
            hospital_approval_date: new Date().toISOString(),
            hospital_rejection_reason: reason || 'Rejected by hospital admin',
            overall_status: 'rejected',
            updated_at: new Date().toISOString()
        })
        .eq('id', recordId)
        .eq('hospital_id', hospitalId)
        .eq('overall_status', 'pending_hospital_review')
        .select()
        .single();

    if (error) {
        console.error('Error rejecting record as hospital:', error);
        throw error;
    }

    return data;
}

/**
 * Get all submissions for a hospital (all statuses)
 */
export async function getAllHospitalSubmissions(hospitalId: string) {
    const { data, error } = await supabase
        .from('medical_record_submissions')
        .select(`
            id,
            submission_code,
            record_type,
            record_title,
            record_description,
            overall_status,
            hospital_approval_status,
            patient_approval_status,
            hospital_rejection_reason,
            patient_rejection_reason,
            created_at,
            updated_at,
            doctor_id,
            patient_id
        `)
        .eq('hospital_id', hospitalId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching all hospital submissions:', error);
        return [];
    }

    // Fetch doctor and patient info
    const enrichedRecords = await Promise.all(
        (data || []).map(async (record) => {
            let doctorName = 'Unknown Doctor';
            let patientName = 'Unknown Patient';

            if (record.doctor_id) {
                const { data: doctorData } = await supabase
                    .from('doctor_profiles')
                    .select('first_name, last_name, specialty')
                    .eq('id', record.doctor_id)
                    .single();
                if (doctorData) {
                    doctorName = `Dr. ${doctorData.first_name} ${doctorData.last_name}`;
                }
            }

            if (record.patient_id) {
                const { data: patientData } = await supabase
                    .from('users')
                    .select('full_name')
                    .eq('id', record.patient_id)
                    .single();
                if (patientData?.full_name) {
                    patientName = patientData.full_name;
                } else {
                    patientName = `Patient #${record.patient_id.substring(0, 8)}`;
                }
            }

            return {
                ...record,
                doctor_name: doctorName,
                patient_name: patientName
            };
        })
    );

    return enrichedRecords;
}
