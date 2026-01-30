"use client";

import { motion } from "framer-motion";
import {
    FileText,
    ClipboardCheck,
    Bell,
    Activity,
    Plus,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type EmptyStateType = "records" | "pending" | "notifications" | "activity" | "submissions";

interface EmptyStateProps {
    type: EmptyStateType;
    title?: string;
    description?: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
}

const defaultContent: Record<EmptyStateType, {
    icon: React.ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
}> = {
    records: {
        icon: <FileText className="w-10 h-10 text-gray-600" />,
        title: "No Medical Records Yet",
        description: "Your approved medical records will appear here. Once a healthcare provider submits a record and you approve it, it will be visible.",
        actionLabel: "Learn More",
        actionHref: "/documentation"
    },
    pending: {
        icon: <ClipboardCheck className="w-10 h-10 text-gray-600" />,
        title: "No Pending Approvals",
        description: "You're all caught up! When a doctor submits a record that needs your approval, it will appear here.",
    },
    notifications: {
        icon: <Bell className="w-10 h-10 text-gray-600" />,
        title: "No Notifications",
        description: "You don't have any notifications yet. We'll notify you when there's activity on your account."
    },
    activity: {
        icon: <Activity className="w-10 h-10 text-gray-600" />,
        title: "No Activity Yet",
        description: "Your activity log is empty. When you or others interact with your records, it will be logged here."
    },
    submissions: {
        icon: <FileText className="w-10 h-10 text-gray-600" />,
        title: "No Submissions Yet",
        description: "You haven't submitted any medical records yet. Create your first submission to get started.",
        actionLabel: "Create Record",
        actionHref: "/doctor/dashboard/submit"
    }
};

export function EmptyState({
    type,
    title,
    description,
    actionLabel,
    actionHref,
    onAction
}: EmptyStateProps) {
    const content = defaultContent[type];
    const displayTitle = title || content.title;
    const displayDescription = description || content.description;
    const displayActionLabel = actionLabel || content.actionLabel;
    const displayActionHref = actionHref || content.actionHref;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-16 px-6 text-center"
        >
            {/* Icon */}
            <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6"
            >
                {content.icon}
            </motion.div>

            {/* Title */}
            <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-bold text-gray-300 mb-2"
            >
                {displayTitle}
            </motion.h3>

            {/* Description */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-gray-500 max-w-md mb-6 leading-relaxed"
            >
                {displayDescription}
            </motion.p>

            {/* Action Button */}
            {(displayActionLabel && (displayActionHref || onAction)) && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    {displayActionHref ? (
                        <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/5">
                            <Link href={displayActionHref}>
                                {displayActionLabel}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={onAction}
                            className="border-white/20 text-white hover:bg-white/5"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {displayActionLabel}
                        </Button>
                    )}
                </motion.div>
            )}

            {/* Decorative dots */}
            <div className="flex items-center gap-2 mt-8">
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 0.3, scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="w-1.5 h-1.5 rounded-full bg-white/30"
                    />
                ))}
            </div>
        </motion.div>
    );
}
