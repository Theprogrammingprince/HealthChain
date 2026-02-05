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
    AuthProvider,
    PatientAccessCode,
    PatientAccessCodeInsert,
    PatientAccessCodeUpdate,
    PatientAccessPermission,
    PatientAccessPermissionInsert,
    PatientAccessPermissionUpdate
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

// ==================== ACTIVITY LOG OPERATIONS ====================

/**
 * Create an activity log entry
 */
export async function createActivityLog(
    userId: string,
    actor: string,
    action: 'Viewed' | 'Downloaded' | 'Uploaded' | 'Access Granted' | 'Access Revoked' | 'Record Approved' | 'Record Rejected' | 'Emergency Access',
    details?: string,
    patientId?: string
) {
    // Generate a mock transaction hash (in production, this would be a real blockchain tx)
    const txHash = '0x' + [...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

    const { data, error } = await supabase
        .from('activity_logs')
        .insert({
            user_id: userId,
            patient_id: patientId || userId,
            actor_name: actor,
            actor: actor,
            action: action,
            details: details || '',
            tx_hash: txHash
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating activity log:', error);
        return null;
    }

    return data;
}

/**
 * Log record approval by patient
 */
export async function logPatientRecordApproval(
    patientId: string,
    patientName: string,
    recordTitle: string,
    doctorName: string
) {
    return createActivityLog(
        patientId,
        patientName,
        'Record Approved',
        `Approved medical record "${recordTitle}" from ${doctorName}`,
        patientId
    );
}

/**
 * Log record rejection by patient
 */
export async function logPatientRecordRejection(
    patientId: string,
    patientName: string,
    recordTitle: string,
    doctorName: string,
    reason?: string
) {
    return createActivityLog(
        patientId,
        patientName,
        'Record Rejected',
        `Rejected medical record "${recordTitle}" from ${doctorName}${reason ? `. Reason: ${reason}` : ''}`,
        patientId
    );
}

/**
 * Log record approval by hospital
 */
export async function logHospitalRecordApproval(
    userId: string,
    hospitalName: string,
    recordTitle: string,
    doctorName: string,
    patientId: string
) {
    return createActivityLog(
        userId,
        hospitalName,
        'Record Approved',
        `Hospital approved record "${recordTitle}" from ${doctorName} for patient review`,
        patientId
    );
}

/**
 * Log record rejection by hospital
 */
export async function logHospitalRecordRejection(
    userId: string,
    hospitalName: string,
    recordTitle: string,
    doctorName: string,
    patientId: string,
    reason?: string
) {
    return createActivityLog(
        userId,
        hospitalName,
        'Record Rejected',
        `Hospital rejected record "${recordTitle}" from ${doctorName}${reason ? `. Reason: ${reason}` : ''}`,
        patientId
    );
}

/**
 * Fetch activity logs for a user with optional filtering
 */
export async function getActivityLogs(
    userId: string,
    options?: {
        actionFilter?: string;
        startDate?: string;
        endDate?: string;
        limit?: number;
    }
) {
    let query = supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    // Apply action filter
    if (options?.actionFilter && options.actionFilter !== 'all') {
        query = query.eq('action', options.actionFilter);
    }

    // Apply date range filter
    if (options?.startDate) {
        query = query.gte('created_at', options.startDate);
    }
    if (options?.endDate) {
        query = query.lte('created_at', options.endDate);
    }

    // Apply limit
    if (options?.limit) {
        query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching activity logs:', error);
        return [];
    }

    return data.map(log => ({
        id: log.id,
        date: new Date(log.created_at).toLocaleString(),
        actor: log.actor || log.actor_name || 'Unknown',
        action: log.action,
        details: log.details || '',
        txHash: log.tx_hash || '',
        patientId: log.patient_id
    }));
}

/**
 * Get activity log statistics for a user
 */
export async function getActivityLogStats(userId: string) {
    const { data, error } = await supabase
        .from('activity_logs')
        .select('action')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching activity log stats:', error);
        return null;
    }

    const stats = {
        total: data.length,
        viewed: data.filter(l => l.action === 'Viewed').length,
        downloaded: data.filter(l => l.action === 'Downloaded').length,
        uploaded: data.filter(l => l.action === 'Uploaded').length,
        accessGranted: data.filter(l => l.action === 'Access Granted').length,
        accessRevoked: data.filter(l => l.action === 'Access Revoked').length,
        recordApproved: data.filter(l => l.action === 'Record Approved').length,
        recordRejected: data.filter(l => l.action === 'Record Rejected').length,
        emergencyAccess: data.filter(l => l.action === 'Emergency Access').length
    };

    return stats;
}

// ==================== EMERGENCY ACCESS OPERATIONS ====================

/**
 * Generate an emergency access token for a patient (6 characters)
 */
export function generateEmergencyToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';
    for (let i = 0; i < 6; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

/**
 * Create an emergency access session
 */
export async function createEmergencyAccessSession(
    patientId: string,
    expiryMinutes: number = 15
) {
    const token = generateEmergencyToken();
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString();

    // Log the emergency access creation
    await createActivityLog(
        patientId,
        'System',
        'Emergency Access',
        `Emergency access token generated. Expires in ${expiryMinutes} minutes.`,
        patientId
    );

    return {
        token,
        expiresAt,
        patientId,
        url: `https://healthchain.app/emergency/${token}`
    };
}

/**
 * Get patient emergency profile (public info for first responders)
 */
export async function getEmergencyProfile(patientId: string) {
    const { data: profile, error: profileError } = await supabase
        .from('patient_profiles')
        .select('*')
        .eq('user_id', patientId)
        .single();

    if (profileError) {
        console.error('Error fetching emergency profile:', profileError);
        return null;
    }

    const { data: user } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', patientId)
        .single();

    return {
        // Patient identification
        fullName: user?.full_name || 'Unknown',
        dateOfBirth: profile?.date_of_birth || null,
        gender: profile?.gender || null,

        // Critical medical info
        bloodType: profile?.blood_type || 'Unknown',
        genotype: profile?.genotype || 'Unknown',
        allergies: profile?.allergies || [],
        conditions: profile?.conditions || [],
        medications: profile?.medications || [],

        // Vitals
        bloodPressure: profile?.blood_pressure || null,
        glucose: profile?.glucose || null,
        weight: profile?.weight || null,
        height: profile?.height || null,

        // Emergency contact
        emergencyContact: profile?.emergency_contact || null,
        emergencyPhone: profile?.emergency_phone || null,

        // Metadata
        lastUpdated: profile?.updated_at || profile?.created_at
    };
}

/**
 * Log emergency access event
 */
export async function logEmergencyAccess(
    patientId: string,
    accessorName: string,
    accessorRole: string
) {
    return createActivityLog(
        patientId,
        `${accessorName} (${accessorRole})`,
        'Emergency Access',
        `Emergency access used by ${accessorRole}`,
        patientId
    );
}

// ==================== NOTIFICATION OPERATIONS ====================

export type NotificationType =
    | "record_approved"
    | "record_rejected"
    | "pending_approval"
    | "hospital_verified"
    | "access_granted"
    | "access_revoked"
    | "access_request"
    | "emergency_alert"
    | "system";

/**
 * Create a notification for a user
 */
export async function createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    actionLink?: string
) {
    const { data, error } = await supabase
        .from('notifications')
        .insert({
            user_id: userId,
            type,
            title,
            message,
            action_link: actionLink || null,
            is_read: false
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating notification:', error);
        return null;
    }

    return data;
}

/**
 * Notify patient when record is approved
 */
export async function notifyPatientRecordApproved(
    patientId: string,
    recordTitle: string,
    approverName: string
) {
    return createNotification(
        patientId,
        'record_approved',
        'Record Approved',
        `Your medical record "${recordTitle}" has been approved by ${approverName}.`,
        '/patient/dashboard'
    );
}

/**
 * Notify patient when record is rejected
 */
export async function notifyPatientRecordRejected(
    patientId: string,
    recordTitle: string,
    rejectorName: string,
    reason?: string
) {
    const message = reason
        ? `Your medical record "${recordTitle}" was rejected by ${rejectorName}. Reason: ${reason}`
        : `Your medical record "${recordTitle}" was rejected by ${rejectorName}.`;

    return createNotification(
        patientId,
        'record_rejected',
        'Record Rejected',
        message,
        '/patient/dashboard'
    );
}

/**
 * Notify patient of pending approval
 */
export async function notifyPatientPendingApproval(
    patientId: string,
    recordTitle: string,
    doctorName: string,
    hospitalName: string
) {
    return createNotification(
        patientId,
        'pending_approval',
        'New Record Pending Approval',
        `Dr. ${doctorName} from ${hospitalName} has submitted a record "${recordTitle}" for your approval.`,
        '/patient/dashboard'
    );
}

/**
 * Notify doctor when their submission is approved
 */
export async function notifyDoctorRecordApproved(
    doctorId: string,
    recordTitle: string,
    approverType: 'hospital' | 'patient',
    approverName: string
) {
    return createNotification(
        doctorId,
        'record_approved',
        `${approverType === 'hospital' ? 'Hospital' : 'Patient'} Approved Record`,
        `Your submission "${recordTitle}" was approved by ${approverName}.`,
        '/doctor/dashboard'
    );
}

/**
 * Notify doctor when their submission is rejected
 */
export async function notifyDoctorRecordRejected(
    doctorId: string,
    recordTitle: string,
    rejectorType: 'hospital' | 'patient',
    rejectorName: string,
    reason?: string
) {
    const message = reason
        ? `Your submission "${recordTitle}" was rejected by ${rejectorName}. Reason: ${reason}`
        : `Your submission "${recordTitle}" was rejected by ${rejectorName}.`;

    return createNotification(
        doctorId,
        'record_rejected',
        `${rejectorType === 'hospital' ? 'Hospital' : 'Patient'} Rejected Record`,
        message,
        '/doctor/dashboard'
    );
}

/**
 * Notify hospital of new pending submission
 */
export async function notifyHospitalPendingSubmission(
    hospitalAdminId: string,
    recordTitle: string,
    doctorName: string,
    patientName: string
) {
    return createNotification(
        hospitalAdminId,
        'pending_approval',
        'New Submission for Review',
        `Dr. ${doctorName} has submitted a record "${recordTitle}" for patient ${patientName}.`,
        '/clinical/dashboard'
    );
}

/**
 * Get user notifications
 */
export async function getUserNotifications(userId: string, limit = 20) {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }

    return data;
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    if (error) {
        console.error('Error fetching unread count:', error);
        return 0;
    }

    return count || 0;
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

    return !error;
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    return !error;
}

// ==================== PATIENT ACCESS CONTROL OPERATIONS ====================

/**
 * Generate a random 6-digit alphanumeric code
 */
function generateRandomCode(length: number = 6): string {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Generate a one-time access code for a patient
 */
export async function createPatientAccessCode(patientId: string, expiryMinutes: number = 10) {
    const code = generateRandomCode(6);
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString();

    const { data, error } = await supabase
        .from('patient_access_codes')
        .insert({
            patient_id: patientId,
            code: code,
            status: 'active',
            expires_at: expiresAt
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating patient access code:', error);
        throw error;
    }

    return data as PatientAccessCode;
}

/**
 * Validate an access code and return the patient ID
 */
export async function validateAccessCode(code: string) {
    const { data, error } = await supabase
        .from('patient_access_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return { error: 'Invalid or expired code' };
        }
        console.error('Error validating access code:', error);
        throw error;
    }

    return { patientId: data.patient_id, codeId: data.id };
}

/**
 * Request access using a code (Hospital/Doctor side)
 */
export async function requestAccessByCode(code: string, accessorId: string, accessorName: string) {
    const validation = await validateAccessCode(code);
    if ('error' in validation) return { error: validation.error };

    const { patientId } = validation;

    // Create a notification for the patient
    await createNotification(
        patientId,
        'access_request',
        'Access Requested',
        `${accessorName} is requesting temporary access to your medical records using a code.`,
        `/patient/dashboard?action=approve_access&accessorId=${accessorId}`
    );

    return { patientId, success: true };
}

/**
 * Grant time-limited access to a doctor or hospital
 */
export async function grantAccessPermission(
    patientId: string,
    accessorId: string,
    accessorType: 'hospital' | 'doctor',
    expiryHours: number = 24,
    scope: 'full' | 'partial' = 'full'
) {
    const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
        .from('patient_access_permissions')
        .insert({
            patient_id: patientId,
            accessor_id: accessorId,
            accessor_type: accessorType,
            scope: scope,
            status: 'active',
            expires_at: expiresAt
        })
        .select()
        .single();

    if (error) {
        console.error('Error granting access permission:', error);
        throw error;
    }

    // Log the event
    await createActivityLog(
        patientId,
        'System',
        'Access Granted',
        `Access granted to ${accessorType} for ${expiryHours} hours. Scope: ${scope}`,
        patientId
    );

    return data as PatientAccessPermission;
}

/**
 * Check if an accessor has active permission for a patient
 */
export async function checkAccessPermission(patientId: string, accessorId: string) {
    const { data, error } = await supabase
        .from('patient_access_permissions')
        .select('*')
        .eq('patient_id', patientId)
        .eq('accessor_id', accessorId)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .limit(1);

    if (error) {
        console.error('Error checking access permission:', error);
        return false;
    }

    return data && data.length > 0;
}

/**
 * Revoke an active access permission
 */
export async function revokeAccessPermission(permissionId: string, patientId: string) {
    const { error } = await supabase
        .from('patient_access_permissions')
        .update({
            status: 'revoked',
            updated_at: new Date().toISOString()
        })
        .eq('id', permissionId)
        .eq('patient_id', patientId);

    if (error) {
        console.error('Error revoking access permission:', error);
        throw error;
    }

    return true;
}

/**
 * Get all active permissions for a patient
 */
export async function getActivePatientPermissions(patientId: string) {
    const { data, error } = await supabase
        .from('patient_access_permissions')
        .select(`
            *,
            accessor:accessor_id (
                id,
                full_name
            )
        `)
        .eq('patient_id', patientId)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString());

    if (error) {
        console.error('Error fetching active permissions:', error);
        return [];
    }

    return data;
}
