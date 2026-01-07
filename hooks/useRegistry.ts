"use client";

import { useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'sonner';

import { APP_CONFIG } from '@/lib/config';

// Address of the deployed HealthcareRegistry contract
// Replace with actual deployed address after deployment
const REGISTRY_CONTRACT_ADDRESS = APP_CONFIG.REGISTRY_CONTRACT_ADDRESS;

const REGISTRY_ABI = [
    "function isAuthorized(address hospital) external view returns (bool)",
    "function getHospitalDetails(address hospital) external view returns (tuple(bool isWhitelisted, string name, bytes32 licenseHash, address adminWallet, uint256 createdAt, bool isRevoked))"
];

export function useRegistry() {
    const [loading, setLoading] = useState(false);

    /**
     * Checks if a wallet address is authorized by the HealthcareRegistry
     * @param address The wallet address to check
     * @returns boolean - true if authorized, false otherwise
     */
    const checkHospitalStatus = async (address: string): Promise<boolean> => {
        setLoading(true);
        try {
            // Real Implementation
            if (typeof window.ethereum !== 'undefined') {
                const provider = new ethers.BrowserProvider(window.ethereum as any);
                // Note: For reading 'isAuthorized', we don't strictly need a signer, provider is enough.
                // But if we want to support non-connected reads, we'd need a JsonRpcProvider.
                // For this Admin Dashboard, we assume the admin is connected.

                // If contract not deployed yet (address is 0x0), fallback to mock
                if (REGISTRY_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
                    console.warn("Registry Contract Address not set. Using Mock.");
                    // Mock Fallback
                    await new Promise(resolve => setTimeout(resolve, 800));
                    if (address.toLowerCase().includes("revoked")) return false;
                    if (address.toLowerCase().includes("unauthorized")) return false;
                    return true;
                }

                const contract = new ethers.Contract(REGISTRY_CONTRACT_ADDRESS, REGISTRY_ABI, provider);
                const isAuthorized = await contract.isAuthorized(address);
                console.log(`Registry status for ${address}: ${isAuthorized}`);
                return isAuthorized;
            }

            return false; // No provider = unauthorized     */

        } catch (error) {
            console.error("Registry check failed:", error);
            toast.error("Failed to verify hospital status");
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        checkHospitalStatus,
        loading
    };
}
