"use client";

import { motion } from "framer-motion";
import { Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VerificationStatusBannerProps {
    status: "pending" | "verified" | "rejected";
    rejectionReason?: string | null;
}

export function VerificationStatusBanner({ status, rejectionReason }: VerificationStatusBannerProps) {
    const statusConfig = {
        pending: {
            icon: Clock,
            label: "Pending Verification",
            bgColor: "bg-yellow-500/10",
            borderColor: "border-yellow-500/30",
            textColor: "text-yellow-400",
            badgeBg: "bg-yellow-500/20",
            badgeText: "text-yellow-300",
            message: "Your account is under review. You can only access Settings until verification is complete.",
        },
        verified: {
            icon: CheckCircle2,
            label: "Verified",
            bgColor: "bg-emerald-500/10",
            borderColor: "border-emerald-500/30",
            textColor: "text-emerald-400",
            badgeBg: "bg-emerald-500/20",
            badgeText: "text-emerald-300",
            message: "Your hospital account is fully verified and active.",
        },
        rejected: {
            icon: XCircle,
            label: "Verification Rejected",
            bgColor: "bg-red-500/10",
            borderColor: "border-red-500/30",
            textColor: "text-red-400",
            badgeBg: "bg-red-500/20",
            badgeText: "text-red-300",
            message: "Your verification was rejected. Please update your information and resubmit.",
        },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${config.bgColor} border ${config.borderColor} rounded-lg px-4 py-2.5 flex items-center gap-3`}
        >
            <motion.div
                animate={status === "pending" ? { scale: [1, 1.2, 1] } : {}}
                transition={{ repeat: status === "pending" ? Infinity : 0, duration: 2 }}
            >
                <Icon className={`w-5 h-5 ${config.textColor}`} />
            </motion.div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <Badge className={`${config.badgeBg} ${config.badgeText} border-none text-[10px] uppercase font-bold px-2 py-0.5`}>
                        {config.label}
                    </Badge>
                    {status !== "verified" && (
                        <span className="text-xs text-gray-400 hidden md:inline">
                            {config.message}
                        </span>
                    )}
                </div>

                {status === "rejected" && rejectionReason && (
                    <div className="mt-1 flex items-start gap-2">
                        <AlertCircle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-red-300/80">
                            <span className="font-semibold">Reason:</span> {rejectionReason}
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
