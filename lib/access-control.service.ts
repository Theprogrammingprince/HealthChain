import { supabase } from './supabaseClient';
import type {
    PatientAccessPermission,
    PatientAccessPermissionInsert,
    PatientAccessPermissionUpdate,
    PatientAccessCode,
    PatientAccessCodeInsert,
    PatientRecordAccessLog,
    PatientRecordAccessLogInsert,
    PatientEmergencyContact,
    PatientEmergencyContactInsert,
    PatientEmergencyContactUpdate,
    ActivePatientPermission,
    RecentRecordAccess
} from './database.types';

// ==================== PERMISSION MANAGEMENT ====================

/**
 * Grant access to a doctor
 */
export async function grantDoctorAccess(
    patientId: string,
    doctorId: string,
    accessType: 'read' | 'read_write' | 'full' = 'read',
    options?: {
        recordTypes?: string[];
        expiresAt?: Date;
        purpose?: string;
        notifyOnAccess?: boolean;
    }
): Promise<PatientAccessPermission> {
    const { data, error } = await supabase
        .from('patient_access_permissions')
        .insert({
            patient_id: patientId,
            doctor_id: doctorId,
            hospital_id: null,
            access_type: accessType,
            allowed_record_types: options?.recordTypes || null,
            expires_at: options?.expiresAt?.toISOString() || null,
            access_purpose: options?.purpose || null,
            notify_on_access: options?.notifyOnAccess ?? true,
            grant_method: 'manual',
            is_emergency_access: false,
            status: 'active'
        } as PatientAccessPermissionInsert)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Grant access to a hospital
 */
export async function grantHospitalAccess(
    patientId: string,
    hospitalId: string,
    accessType: 'read' | 'read_write' | 'full' = 'read',
    options?: {
        recordTypes?: string[];
        expiresAt?: Date;
        purpose?: string;
    }
): Promise<PatientAccessPermission> {
    const { data, error } = await supabase
        .from('patient_access_permissions')
        .insert({
            patient_id: patientId,
            doctor_id: null,
            hospital_id: hospitalId,
            access_type: accessType,
            allowed_record_types: options?.recordTypes || null,
            expires_at: options?.expiresAt?.toISOString() || null,
            access_purpose: options?.purpose || null,
            grant_method: 'manual',
            is_emergency_access: false,
            status: 'active'
        } as PatientAccessPermissionInsert)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Revoke access permission
 */
export async function revokeAccess(
    permissionId: string,
    reason?: string
): Promise<PatientAccessPermission> {
    const userId = (await supabase.auth.getUser()).data.user?.id;

    const { data, error } = await supabase
        .from('patient_access_permissions')
        .update({
            status: 'revoked',
            revoked_at: new Date().toISOString(),
            revoked_by: userId,
            revoked_reason: reason || null
        } as PatientAccessPermissionUpdate)
        .eq('id', permissionId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Get all active permissions for a patient
 */
export async function getPatientAccessPermissions(
    patientId: string
): Promise<ActivePatientPermission[]> {
    const { data, error } = await supabase
        .from('active_patient_permissions')
        .select('*')
        .eq('patient_id', patientId);

    if (error) throw error;
    return data || [];
}

/**
 * Get all patients accessible by a doctor
 */
export async function getDoctorAccessiblePatients(
    doctorId: string
): Promise<ActivePatientPermission[]> {
    const { data, error } = await supabase
        .from('active_patient_permissions')
        .select('*')
        .eq('doctor_id', doctorId);

    if (error) throw error;
    return data || [];
}

/**
 * Check if doctor has access to patient records
 */
export async function checkDoctorAccess(
    doctorId: string,
    patientId: string,
    recordType?: string
): Promise<boolean> {
    const { data, error } = await supabase.rpc('check_doctor_has_access', {
        p_doctor_id: doctorId,
        p_patient_id: patientId,
        p_record_type: recordType || null
    });

    if (error) {
        console.error('Error checking doctor access:', error);
        return false;
    }

    return data === true;
}

// ==================== ACCESS CODE MANAGEMENT ====================

/**
 * Generate a new access code (QR or PIN)
 */
export async function generateAccessCode(
    patientId: string,
    options: {
        codeType?: 'qr' | 'pin' | 'url';
        durationMinutes?: number;
        recordTypes?: string[];
        purpose?: string;
        expiresAt?: Date;
        maxUses?: number;
    } = {}
): Promise<PatientAccessCode> {
    // Generate random code
    const { data: codeData, error: codeError } = await supabase.rpc('generate_access_code', {
        code_length: options.codeType === 'pin' ? 6 : 12
    });

    if (codeError) throw codeError;

    const expiresAt = options.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours default

    const { data, error } = await supabase
        .from('patient_access_codes')
        .insert({
            patient_id: patientId,
            access_code: codeData as string,
            code_type: options.codeType || 'qr',
            access_duration_minutes: options.durationMinutes || 60,
            allowed_record_types: options.recordTypes || null,
            purpose: options.purpose || null,
            expires_at: expiresAt.toISOString(),
            max_uses: options.maxUses || 1,
            current_uses: 0,
            status: 'active'
        } as PatientAccessCodeInsert)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Use/redeem an access code
 */
export async function useAccessCode(
    accessCode: string,
    doctorId: string
): Promise<{
    code: PatientAccessCode;
    permission: PatientAccessPermission;
}> {
    // First, verify code exists and is valid
    const { data: code, error: fetchError } = await supabase
        .from('patient_access_codes')
        .select('*')
        .eq('access_code', accessCode)
        .eq('status', 'active')
        .single();

    if (fetchError || !code) {
        throw new Error('Invalid or expired access code');
    }

    // Check if code has expired
    if (new Date(code.expires_at) < new Date()) {
        throw new Error('Access code has expired');
    }

    // Check if max uses exceeded
    if (code.max_uses !== null && code.current_uses >= code.max_uses) {
        throw new Error('Access code has reached maximum uses');
    }

    // Update code usage
    const newUses = code.current_uses + 1;
    const newStatus = code.max_uses && newUses >= code.max_uses ? 'used' : 'active';

    const { error: updateError } = await supabase
        .from('patient_access_codes')
        .update({
            current_uses: newUses,
            status: newStatus,
            first_used_at: code.first_used_at || new Date().toISOString(),
            last_used_at: new Date().toISOString(),
            used_by_doctor_id: doctorId,
            ip_address_used: await getUserIP(),
            user_agent_used: typeof navigator !== 'undefined' ? navigator.userAgent : null
        })
        .eq('id', code.id);

    if (updateError) throw updateError;

    // Create temporary access permission
    const permission = await grantDoctorAccess(
        code.patient_id,
        doctorId,
        'read',
        {
            recordTypes: code.allowed_record_types || undefined,
            expiresAt: new Date(Date.now() + code.access_duration_minutes * 60 * 1000),
            purpose: `Access via code: ${code.purpose || 'Not specified'}`
        }
    );

    // Log the access
    await logAccessEvent(code.patient_id, doctorId, null, 'access_code', 'view', {
        accessCodeId: code.id
    });

    return { code, permission };
}

/**
 * Get active access codes for a patient
 */
export async function getPatientAccessCodes(
    patientId: string,
    includeExpired: boolean = false
): Promise<PatientAccessCode[]> {
    let query = supabase
        .from('patient_access_codes')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

    if (!includeExpired) {
        query = query.in('status', ['active', 'used']);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
}

/**
 * Revoke an access code
 */
export async function revokeAccessCode(codeId: string): Promise<void> {
    const { error } = await supabase
        .from('patient_access_codes')
        .update({ status: 'revoked' })
        .eq('id', codeId);

    if (error) throw error;
}

// ==================== EMERGENCY ACCESS ====================

/**
 * Request emergency access to patient records
 */
export async function requestEmergencyAccess(
    patientId: string,
    doctorId: string,
    justification: string,
    emergencyLevel: 'critical' | 'urgent' = 'critical',
    durationHours: number = 24
): Promise<PatientAccessPermission> {
    const userId = (await supabase.auth.getUser()).data.user?.id;

    const { data, error } = await supabase
        .from('patient_access_permissions')
        .insert({
            patient_id: patientId,
            doctor_id: doctorId,
            hospital_id: null,
            access_type: 'emergency',
            is_emergency_access: true,
            emergency_justification: justification,
            emergency_expires_at: new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString(),
            granted_by: userId,
            grant_method: 'emergency',
            status: 'active',
            notify_on_access: true
        } as PatientAccessPermissionInsert)
        .select()
        .single();

    if (error) throw error;

    // Log the emergency access
    await logAccessEvent(patientId, doctorId, null, 'emergency_access', 'view', {
        isEmergency: true,
        emergencyLevel,
        justification
    });

    return data;
}

/**
 * Get all emergency accesses for monitoring
 */
export async function getEmergencyAccesses(
    filters?: {
        patientId?: string;
        doctorId?: string;
        dateFrom?: Date;
        dateTo?: Date;
    }
): Promise<PatientAccessPermission[]> {
    let query = supabase
        .from('patient_access_permissions')
        .select('*')
        .eq('is_emergency_access', true)
        .order('created_at', { ascending: false });

    if (filters?.patientId) {
        query = query.eq('patient_id', filters.patientId);
    }

    if (filters?.doctorId) {
        query = query.eq('doctor_id', filters.doctorId);
    }

    if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom.toISOString());
    }

    if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
}

// ==================== ACCESS LOGGING ====================

/**
 * Log access to patient records
 */
export async function logAccessEvent(
    patientId: string,
    doctorId: string,
    recordId: string | null,
    accessMethod: string,
    action: 'view' | 'download' | 'export' | 'print' = 'view',
    options?: {
        recordType?: string;
        permissionId?: string;
        accessCodeId?: string;
        isEmergency?: boolean;
        emergencyLevel?: 'critical' | 'urgent' | 'standard';
        justification?: string;
        purpose?: string;
    }
): Promise<PatientRecordAccessLog> {
    const { data, error } = await supabase
        .from('patient_record_access_log')
        .insert({
            patient_id: patientId,
            doctor_id: doctorId,
            record_id: recordId,
            record_type: options?.recordType || null,
            access_method: accessMethod,
            action_performed: action,
            permission_id: options?.permissionId || null,
            access_code_id: options?.accessCodeId || null,
            is_emergency_access: options?.isEmergency || false,
            emergency_level: options?.emergencyLevel || null,
            clinical_justification: options?.justification || null,
            access_purpose: options?.purpose || null,
            ip_address: await getUserIP(),
            user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
            patient_notified: false
        } as PatientRecordAccessLogInsert)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Get access log for a patient
 */
export async function getPatientAccessLog(
    patientId: string,
    limit: number = 50
): Promise<RecentRecordAccess[]> {
    const { data, error } = await supabase
        .from('recent_record_access')
        .select('*')
        .eq('patient_id', patientId)
        .limit(limit);

    if (error) throw error;
    return data || [];
}

/**
 * Get access log for a doctor
 */
export async function getDoctorAccessLog(
    doctorId: string,
    limit: number = 50
): Promise<RecentRecordAccess[]> {
    const { data, error } = await supabase
        .from('recent_record_access')
        .select('*')
        .eq('doctor_id', doctorId)
        .limit(limit);

    if (error) throw error;
    return data || [];
}

// ==================== EMERGENCY CONTACTS ====================

/**
 * Add an emergency contact
 */
export async function addEmergencyContact(
    patientId: string,
    contactData: {
        name: string;
        relationship: string;
        phone: string;
        email?: string;
        canGrantAccess?: boolean;
        canRevokeAccess?: boolean;
        canViewRecords?: boolean;
        priority?: number;
    }
): Promise<PatientEmergencyContact> {
    const { data, error } = await supabase
        .from('patient_emergency_contacts')
        .insert({
            patient_id: patientId,
            contact_name: contactData.name,
            relationship: contactData.relationship,
            phone_number: contactData.phone,
            email: contactData.email || null,
            can_grant_access: contactData.canGrantAccess ?? true,
            can_revoke_access: contactData.canRevokeAccess ?? true,
            can_view_records: contactData.canViewRecords ?? false,
            priority: contactData.priority || 1,
            is_active: true,
            verified: false
        } as PatientEmergencyContactInsert)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Get emergency contacts for a patient
 */
export async function getEmergencyContacts(
    patientId: string
): Promise<PatientEmergencyContact[]> {
    const { data, error } = await supabase
        .from('patient_emergency_contacts')
        .select('*')
        .eq('patient_id', patientId)
        .eq('is_active', true)
        .order('priority', { ascending: true });

    if (error) throw error;
    return data || [];
}

/**
 * Update an emergency contact
 */
export async function updateEmergencyContact(
    contactId: string,
    updates: PatientEmergencyContactUpdate
): Promise<PatientEmergencyContact> {
    const { data, error } = await supabase
        .from('patient_emergency_contacts')
        .update(updates)
        .eq('id', contactId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Delete (deactivate) an emergency contact
 */
export async function deleteEmergencyContact(contactId: string): Promise<void> {
    const { error } = await supabase
        .from('patient_emergency_contacts')
        .update({ is_active: false })
        .eq('id', contactId);

    if (error) throw error;
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get user's IP address
 */
async function getUserIP(): Promise<string | null> {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch {
        return null;
    }
}

/**
 * Check if a permission has expired
 */
export function isPermissionExpired(permission: PatientAccessPermission): boolean {
    if (permission.status !== 'active') return true;

    if (permission.expires_at && new Date(permission.expires_at) < new Date()) {
        return true;
    }

    if (permission.is_emergency_access && permission.emergency_expires_at) {
        if (new Date(permission.emergency_expires_at) < new Date()) {
            return true;
        }
    }

    return false;
}

/**
 * Get permission summary for UI display
 */
export function getPermissionSummary(permission: ActivePatientPermission): string {
    const parts: string[] = [];

    if (permission.doctor_name) {
        parts.push(`Dr. ${permission.doctor_name}`);
    } else if (permission.hospital_name) {
        parts.push(permission.hospital_name);
    }

    parts.push(`(${permission.access_type})`);

    if (permission.is_emergency_access) {
        parts.push('[Emergency]');
    }

    if (permission.expires_at) {
        const expiryDate = new Date(permission.expires_at);
        parts.push(`Expires: ${expiryDate.toLocaleDateString()}`);
    }

    return parts.join(' ');
}

/**
 * Validate access code format
 */
export function validateAccessCode(code: string, type: 'pin' | 'qr'): boolean {
    if (type === 'pin') {
        return /^[0-9A-Z]{6}$/.test(code);
    }
    return /^[0-9A-Z]{12}$/.test(code);
}
