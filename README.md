# Health Chain (HC) - Admin & Governance Dashboard

The "Circle of Trust" Registry for Health Chain. This dashboard allows SuperAdmins to manage authorized hospitals, monitor gas usage via Biconomy Paymaster, and view security audit logs.

## Features

- **Hospital Verification**: Whitelist or Revoke (Kill-Switch) hospitals on-chain.
- **Paymaster Monitoring**: Visual "Fuel Gauge" and usage charts for gas management.
- **Audit Logs**: Filterable security events with CSV export and ZK Proof simulation.
- **Smart Contract**: `HealthcareRegistry.sol` using OpenZeppelin AccessControl.

## Prerequisites

- Node.js v18+
- Hardhat
- Metamask or compatible wallet

## Setup

1.  **Install Dependencies**
    ```bash
    npm install
    cd smart-contracts
    npm install
    cd ..
    ```

2.  **Smart Contract (Local/Testnet)**
    
    Compile the contract:
    ```bash
    cd smart-contracts
    npx hardhat compile
    ```

    Deploy (Polygon Amoy/Mumbai):
    ```bash
    # Set your private key in .env (see hardhat.config.ts)
    npx hardhat run scripts/deploy-registry.ts --network amoy
    ```

3.  **Run Frontend**
    ```bash
    npm run dev
    ```
    Navigate to `http://localhost:3000/admin`.

## Project Structure

- `app/admin/`: Admin Dashboard Page.
- `components/admin/`: Admin components (HospitalVerificationTable, PaymasterMonitor, AuditLogs).
- `smart-contracts/`: Solidity contracts and scripts.

## Key Technologies
- **Frontend**: Next.js, Tailwind, Shadcn UI, Framer Motion, Recharts.
- **Blockchain**: Solidity, Hardhat, Ethers.js.
- **Security**: OpenZeppelin, PapaParse (Logs), ZK Simulations.

## License
MIT
