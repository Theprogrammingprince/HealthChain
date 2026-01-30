# HealthChain 🏥⛓️

**Decentralized Medical Records Ecosystem on Polygon**

HealthChain is a state-of-the-art, patient-centric healthcare platform that leverages blockchain technology to ensure security, transparency, and data portability. By combining the speed of Polygon with the robust features of Supabase and Biconomy, HealthChain provides a seamless experience for patients, doctors, and medical institutions.

---

## 🌟 Vision
To empower patients with full ownership of their medical data while providing healthcare professionals with a trusted, interoperable "Circle of Trust" for seamless record sharing.

---

## 🚀 Key Features

### 👤 Patient Empowerment
- **Self-Sovereign Identity**: Connect via traditional auth (Google/Email) or Web3 wallets (MetaMask/WalletConnect).
- **Access Control**: Patients use the `HealthRecords` smart contract to grant or revoke access to specific hospitals/doctors.
- **Unified Health Record**: View all medical history (lab reports, prescriptions, imaging) in one glassmorphic dashboard.

### 🏥 Professional Portal (Hospitals & Doctors)
- **Circle of Trust**: Only verified institutions whitelisted in the `HealthcareRegistry` can participate in the ecosystem.
- **Secure Uploads**: Doctors can upload encrypted medical record references (IPFS hashes) directly to the blockchain.
- **Verification Workflow**: A multi-stage status system (Pending 🟡, Verified 🟢, Rejected 🔴) ensures only legitimate providers are active.

### 🛡️ Administrative Governance
- **Registry Management**: SuperAdmins manage the on-chain whitelist and can "kill-switch" compromised or fraudulent entities.
- **Gasless Transactions**: Integrated **Biconomy Paymaster** allows users to interact with the blockchain without holding native tokens (MATIC).
- **Security Audits**: Real-time monitoring of gas usage and security logs with simulated ZK Proof verification.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js (App Router), Tailwind CSS, Shadcn UI, Framer Motion, Recharts |
| **Backend** | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| **Blockchain** | Solidity, Hardhat, Ethers.js, Polygon (Amoy Testnet) |
| **Infrastructure** | Biconomy (Paymaster/Smart Accounts), Reown (formerly WalletConnect) |
| **Utilities** | Lucide React, Zod (Validation), Date-fns |

---

## 🏗️ Technical Architecture

### 🛡️ Smart Contracts (`/smart-contracts/contracts`)
1. **`HealthcareRegistry.sol`**: Manages the "Circle of Trust". Uses OpenZeppelin's `AccessControl` to handle SuperAdmin and Hospital roles.
2. **`HealthRecords.sol`**: The core data layer. Stores IPFS CIDs for records and maintains a mapping of patient-provider access permissions.

### 🗄️ Database Schema
The off-chain data is managed in Supabase with strict **Row Level Security (RLS)**:
- `users`: Core identity and role management.
- `patient_profiles`: Personal health metadata and emergency contacts.
- `hospital_profiles`: Institutional details and verification documents (CAC/MDCN licenses).
- `doctor_profiles`: Practitioner-specific data and statistics.

---

## 📂 Project Structure

```bash
├── app/                  # Next.js App Router (Dashboards, Auth, Marketing)
├── components/           # UI Design System (Shadcn, Features, Layout)
├── lib/                  # Services (Supabase Client, Database CRUD, Store)
├── smart-contracts/      # Solidity Contracts, Scripts, and Deployment
├── public/               # Static Assets and Design Tokens
├── supabase/             # Edge Functions and DB Configurations
└── database/             # Documentation and Schema Snapshots
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js v18+
- Supabase Account
- Polygon Amoy RPC & Private Key (for contract deployment)

### Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   cd smart-contracts && npm install && cd ..
   ```

2. **Environment Configuration**
   Create a `.env.local` with your Supabase and Biconomy credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   NEXT_PUBLIC_PROJECT_ID=... # Reown Project ID
   ```

3. **Smart Contract Deployment**
   ```bash
   cd smart-contracts
   npx hardhat run scripts/deploy-registry.ts --network amoy
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

---

## 🛡️ Security & Privacy
- **Encryption**: Record content is intended to be encrypted before IPFS upload (Implementation in progress).
- **On-Chain Access Control**: Access is enforced at the contract level; even if a hash is known, the uploader must be authorized.
- **Audit Logs**: Every critical action is logged for transparency and auditability.

---

## 📄 License
This project is licensed under the MIT License.
