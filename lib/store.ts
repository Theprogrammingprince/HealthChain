import { create } from 'zustand';

export interface PatientRecord {
  id: string;
  name: string;
  type: 'PDF' | 'Image' | 'Lab' | 'Prescription';
  date: string;
  ipfsHash: string;
}

interface AppState {
  walletAddress: string | null;
  isConnected: boolean;
  isAuthenticated: boolean;
  records: PatientRecord[];
  connectWallet: (address: string) => void;
  disconnectWallet: () => void;
  authenticateUser: () => void;
  addRecord: (record: PatientRecord) => void;
}

export const useAppStore = create<AppState>((set) => ({
  walletAddress: null,
  isConnected: false,
  isAuthenticated: false,
  records: [
    {
      id: '1',
      name: 'Blood Test Results.pdf',
      type: 'Lab',
      date: '2025-10-23',
      ipfsHash: 'QmX...fake1',
    },
    {
      id: '2',
      name: 'MRI Scan - Knee.jpg',
      type: 'Image',
      date: '2025-09-15',
      ipfsHash: 'QmY...fake2',
    },
    {
      id: '3',
      name: 'Vaccination History.pdf',
      type: 'PDF',
      date: '2025-01-10',
      ipfsHash: 'QmZ...fake3',
    },
  ],
  connectWallet: (address) => set({ walletAddress: address, isConnected: true }),
  disconnectWallet: () => set({ walletAddress: null, isConnected: false, isAuthenticated: false }),
  authenticateUser: () => set({ isAuthenticated: true }),
  addRecord: (record) => set((state) => ({ records: [record, ...state.records] })),
}));
