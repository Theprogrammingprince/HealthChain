import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  bloodType: string;
  genotype: string;
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

  // Admin Side (Registry)
  verificationRequests: {
    id: string;
    name: string;
    address: string;
    license: string;
    status: 'Pending' | 'Verified' | 'Rejected';
    timestamp: string;
  }[];
  paymasterBalance: number;
  complianceScore: number;

  // Admin Actions
  verifyHospital: (id: string) => void;
  rejectHospital: (id: string) => void;
  topUpPaymaster: (amount: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      walletAddress: null,
      isConnected: false,
      isAuthenticated: false,
      profileImage: null,
      // ... existing initial state ...
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

      // Admin Initial State
      verificationRequests: [
        { id: 'v1', name: 'Cleveland Clinic', address: '0x442...991a', license: 'MED-2024-991', status: 'Pending', timestamp: '2024-12-29 09:15' },
        { id: 'v2', name: 'Berlin Charité', address: '0x881...b22c', license: 'EU-DE-8821', status: 'Verified', timestamp: '2024-12-28 14:20' },
        { id: 'v3', name: 'Tokyo General', address: '0x112...f44d', license: 'JP-TK-1192', status: 'Pending', timestamp: '2024-12-30 08:45' },
      ],
      paymasterBalance: 2450.50,
      complianceScore: 98,

      connectWallet: (address) => set({ walletAddress: address, isConnected: true }),
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

      // Admin Implementations
      verifyHospital: (id) => set((state) => ({
        verificationRequests: state.verificationRequests.map(req =>
          req.id === id ? { ...req, status: 'Verified' } : req
        )
      })),
      rejectHospital: (id) => set((state) => ({
        verificationRequests: state.verificationRequests.map(req =>
          req.id === id ? { ...req, status: 'Rejected' } : req
        )
      })),
      topUpPaymaster: (amount) => set((state) => ({ paymasterBalance: state.paymasterBalance + amount })),
    }),
    {
      name: 'healthchain-storage',
    }
  )
);
