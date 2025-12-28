'use client';

import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { HealthChainABI } from '@/lib/abi';
import { HEALTH_CHAIN_CONTRACT_ADDRESS } from '@/lib/contracts';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/store';

export function useHealthRecords() {
    const { address: wagmiAddress } = useAccount();
    const { walletAddress } = useAppStore(); // Store address (e.g. from Web3Auth)

    // Prioritize Wagmi address if connected, otherwise use store address
    const address = wagmiAddress || walletAddress;
    const { writeContractAsync } = useWriteContract();

    // 1. Get Records
    // We only fetch if we have an address.
    const { data: records, isLoading: isLoadingRecords, refetch: refetchRecords } = useReadContract({
        address: HEALTH_CHAIN_CONTRACT_ADDRESS,
        abi: HealthChainABI,
        functionName: 'getRecords',
        // By default, trying to read own records
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        }
    });

    // 2. Add Record
    const addRecord = async (patientAddress: string, ipfsHash: string, recordType: string) => {
        try {
            const tx = await writeContractAsync({
                address: HEALTH_CHAIN_CONTRACT_ADDRESS,
                abi: HealthChainABI,
                functionName: 'addRecord',
                args: [patientAddress, ipfsHash, recordType],
            });
            toast.success("Transaction sent! Waiting for confirmation...");
            return tx;
        } catch (error) {
            console.error("Add Record Error:", error);
            toast.error("Failed to add record. See console.");
            throw error;
        }
    };

    // 3. Grant Access
    const grantAccess = async (providerAddress: string) => {
        try {
            const tx = await writeContractAsync({
                address: HEALTH_CHAIN_CONTRACT_ADDRESS,
                abi: HealthChainABI,
                functionName: 'grantAccess',
                args: [providerAddress],
            });
            toast.success("Access granted!");
            return tx;
        } catch (error) {
            console.error(error);
            toast.error("Failed to grant access");
            throw error;
        }
    };

    // 4. Revoke Access
    const revokeAccess = async (providerAddress: string) => {
        try {
            const tx = await writeContractAsync({
                address: HEALTH_CHAIN_CONTRACT_ADDRESS,
                abi: HealthChainABI,
                functionName: 'revokeAccess',
                args: [providerAddress],
            });
            toast.success("Access revoked");
            return tx;
        } catch (error) {
            console.error(error);
            toast.error("Failed to revoke access");
            throw error;
        }
    };

    return {
        records,
        isLoadingRecords,
        refetchRecords,
        addRecord,
        grantAccess,
        revokeAccess
    };
}
