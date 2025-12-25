# HealthChain Smart Contracts

This directory contains the blockchain logic for the HealthChain application.

## Structure
- `contracts/`: Solidity smart contracts (.sol files)
- `scripts/`: Deployment and maintenance scripts
- `test/`: Hardhat tests for smart contracts

## Tech Stack
- **Framework**: Hardhat (Pinned to v2.18.3 for Windows compatibility)
- **Language**: Solidity
- **Network**: Polygon (Amoy Testnet / Mainnet)

> **Note for Windows Users**: Do not upgrade `hardhat` to newer versions blindly. Version 2.18.3 is used to avoid `ERR_DLOPEN_FAILED` issues with native binaries.
