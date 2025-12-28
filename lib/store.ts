import { create } from 'zustand';

export type RecordType = 'PDF' | 'Image' | 'Lab' | 'Prescription' | 'Scan';

export interface PatientRecord {
  id: string;
  name: string;
  type: RecordType;
  date: string;
  facility?: string;
  doctor?: string;
  notes?: string;
  ipfsHash: string;
}

export interface Vitals {
  bloodType: string;
  genotype: string;
  allergies: string[];
  bloodPressure: string;
  glucose: string;
  bmi: number;
  weight: number;
  height: number;
  lastCheckup: string;
}

interface AppState {
  walletAddress: string | null;
  isConnected: boolean;
  isAuthenticated: boolean;
  profileImage: string | null;
  userVitals: Vitals;
  records: PatientRecord[];
  connectWallet: (address: string) => void;
  disconnectWallet: () => void;
  authenticateUser: () => void;
  setProfileImage: (image: string) => void;
  addRecord: (record: PatientRecord) => void;
  updateVitals: (vitals: Partial<Vitals>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  walletAddress: null,
  isConnected: false,
  isAuthenticated: false,
  profileImage: null,
  userVitals: {
    bloodType: 'O+',
    genotype: 'AA',
    allergies: ['Penicillin', 'Peanuts'],
    bloodPressure: '120/80',
    glucose: '95 mg/dL',
    bmi: 22.5,
    weight: 70, // kg
    height: 176, // cm
    lastCheckup: '2025-11-15',
  },
  records: [
    {
      id: '1',
      name: 'Complete Blood Count (CBC)',
      type: 'Lab',
      date: '2025-10-23',
      facility: 'City General Hospital',
      doctor: 'Dr. Sarah Wilson',
      ipfsHash: 'QmX...fake1',
    },
    {
      id: '2',
      name: 'Knee MRI Scan',
      type: 'Scan',
      date: '2025-09-15',
      facility: 'Advanced Imaging Center',
      doctor: 'Dr. Michael Chen',
      ipfsHash: 'QmY...fake2',
    },
    {
      id: '3',
      name: 'Annual Vaccination Record',
      type: 'PDF',
      date: '2025-01-10',
      facility: 'HealthFirst Clinic',
      doctor: 'Dr. Emily Brown',
      ipfsHash: 'QmZ...fake3',
    },
  ],
  connectWallet: (address) => set({ walletAddress: address, isConnected: true }),
  disconnectWallet: () => set({ walletAddress: null, isConnected: false, isAuthenticated: false }),
  authenticateUser: () => set({ isAuthenticated: true }),
  setProfileImage: (image) => set({ profileImage: image }),
  addRecord: (record) => set((state) => ({ records: [record, ...state.records] })),
  updateVitals: (vitals) => set((state) => ({ userVitals: { ...state.userVitals, ...vitals } })),
}));
