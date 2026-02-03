import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import { UserProfile } from './database.types';

export type RecordType = 'Lab Result' | 'Prescription' | 'Imaging' | 'General' | 'Clinical Note';

export interface PatientRecord {
  id: string;
  name: string;
  type: RecordType;
  date: string;
  facility: string;
  doctor: string;
  notes?: string;
  diagnosis?: string;
  ipfsHash: string;
  category: 'Laboratory' | 'Pharmacy' | 'Radiology' | 'General' | 'Diagnosis';
}

export interface ActivityLog {
  id: string;
  date: string;
  actor: string;
  action: 'Viewed' | 'Downloaded' | 'Uploaded' | 'Access Granted' | 'Access Revoked' | 'Emergency Access' | 'Record Approved' | 'Record Rejected';
  details?: string;
  txHash: string;
  patientId?: string;
}

// Helper function to map record types to dashboard categories
function mapRecordTypeToCategory(recordType: string): PatientRecord['category'] {
  const normalizedType = recordType?.toLowerCase() || '';
  if (normalizedType.includes('lab')) return 'Laboratory';
  if (normalizedType.includes('imaging') || normalizedType.includes('radiology') || normalizedType.includes('x-ray') || normalizedType.includes('mri')) return 'Radiology';
  if (normalizedType.includes('prescription') || normalizedType.includes('pharmacy') || normalizedType.includes('medication')) return 'Pharmacy';
  if (normalizedType.includes('diagnosis')) return 'Diagnosis';
  return 'General';
}

export interface AccessPermission {
  id: string;
  entityName: string;
  entityAddress: string;
  grantedDate: string;
  level: 'view_summary' | 'view_records' | 'emergency_access' | 'full_access' | string;
  entityType?: 'user' | 'hospital';
}

export type StaffRole = 'Doctor' | 'Nurse' | 'Admin';

export type HospitalStatus = 'Pending' | 'Verified' | 'Rejected';

export interface VerificationRequest {
  id: string;
  name: string;
  address: string;
  license: string;
  status: HospitalStatus;
  timestamp: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  walletAddress: string;
  status: 'Active' | 'Suspended';
}

export interface Vitals {
  fullName?: string;
  dob?: string;
  gender?: string;
  bloodType: string;
  genotype: string;
  weight: number;
  height: number;
  bloodPressure: string;
  glucose: string;
  allergies: string[];
  conditions: string[];
  medications: string[];
  lastCheckup: string;
  // Contact & Address
  phoneNumber?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

interface AppState {
  // Common
  walletAddress: string | null;
  isConnected: boolean;
  isAuthenticated: boolean;
  isAuthorized: boolean;
  userRole: 'Patient' | 'Hospital' | 'Doctor' | 'Admin' | null;
  supabaseSession: Session | null;
  supabaseUser: User | null;
  userProfile: UserProfile | null; // Data from your public.users table

  setSession: (session: Session | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  fetchUserProfile: () => Promise<void>;
  checkAuthorization: (status: boolean) => void;
  setUserRole: (role: 'Patient' | 'Hospital' | 'Doctor' | 'Admin' | null) => void;

  // Patient Side
  profileImage: string | null;
  userVitals: Vitals;
  records: PatientRecord[];
  accessPermissions: AccessPermission[];
  activityLogs: ActivityLog[];

  // Clinical Side
  staffMembers: StaffMember[];
  currentStaff: StaffMember | null;
  patients: Array<{
    id: string;
    name: string;
    dob: string;
    walletAddress: string;
    lastVisit: string;
  }>;
  emergencyAccess: {
    isActive: boolean;
    expiresAt: number | null;
    patientId: string | null;
  };
  activeEncounterPatientId: string | null;

  // Admin State
  verificationRequests: VerificationRequest[];
  paymasterBalance: number;
  complianceScore: number;

  // Actions
  connectWallet: (address: string) => void;
  disconnectWallet: () => void;
  authenticateUser: (role?: StaffRole) => void;
  setProfileImage: (image: string) => void;
  addRecord: (record: PatientRecord) => Promise<void>;
  updateVitals: (vitals: Partial<Vitals>) => Promise<void>;
  grantAccess: (permission: AccessPermission) => Promise<void>;
  revokeAccess: (id: string) => Promise<void>;
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'date'>) => Promise<void>;

