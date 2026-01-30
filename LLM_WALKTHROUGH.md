# HealthChain: Comprehensive Progress Walkthrough (LLM-Ready)

This document provides a technical deep-dive into the current state of HealthChain, designed to help an LLM understand the architecture, data flows, and progress made so far.

---

## 1. System Overview
**HealthChain** is a decentralized health information exchange (HIE) platform. Its core mission is to bridge the gap between traditional healthcare silos and patient data ownership using blockchain and decentralized storage.

### Core Value Propositions:
- **Interoperability**: Seamless sharing between verified hospitals.
- **Privacy**: Patient-controlled access via smart contract permissions.
- **Gasless UX**: Account Abstraction (ERC-4337) via Biconomy to remove onboarding friction.

---

## 2. Technical Architecture

### Frontend (Next.js 15+ App Router)
- **Styling**: Tailwind CSS + Shadcn UI.
- **Theme**: Premium glassmorphic dark mode (`bg-[#0A0A0A]`).
- **State Management**: Zustand (`lib/store.ts`) for global auth, wallet, and dashboard states.
- **Animations**: Framer Motion for high-fidelity transitions.

### Backend (Supabase)
- **Authentication**: Hybrid model.
  - **Social/Email**: Supabase Auth (Google, Email/Password).
  - **Web3**: Wallet connection via Reown (WalletConnect/AppKit).
- **Database**: PostgreSQL with Row Level Security (RLS).
- **Storage**: Supabase Storage for certificates (e.g., license uploads).

### Blockchain Layer (Polygon Amoy Testnet)
- **Providers**: Biconomy (Paymaster & Bundler) for gasless transactions.
- **Protocol**: Ethers.js v6 for contract interaction.
- **Indexing**: Currently using direct contract calls (The Graph integration planned).

---

## 3. Data Models & Database Schema

### `public.users` (The Identity Anchor)
- `id`: UUID (FK to auth.users).
- `role`: `patient`, `hospital`, `admin`, `doctor`.
- `wallet_address`: Unique identifier for blockchain interactions.
- `auth_provider`: `google`, `wallet`, `email`.

### Extended Profiles
- **`patient_profiles`**: DOB, blood type, emergency contacts, medical flags.
- **`hospital_profiles`**: Verification status (`pending`, `verified`, `rejected`), license hashes, institutional metadata.
- **`doctor_profiles`**: Specialty, hospital affiliation, practitioner verification status.

---

## 4. Smart Contract Logic

### `HealthcareRegistry.sol` (Circle of Trust)
- **Function**: Whitelists medical institutions.
- **Role**: `SUPER_ADMIN_ROLE` can `whitelistHospital` or `revokeHospital`.
- **States**: `isWhitelisted` vs `isRevoked` (The "Kill-Switch").

### `HealthRecords.sol` (Record Ledger)
- **Data**: Stores `Record` structs containing IPFS CIDs, record types, and timestamps.
- **Access Control**: 
  - `grantAccess(address provider)`: Patient grants a hospital permission.
  - `addRecord(address patient, ...)`: Only authorized providers or the patient can add hashes.
  - `isAuthorized(address patient, address provider)`: View-only check for UI logic.

---

## 5. Workflow Implementation Status

### ✅ Completed & Functional
1. **Hybrid Onboarding**: Users can sign up as Patient or Hospital via Google or Wallet.
2. **Hospital verification system**: 
   - Multi-step form for documentation and license upload.
   - Admin panel for reviewing and approving/rejecting hospitals.
   - Rejection reason feedback loop.
3. **Dashboards**:
   - **Admin Hub**: Gas monitoring (Paymaster), Hospital whitelisting, Security logs.
   - **Doctor Hub**: Clinical record upload system (Zod-validated), patient search (mocked/basic), recent submission monitoring.
   - **Patient Hub**: Basic medical history view, notification system.
4. **Global Store**: Centralized `useAppStore` handles session sync and wallet connectivity state.

### 🚧 In-Progress
- **IPFS Integration**: Moving from mock hashes to actual Filecoin/IPFS storage via `/api/ipfs`.
- **Encryption**: Client-side encryption of records before upload.
- **Doctor Verification**: Currently sharing the hospital verification logic; needs specialized MDCN flow.

### 📋 Planned (Backlog)
- **ZK Proofs**: Private verification of records without revealing content (ZK-SNARKs).
- **Staff Management**: Hospital admins inviting doctors to their institutional sub-accounts.
- **Real-time Notifications**: WebSockets for record approval/rejection updates.

---

## 6. Key Files & Entry Points

- **`lib/database.service.ts`**: The glue between the UI and Supabase. Contains all CRUD logic.
- **`lib/store.ts`**: Critical Zustand store. If an LLM is confused about "where the user data comes from", check here.
- **`app/clinical/dashboard/page.tsx`**: Main entry for hospital admins.
- **`app/doctor/dashboard/page.tsx`**: Main entry for practitioners.
- **`components/features/AuthDialog.tsx`**: The modal that handles the complex hybrid auth logic.

---

## 7. Developer Instructions for LLMs
- **Typing**: Use the interfaces defined in `lib/database.types.ts`.
- **Styling**: Stick to the `emerald-500` accent color and `glass-card` styling patterns.
- **Auth**: Always check `useAppStore.getState().supabaseSession` before performing DB operations.
- **Blockchain**: Contract interactions should use the ABIs in `lib/abi.ts` and ideally go through the Biconomy Smart Account wrapper if `walletAddress` is present.
