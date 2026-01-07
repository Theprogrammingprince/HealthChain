import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';

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
  action: 'Viewed' | 'Downloaded' | 'Uploaded' | 'Access Granted' | 'Access Revoked' | 'Emergency Access';
  txHash: string;
  patientId?: string;
}

export interface AccessPermission {
  id: string;
  entityName: string;
  entityAddress: string;
  grantedDate: string;
  level: 'Full' | 'Emergency Only';
}

export type StaffRole = 'Doctor' | 'Nurse' | 'Admin';

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
  bloodType: string;
  genotype: string;
  religion?: string;
  allergies: string[];
  conditions: string[];
  medications: string[];
  bloodPressure: string;
  glucose: string;
  bmi: number;
  weight: number;
  height: number;
  lastCheckup: string;
}

interface AppState {
  // Common
  walletAddress: string | null;
  isConnected: boolean;
  isAuthenticated: boolean;
  isAuthorized: boolean;
  userRole: 'Patient' | 'Hospital' | 'Admin' | null;
  supabaseSession: Session | null;
  supabaseUser: User | null;
  userProfile: any | null; // Data from your public.users table

  setSession: (session: Session | null) => void;
  setUserProfile: (profile: any) => void;
  fetchUserProfile: () => Promise<void>;
  checkAuthorization: (status: boolean) => void;
  setUserRole: (role: 'Patient' | 'Hospital' | 'Admin') => void;

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

  // Actions
  connectWallet: (address: string) => void;
  disconnectWallet: () => void;
  authenticateUser: (role?: StaffRole) => void;
  setProfileImage: (image: string) => void;
  addRecord: (record: PatientRecord) => void;
  updateVitals: (vitals: Partial<Vitals>) => void;
  grantAccess: (permission: AccessPermission) => void;
  revokeAccess: (id: string) => void;
  addActivityLog: (log: ActivityLog) => void;

  // Clinical Actions
  addStaff: (staff: StaffMember) => void;
  revokeStaff: (id: string) => void;
  activateEmergency: (patientId: string) => void;
  clearEmergency: () => void;
}

export const useAppStore = create<AppState>()(
  (set) => ({
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
      const { data: { session } } = await (await import('./supabaseClient')).supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await (await import('./supabaseClient')).supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (data && !error) {
        set((state) => ({
          userProfile: data,
          userVitals: {
            ...state.userVitals,
            fullName: data.full_name,
            dob: data.dob,
            bloodType: data.blood_group || state.userVitals.bloodType,
            genotype: data.genotype || state.userVitals.genotype,
            religion: data.religion,
            weight: data.weight || state.userVitals.weight,
            height: data.height || state.userVitals.height,
          }
        }));
      }
    },
    setUserRole: (role) => set({ userRole: role }),
    profileImage: null,
    userVitals: {
      bloodType: 'O+',
      genotype: 'AA',
      allergies: ['Penicillin', 'Peanuts'],
      conditions: ['Mild Asthma'],
      medications: ['Albuterol (As needed)'],
      bloodPressure: '118/72',
      glucose: '92 mg/dL',
      bmi: 21.8,
      weight: 68,
      height: 175,
      lastCheckup: '2024-12-10',
    },
    records: [
      {
        id: '1',
        name: 'Annual Blood Panel',
        type: 'Lab Result',
        date: '2024-12-10',
        facility: 'Mayo Clinic',
        doctor: 'Dr. Sarah Chen',
        ipfsHash: 'QmXoyp...891',
        category: 'Laboratory',
      }
    ],
    accessPermissions: [
      {
        id: 'p1',
        entityName: 'Johns Hopkins Medical',
        entityAddress: '0x71C...345a',
        grantedDate: '2024-10-15',
        level: 'Full',
      }
    ],
    activityLogs: [
      {
        id: 'l1',
        date: '2024-12-28 14:30',
        actor: 'Johns Hopkins Medical',
        action: 'Viewed',
        txHash: '0xab12...ef34',
      }
    ],

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

    connectWallet: (address) => set({ walletAddress: address, isConnected: true, isAuthenticated: true }),
    disconnectWallet: () => set({ walletAddress: null, isConnected: false, isAuthenticated: false, currentStaff: null }),
    authenticateUser: (role) => {
      if (role) {
        const staff = { id: 's_current', name: 'Dr. Staff User', role, walletAddress: '0xCUSTOM', status: 'Active' } as StaffMember;
        set({ isAuthenticated: true, currentStaff: staff });
      } else {
        set({ isAuthenticated: true });
      }
    },
    setProfileImage: (image) => set({ profileImage: image }),
    addRecord: (record) => set((state) => ({
      records: [record, ...state.records],
      activityLogs: [{
        id: Math.random().toString(36).substring(2, 9),
        date: new Date().toLocaleString(),
        actor: 'You',
        action: 'Uploaded',
        txHash: '0x' + Math.random().toString(16).substring(2, 12),
      }, ...state.activityLogs]
    })),
    updateVitals: (vitals) => set((state) => ({ userVitals: { ...state.userVitals, ...vitals } })),
    grantAccess: (permission) => set((state) => ({
      accessPermissions: [permission, ...state.accessPermissions],
      activityLogs: [{
        id: Math.random().toString(36).substring(2, 9),
        date: new Date().toLocaleString(),
        actor: 'You',
        action: 'Access Granted',
        txHash: '0x' + Math.random().toString(16).substring(2, 12),
      }, ...state.activityLogs]
    })),
    revokeAccess: (id) => set((state) => ({
      accessPermissions: state.accessPermissions.filter(p => p.id !== id),
      activityLogs: [{
        id: Math.random().toString(36).substring(2, 9),
        date: new Date().toLocaleString(),
        actor: 'You',
        action: 'Access Revoked',
        txHash: '0x' + Math.random().toString(16).substring(2, 12),
      }, ...state.activityLogs]
    })),
    addActivityLog: (log) => set((state) => ({ activityLogs: [log, ...state.activityLogs] })),

    addStaff: (staff) => set((state) => ({ staffMembers: [staff, ...state.staffMembers] })),
    revokeStaff: (id) => set((state) => ({ staffMembers: state.staffMembers.filter(s => s.id !== id) })),
    activateEmergency: (patientId) => set({
      emergencyAccess: {
        isActive: true,
        expiresAt: Date.now() + 5 * 60 * 1000,
        patientId
      }
    }),
    clearEmergency: () => set({ emergencyAccess: { isActive: false, expiresAt: null, patientId: null } }),
    checkAuthorization: (status) => set({ isAuthorized: status })
  })
);