  // Clinical Actions
  addStaff: (staff: StaffMember) => void;
  revokeStaff: (id: string) => void;
  activateEmergency: (patientId: string) => void;
  clearEmergency: () => void;
  setActivePatient: (id: string | null) => void;

  // Admin Actions
  verifyHospital: (id: string) => void;
  rejectHospital: (id: string) => void;
  topUpPaymaster: (amount: number) => void;
}

export const useAppStore = create<AppState>()(
  (set, get) => ({
    walletAddress: null,
    isConnected: false,
    isAuthenticated: false,
    isAuthorized: true, // Default true for demo, set to false in production until checked
    userRole: null,
    supabaseSession: null,
    supabaseUser: null,
    userProfile: null,

    setSession: (session) => set({
      supabaseSession: session,
      supabaseUser: session?.user || null,
      isAuthenticated: !!session
    }),
    setUserProfile: (profile) => set({ userProfile: profile }),
    fetchUserProfile: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Fetch user basic info
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      // Fetch patient profile (medical data)
      const { data: patientData } = await supabase
        .from('patient_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (userData && !userError) {
        // Fetch supplemental data in parallel
        const [recordsRes, permissionsRes, logsRes] = await Promise.all([
          // Fetch approved medical records from medical_record_submissions table
          supabase.from('medical_record_submissions')
            .select('id, submission_code, record_type, record_title, record_description, ipfs_hash, overall_status, created_at, updated_at, doctor_id, hospital_id')
            .eq('patient_id', session.user.id)
            .eq('overall_status', 'approved')
            .order('created_at', { ascending: false }),
          supabase.from('access_permissions').select('*').eq('user_id', session.user.id).order('granted_at', { ascending: false }),
          supabase.from('activity_logs').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
        ]);

        // Enrich records with doctor and hospital names
        const enrichedRecords = await Promise.all(
          (recordsRes.data || []).map(async (r) => {
            let doctorName = 'Unknown Doctor';
            let hospitalName = 'Unknown Facility';

            if (r.doctor_id) {
              const { data: docData } = await supabase.from('doctor_profiles').select('first_name, last_name').eq('id', r.doctor_id).single();
              if (docData) doctorName = `Dr. ${docData.first_name} ${docData.last_name}`;
            }
            if (r.hospital_id) {
              const { data: hospData } = await supabase.from('hospital_profiles').select('hospital_name').eq('id', r.hospital_id).single();
              if (hospData) hospitalName = hospData.hospital_name;
            }

            return { ...r, doctor_name: doctorName, hospital_name: hospitalName };
          })
        );

        set((state) => ({
          userProfile: userData,
          userVitals: {
            ...state.userVitals,
            // Basic info from users table
            fullName: userData.full_name || '',
            dob: userData.dob || patientData?.date_of_birth || '',
            // Medical data from patient_profiles table (with fallbacks)
            bloodType: patientData?.blood_type || state.userVitals.bloodType,
            genotype: patientData?.genotype || state.userVitals.genotype,
            gender: patientData?.gender || '',
            weight: patientData?.weight || userData.weight || state.userVitals.weight,
            height: patientData?.height || userData.height || state.userVitals.height,
            allergies: patientData?.allergies || [],
            conditions: patientData?.medical_conditions || [],
            medications: patientData?.medications || [],
            bloodPressure: patientData?.blood_pressure || "N/A",
            glucose: patientData?.glucose || "N/A",
            lastCheckup: userData.last_checkup || "N/A",
            // Contact & Address
            phoneNumber: patientData?.phone_number || '',
            emergencyContact: patientData?.emergency_contact || '',
            emergencyPhone: patientData?.emergency_phone || '',
            address: patientData?.address || '',
            city: patientData?.city || '',
            state: patientData?.state || '',
            country: patientData?.country || '',
            postalCode: patientData?.postal_code || '',
          },
          records: enrichedRecords?.map(r => ({
            id: r.id,
            name: r.record_title,
            type: r.record_type as PatientRecord['type'],
            date: new Date(r.created_at).toISOString().split('T')[0],
            facility: r.hospital_name || 'Unknown Facility',
            doctor: r.doctor_name || 'Unknown Doctor',
            notes: r.record_description,
            ipfsHash: r.ipfs_hash || '',
            category: mapRecordTypeToCategory(r.record_type)
          })) || [],
          accessPermissions: permissionsRes.data?.map(p => ({
            id: p.id,
            entityName: p.entity_name,
            entityAddress: p.entity_address,
            grantedDate: new Date(p.granted_at).toISOString().split('T')[0],
            level: p.level,
            entityType: p.entity_type || 'user'
          })) || [],
          activityLogs: logsRes.data?.map(l => ({
            id: l.id,
            date: new Date(l.created_at).toLocaleString(),
            actor: l.actor_name || l.actor || 'Unknown System',
            action: l.action,
            details: l.details || '',
            txHash: l.tx_hash || ''
          })) || []
        }));
      } else {
        // No profile found or error - reset to defaults but keep user info
        set((state) => ({
          userProfile: null,
          userVitals: {
            ...state.userVitals,
            fullName: "",
            dob: "",
            bloodType: "N/A",
            genotype: "N/A",
            weight: 0,
            height: 0,
            allergies: [],
            conditions: [],
            medications: [],
            bloodPressure: "N/A",
            glucose: "N/A",
            lastCheckup: "N/A",
          },
          records: [],
          accessPermissions: [],
          activityLogs: []
        }));
      }
    },
    setUserRole: (role) => set({ userRole: role }),
    profileImage: null,
    userVitals: {
      bloodType: 'N/A',
      genotype: 'N/A',
      allergies: [],
      conditions: [],
      medications: [],
      bloodPressure: 'N/A',
      glucose: 'N/A',
      bmi: 0,
      weight: 0,
      height: 0,
      lastCheckup: 'N/A',
    },
    records: [],
    accessPermissions: [],
    activityLogs: [],

    staffMembers: [
      { id: 's1', name: 'Dr. Gregory House', role: 'Doctor', walletAddress: '0x123...abc', status: 'Active' },
      { id: 's2', name: 'James Wilson', role: 'Admin', walletAddress: '0x456...def', status: 'Active' },
      { id: 's3', name: 'Lisa Cuddy', role: 'Admin', walletAddress: '0x789...ghi', status: 'Active' }
    ],
    currentStaff: null,
    patients: [
      { id: 'p_8291', name: 'Kenzy S.', dob: '1995-05-12', walletAddress: '0x71C...345a', lastVisit: '2024-12-10' },
      { id: 'p_1023', name: 'Alice M.', dob: '1988-11-20', walletAddress: '0x992...f71c', lastVisit: '2024-11-25' }
    ],
    emergencyAccess: {
      isActive: false,
      expiresAt: null,
      patientId: null
    },
    activeEncounterPatientId: null,

    // Admin Initial State
    verificationRequests: [
      {
        id: 'v1',
        name: 'City General Hospital',
        address: '0x123...abc',
        license: 'MED-99281',
        status: 'Pending',
        timestamp: new Date().toISOString()
      },
      {
        id: 'v2',
        name: 'Mercy Medical Center',
        address: '0x456...def',
        license: 'MED-10234',
        status: 'Verified',
        timestamp: new Date().toISOString()
      }
    ],
    paymasterBalance: 1250.50,
    complianceScore: 98,

    connectWallet: (address: string) => set({ walletAddress: address, isConnected: true, isAuthenticated: true }),
    disconnectWallet: () => set({ walletAddress: null, isConnected: false, isAuthenticated: false, currentStaff: null }),
    authenticateUser: (role?: StaffRole) => {
      if (role) {
        const staff = { id: 's_current', name: 'Dr. Staff User', role, walletAddress: '0xCUSTOM', status: 'Active' } as StaffMember;
        set({ isAuthenticated: true, currentStaff: staff });
      } else {
        set({ isAuthenticated: true });
      }
    },
    setProfileImage: (image: string) => set({ profileImage: image }),
    addRecord: async (record: PatientRecord) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('medical_records')
        .insert({
          user_id: session.user.id,
          name: record.name,
          type: record.type,
          category: record.category,
          doctor: record.doctor,
          facility: record.facility,
          notes: record.notes,
          ipfs_hash: record.ipfsHash
        })
        .select()
        .single();

      if (data && !error) {
        set((state) => ({
          records: [record, ...state.records]
        }));
        await get().addActivityLog({
          actor: 'You',
          action: 'Uploaded',
          txHash: record.ipfsHash.slice(0, 10) + '...'
        });
      }
    },
    updateVitals: async (vitals: Partial<Vitals>) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { error } = await supabase
        .from('users')
        .update({
          full_name: vitals.fullName,
          dob: vitals.dob,
          blood_group: vitals.bloodType,
          genotype: vitals.genotype,
          weight: vitals.weight,
          height: vitals.height,
          blood_pressure: vitals.bloodPressure,
          glucose: vitals.glucose,
          allergies: vitals.allergies,
          medications: vitals.medications,
          chronic_conditions: vitals.conditions,
        })
        .eq('id', session.user.id);

      if (!error) {
        set((state) => ({
          userVitals: { ...state.userVitals, ...vitals }
        }));
      }
    },
    grantAccess: async (permission: AccessPermission) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('access_permissions')
        .insert({
          user_id: session.user.id,
          entity_name: permission.entityName,
          entity_address: permission.entityAddress,
          level: permission.level
        })
        .select()
        .single();

