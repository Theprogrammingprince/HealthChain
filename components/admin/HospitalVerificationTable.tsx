"use client";

import { useAppStore } from "@/lib/store";
import { CheckCircle2, XCircle, ShieldAlert } from "lucide-react";

export function HospitalVerificationTable() {
    const { verificationRequests, verifyHospital, rejectHospital } = useAppStore();

    return (
        <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5">
                <h3 className="text-lg font-bold text-white">Pending Verifications</h3>
                <p className="text-xs text-gray-500 mt-1">Review legal credentials before creating DID on-chain.</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-xs text-gray-400 uppercase font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Hospital Entity</th>
                            <th className="px-6 py-4">License / Reg. ID</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {verificationRequests.map((req) => (
                            <tr key={req.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-white">{req.name}</div>
                                    <div className="text-[10px] text-gray-500 font-mono">{req.address}</div>
                                    <div className="text-[10px] text-gray-600 mt-0.5">{req.timestamp}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="inline-flex items-center gap-2 px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20 text-xs font-mono">
                                        {req.license}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={req.status} />
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    {req.status === 'Pending' && (
                                        <>
                                            <button
                                                onClick={() => verifyHospital(req.id)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-600/50 transition-colors"
                                            >
                                                <CheckCircle2 size={12} />
                                                Whiteist
                                            </button>
                                            <button
                                                onClick={() => rejectHospital(req.id)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 text-xs font-bold rounded-lg border border-red-600/30 transition-colors"
                                            >
                                                <XCircle size={12} />
                                                Reject
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {verificationRequests.length === 0 && (
                <div className="p-12 text-center text-gray-500 text-sm">
                    No pending verification requests. The queue is clear.
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'Verified') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wide border border-emerald-500/20">
                <CheckCircle2 size={10} />
                Verified
            </span>
        );
    }
    if (status === 'Rejected') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-wide border border-red-500/20">
                <XCircle size={10} />
                Rejected
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase tracking-wide border border-yellow-500/20">
            <ShieldAlert size={10} />
            Pending
        </span>
    );
}
