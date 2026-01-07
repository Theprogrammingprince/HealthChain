"use client";

import { useState } from "react";
import { APP_CONFIG } from '@/lib/config';

// ... (imports)

// Inside component
// Get address from config
const REGISTRY_ADDR = APP_CONFIG.REGISTRY_CONTRACT_ADDRESS;

import { ethers } from "ethers";
import { CheckCircle, XCircle, ExternalLink, ShieldAlert, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// Mock Data
const MOCK_HOSPITALS = [
    { address: "0x71C...9A21", name: "Lagos University Teaching Hospital", license: "MDCN-2910-X", status: "Pending", date: "2023-10-24" },
    { address: "0x3A2...B190", name: "Reddington Hospital", license: "MDCN-8821-Y", status: "Verified", date: "2023-09-12" },
    { address: "0x9B1...C221", name: "General Hospital Gbagada", license: "MDCN-1102-Z", status: "Pending", date: "2023-10-25" },
];

export default function HospitalVerificationTable() {
    const [hospitals, setHospitals] = useState(MOCK_HOSPITALS);
    const [loading, setLoading] = useState<string | null>(null);
    const [revokeReason, setRevokeReason] = useState("");
    const [selectedHospital, setSelectedHospital] = useState<any>(null);

    const handleWhitelist = async (hospital: any) => {
        setLoading(hospital.address);
        try {
            if (typeof window.ethereum !== 'undefined') {
                const provider = new ethers.BrowserProvider(window.ethereum as any);
                const signer = await provider.getSigner();

                // Placeholder Address - Replace with env variable
                const REGISTRY_ADDR = "0x0000000000000000000000000000000000000000";

                if (REGISTRY_ADDR === "0x0000000000000000000000000000000000000000") {
                    // Mock Fallback
                    await new Promise(resolve => setTimeout(resolve, 2000));
                } else {
                    // Real Contract Call
                    const contract = new ethers.Contract(REGISTRY_ADDR, [
                        "function whitelistHospital(address, string, bytes32) external"
                    ], signer);

                    // Generate a random license hash if none provided (mocking the hash part)
                    const licenseHash = ethers.id(hospital.license || "LICENSE_PENDING");

                    const tx = await contract.whitelistHospital(hospital.address, hospital.name, licenseHash);
                    console.log("Tx submitted:", tx.hash);
                    await tx.wait();
                }
            }

            setHospitals(prev => prev.map(h => h.address === hospital.address ? { ...h, status: "Verified" } : h));
            toast.success(`Hospital ${hospital.name} whitelisted successfully`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to whitelist hospital");
        } finally {
            setLoading(null);
        }
    };

    const handleRevoke = async () => {
        if (!selectedHospital) return;
        setLoading(selectedHospital.address);
        try {
            if (typeof window.ethereum !== 'undefined') {
                const provider = new ethers.BrowserProvider(window.ethereum as any);
                const signer = await provider.getSigner();

                const REGISTRY_ADDR = "0x0000000000000000000000000000000000000000";

                if (REGISTRY_ADDR === "0x0000000000000000000000000000000000000000") {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                } else {
                    const contract = new ethers.Contract(REGISTRY_ADDR, [
                        "function revokeHospital(address, string) external"
                    ], signer);

                    const tx = await contract.revokeHospital(selectedHospital.address, revokeReason);
                    await tx.wait();
                }
            }

            setHospitals(prev => prev.map(h => h.address === selectedHospital.address ? { ...h, status: "Revoked" } : h));
            toast.error(`Hospital ${selectedHospital.name} revoked: ${revokeReason}`);
            setRevokeReason("");
            setSelectedHospital(null);
        } catch (error) {
            console.error(error);
            toast.error("Failed to revoke access");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                <h3 className="text-lg font-medium text-white">Pending Applications</h3>
                <div className="flex gap-2">
                    <Input placeholder="Search address..." className="max-w-xs bg-gray-950 border-gray-800" />
                </div>
            </div>

            <Table>
                <TableHeader className="bg-gray-950">
                    <TableRow className="border-gray-800 hover:bg-gray-950">
                        <TableHead className="text-gray-400">Hospital Name</TableHead>
                        <TableHead className="text-gray-400">License Info</TableHead>
                        <TableHead className="text-gray-400">Date Applied</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-right text-gray-400">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {hospitals.map((hospital) => (
                        <TableRow key={hospital.address} className="border-gray-800 hover:bg-gray-800/50 transition-colors">
                            <TableCell className="font-medium text-white">
                                {hospital.name}
                                <div className="text-xs text-gray-500 font-mono mt-1">{hospital.address}</div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2 text-gray-300">
                                    <FileText className="w-4 h-4 text-[#00BFFF]" />
                                    {hospital.license}
                                </div>
                            </TableCell>
                            <TableCell className="text-gray-400">{hospital.date}</TableCell>
                            <TableCell>
                                {hospital.status === "Verified" && <Badge className="bg-[#10B981]/20 text-[#10B981] hover:bg-[#10B981]/30 border-0">Verified</Badge>}
                                {hospital.status === "Pending" && <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 border-0">Pending</Badge>}
                                {hospital.status === "Revoked" && <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border-0">Revoked</Badge>}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>

                                    {hospital.status === "Pending" && (
                                        <Button
                                            onClick={() => handleWhitelist(hospital)}
                                            disabled={loading === hospital.address}
                                            size="sm"
                                            className="bg-[#00BFFF] hover:bg-[#00BFFF]/80 text-white h-8"
                                        >
                                            {loading === hospital.address ? <Loader2 className="h-4 w-4 animate-spin" /> : "Whitelist"}
                                        </Button>
                                    )}

                                    {hospital.status === "Verified" && (
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    onClick={() => setSelectedHospital(hospital)}
                                                    variant="destructive"
                                                    size="sm"
                                                    className="bg-red-500/10 text-red-500 hover:bg-red-500/20 h-8 border border-red-500/50"
                                                >
                                                    Revoke
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="bg-[#0A0A0A] border-gray-800 text-white">
                                                <DialogHeader>
                                                    <DialogTitle className="flex items-center gap-2 text-red-500">
                                                        <ShieldAlert className="h-5 w-5" />
                                                        Revoke Authorization
                                                    </DialogTitle>
                                                    <DialogDescription className="text-gray-400">
                                                        Are you sure you want to revoke access for <strong>{hospital.name}</strong>?
                                                        This action acts as a "Kill-Switch" and will prevent them from adding new records.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="py-4">
                                                    <Input
                                                        value={revokeReason}
                                                        onChange={(e) => setRevokeReason(e.target.value)}
                                                        placeholder="Enter reason for revocation..."
                                                        className="bg-gray-900 border-gray-800 text-white"
                                                    />
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="ghost" onClick={() => setSelectedHospital(null)} className="text-gray-400">Cancel</Button>
                                                    <Button
                                                        onClick={handleRevoke}
                                                        disabled={!revokeReason || loading === hospital.address}
                                                        className="bg-red-600 hover:bg-red-700 text-white"
                                                    >
                                                        {loading === hospital.address ? "Revoking..." : "Confirm Revoke"}
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