      if (data && !error) {
        set((state) => ({
          accessPermissions: [permission, ...state.accessPermissions]
        }));
        await get().addActivityLog({
          actor: 'You',
          action: 'Access Granted',
          txHash: '0x' + Math.random().toString(16).substring(2, 12)
        });
      }
    },
    revokeAccess: async (id: string) => {
      const { error } = await supabase
        .from('access_permissions')
        .delete()
        .eq('id', id);

      if (!error) {
        set((state) => ({
          accessPermissions: state.accessPermissions.filter(p => p.id !== id)
        }));
        await get().addActivityLog({
          actor: 'You',
          action: 'Access Revoked',
          txHash: '0x' + Math.random().toString(16).substring(2, 12)
        });
      }
    },
    addActivityLog: async (log: Omit<ActivityLog, 'id' | 'date'>) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: session.user.id,
          actor: log.actor,
          action: log.action,
          tx_hash: log.txHash
        })
        .select()
        .single();

      if (data && !error) {
        const newLog: ActivityLog = {
          id: data.id,
          date: new Date(data.created_at).toLocaleString(),
          actor: data.actor,
          action: data.action,
          txHash: data.tx_hash
        };
        set((state) => ({ activityLogs: [newLog, ...state.activityLogs] }));
      }
    },

    addStaff: (staff: StaffMember) => set((state) => ({ staffMembers: [staff, ...state.staffMembers] })),
    revokeStaff: (id: string) => set((state) => ({ staffMembers: state.staffMembers.filter(s => s.id !== id) })),
    activateEmergency: (patientId: string) => set({
      emergencyAccess: {
        isActive: true,
        expiresAt: Date.now() + 5 * 60 * 1000,
        patientId
      }
    }),
    clearEmergency: () => set({ emergencyAccess: { isActive: false, expiresAt: null, patientId: null } }),
    checkAuthorization: (status: boolean) => set({ isAuthorized: status }),
    setActivePatient: (id: string | null) => set({ activeEncounterPatientId: id }),

    // Admin Actions Implementation
    verifyHospital: (id: string) => set((state) => ({
      verificationRequests: state.verificationRequests.map(h =>
        h.id === id ? { ...h, status: 'Verified' } : h
      )
    })),
    rejectHospital: (id: string) => set((state) => ({
      verificationRequests: state.verificationRequests.map(req =>
        req.id === id ? { ...req, status: 'Rejected' } : req
      )
    })),
    topUpPaymaster: (amount: number) => set((state) => ({
      paymasterBalance: state.paymasterBalance + amount
    }))
  })
);
